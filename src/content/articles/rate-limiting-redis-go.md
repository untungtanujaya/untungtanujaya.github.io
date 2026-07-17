---
title: "Rate Limiting Logins with Redis in Go: Fixed Windows, TTL-Once, and Failing Open"
subtitle: "Redis & Fixed Windows"
summary: "A login endpoint without a rate limiter is an open invitation to credential stuffing — an attacker throws thousands of password guesses at one account, or sprays one password across thousands of accounts, and nothing stops them. The usual fix is \"N attempts per M minutes,\" but a surprising number of implementations get the details wrong: they reset the window on every attempt (so the limit never actually triggers), they store the raw email as the key (so the rate-limit store becomes a list of your users), or they lock everyone out the moment Redis hiccups. This post walks through a small, correct distributed rate limiter in Go built on Redis — with the three details that matter: a *true* fixed window, a key you can't reverse, and failing **open** instead of closed."
pubDate: 2026-06-15
read_time: 5
slug: "rate-limiting-redis-go"
---
A login endpoint without a rate limiter is an open invitation to credential stuffing — an attacker throws thousands of password guesses at one account, or sprays one password across thousands of accounts, and nothing stops them. The usual fix is "N attempts per M minutes," but a surprising number of implementations get the details wrong: they reset the window on every attempt (so the limit never actually triggers), they store the raw email as the key (so the rate-limit store becomes a list of your users), or they lock everyone out the moment Redis hiccups. This post walks through a small, correct distributed rate limiter in Go built on Redis — with the three details that matter: a *true* fixed window, a key you can't reverse, and failing **open** instead of closed.
## Why Redis, and why a counter
If you run more than one instance of your API behind a load balancer, an in-memory counter is useless — each instance sees only its own slice of traffic, so the real limit is `N × instances`. The counter has to live somewhere shared. Redis is the natural home: `INCR` is atomic, `EXPIRE` gives you the time window for free, and a counter lookup is sub-millisecond.
The shape is two operations:
- **Check** — before doing the expensive/sensitive work, read the current count for this key and reject if it's over the threshold.
- **Record** — after a *failed* attempt, bump the counter.
Keep those separate. You check on the way in, and you only record the events you actually want to throttle (failed logins, not successful ones).
## The detail everyone gets wrong: set the TTL exactly once
Here's the trap. The naive version does `INCR` then `EXPIRE` on every request:
```go
// WRONG: the window never closes
pipe.Incr(ctx, key)
pipe.Expire(ctx, key, 15*time.Minute) // resets the clock on EVERY attempt
```
If the attacker keeps hammering, each request pushes the expiry 15 minutes into the future. The key never expires, the count keeps climbing — which sounds fine until you realize a legitimate user who fat-fingers their password is now locked out for 15 minutes *after their last attempt*, not after their first. The window slides with the attacker, which is exactly backwards.
You want a **fixed** window: the clock starts on the first failure and runs out 15 minutes later, no matter how many attempts happen in between. The trick is to set the TTL only when the counter is created — i.e. when `INCR` returns `1`:
```go
func recordFailure(ctx context.Context, rdb *redis.Client, key string, window time.Duration) {
    count, err := rdb.Incr(ctx, key).Result()
    if err != nil {
        log.Warnf("rate limit: incr failed, skipping: %v", err)
        return // fail open — see below
    }
    if count == 1 {
        // First failure in this window — start the clock once.
        rdb.Expire(ctx, key, window)
    }
}
```
`INCR` on a missing key creates it at `1`, so `count == 1` is a reliable "this is a fresh window" signal. Every later failure increments without touching the TTL, and the key evaporates `window` after the first failure. One clean window, every time.
## Don't store the raw identifier as the key
The rate-limit key needs to be unique per account (and usually also per client IP), but it does **not** need to be readable. Storing `login_fail:alice@example.com` turns your Redis instance into a directory of valid usernames — handy for anyone who gets a peek at it. Hash it:
```go
func failKey(email, ip string) string {
    sum := sha256.Sum256([]byte(strings.ToLower(email)))
    return fmt.Sprintf("login_fail:%x:%s", sum[:8], ip) // first 8 bytes is plenty
}
```
The hash is stable (same email always maps to the same key) so counting still works, but the key reveals nothing. Including the IP gives you a second axis — you can throttle "this account from this IP" and, with a second key, "this IP across all accounts" to catch spray attacks. Pick thresholds per axis; something like 10 failures per account-IP and a looser cap per IP overall is a reasonable starting point.
## Fail open, not closed
This is the one that bites people in production. What should happen when Redis is *down*? If your check treats a Redis error as "over the limit," then a cache blip locks every single user out of logging in — you've turned a rate limiter into a self-inflicted outage. A login throttle is a *secondary* security control; the primary control is still the password. So when the limiter can't do its job, let the request through and log loudly:
```go
func RateLimitLogin(rdb *redis.Client, max int64, window time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        key := failKey(c.PostForm("email"), c.ClientIP())
        count, err := rdb.Get(c, key).Int64()
        if err != nil && err != redis.Nil {
            // Redis unavailable: fail OPEN. Don't lock out real users.
            log.Warnf("rate limit check failed, allowing request: %v", err)
            c.Next()
            return
        }
        if count >= max {
            c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
                "error": "too many attempts, try again later",
            })
            return
        }
        c.Next()
    }
}
```
Note `redis.Nil` (the key doesn't exist) is *not* an error — it just means zero failures so far, so the request proceeds. Only genuine connection/command failures hit the fail-open path. Fail-open is a deliberate trade: you accept that during a Redis outage the brute-force protection is temporarily off, in exchange for not handing attackers a way to lock out legitimate users by knocking Redis over.
## Putting it together
The full flow on a login request:
1. **Middleware checks** the per-account-IP counter; if it's over the threshold, return `429` immediately — before you ever touch the password hash (so you also save the expensive bcrypt comparison).
2. The handler verifies credentials.
3. On **failure**, `recordFailure` does `INCR`, and sets the TTL only if the counter is new.
4. On **success**, optionally `DEL` the key so a legitimate user who finally remembers their password isn't penalized by earlier typos.
That's the whole thing: an atomic counter, a TTL set exactly once, a hashed key, and a fail-open check. No external rate-limiting service, no token-bucket library — just `INCR`, `EXPIRE`, and a couple of decisions made correctly.
## Takeaways
- **Use a shared store.** In-memory counters silently multiply your limit by the number of instances. Redis `INCR` is atomic and fast.
- **Set the TTL once, on the first event** (`count == 1`). Re-expiring on every request turns a fixed window into one that slides with the attacker and never trips.
- **Hash the identifier.** Your rate-limit store shouldn't double as a list of valid accounts.
- **Fail open for secondary security controls.** When the limiter can't run, don't convert a cache outage into a total login outage — let requests through and alert.
None of these are exotic, but each one is a place where the "obvious" implementation is subtly wrong. Get the four right and you have a brute-force defense that's correct under load, safe under failure, and cheap to run.
