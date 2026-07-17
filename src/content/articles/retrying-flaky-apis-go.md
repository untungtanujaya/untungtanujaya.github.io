---
title: "Retrying Flaky APIs in Go: Read the Body, Not Just the Status Code"
subtitle: "Backoff, Jitter & Idempotency"
summary: "Every integration with a third-party API eventually teaches you the same lesson: it will fail in ways that have nothing to do with your request. A downstream database deadlocks, a queue backs up, a node restarts mid-request — and the call you made a second ago, with identical inputs, would now succeed. The standard answer is \"add a retry,\" and most people reach for retrying on HTTP 5xx. But some of the most retry-worthy failures I've seen come back as a perfectly cheerful `200 OK` with the real error buried in the response body. This post is about building a retry loop that decides what to retry by reading the *content* of the response, not just its status line — with backoff, jitter, and a hard rule about which errors must never be retried."
pubDate: 2026-06-15
read_time: 5
slug: "retrying-flaky-apis-go"
---
Every integration with a third-party API eventually teaches you the same lesson: it will fail in ways that have nothing to do with your request. A downstream database deadlocks, a queue backs up, a node restarts mid-request — and the call you made a second ago, with identical inputs, would now succeed. The standard answer is "add a retry," and most people reach for retrying on HTTP 5xx. But some of the most retry-worthy failures I've seen come back as a perfectly cheerful `200 OK` with the real error buried in the response body. This post is about building a retry loop that decides what to retry by reading the *content* of the response, not just its status line — with backoff, jitter, and a hard rule about which errors must never be retried.
## The problem with status-code-only retries
The textbook retry looks at the HTTP status:
```go
if resp.StatusCode >= 500 {
    // retry
}
```
That works when the upstream is well-behaved. Plenty aren't. I've integrated with APIs that wrap a backend call and, when *that* backend throws a transient exception, return `200 OK` with a JSON body like:
```json
{ "success": false, "code": "TooManyResultsException", "message": "resource busy, retry" }
```
The HTTP layer says "fine." The payload says "I'm overloaded, ask again in a moment." A status-only retry never fires, and you surface a transient blip to the user as a hard failure. The inverse is just as bad: a `400 Bad Request` because your payload is genuinely malformed will return `400` *every single time* — retrying it three times just wastes three round-trips and delays the inevitable error. **The status code is a hint, not the answer.** You have to classify the actual failure.
## Classify first: retryable vs. terminal
Before writing any loop, split failures into two buckets:
- **Retryable** — transient and likely to resolve on its own: timeouts, connection resets, `429 Too Many Requests`, `503`, and those in-body "busy / deadlock / try again" signals.
- **Terminal** — deterministic; retrying changes nothing: validation errors, `401`/`403`, `404`, "duplicate key," malformed input.
A single function makes that decision, looking at both the transport error and the decoded body:
```go
// retryable reports whether an attempt is worth repeating.
func retryable(status int, body apiResponse, err error) bool {
    if err != nil {
        // network-level: timeout, connection reset, DNS blip — all transient.
        return true
    }
    switch status {
    case http.StatusTooManyRequests, http.StatusBadGateway,
        http.StatusServiceUnavailable, http.StatusGatewayTimeout:
        return true
    case http.StatusOK:
        // 200 — but the body may still report a transient backend error.
        switch body.Code {
        case "TooManyResultsException", "Deadlock", "ResourceBusy":
            return true
        }
    }
    return false // everything else is terminal: fail fast.
}
```
Keeping this in one place is the whole game. The retry loop stays dumb; *this* function holds the knowledge of what the upstream's failures actually look like, and it's trivial to unit-test with a table of `(status, body) → bool` cases.
## Back off — and add jitter
Once you know an attempt is retryable, don't immediately fire again. If the upstream is overloaded, an instant retry just adds to the pile. Wait, and wait *longer* each time — exponential backoff. And add a little randomness (jitter) so that if many of your workers failed at the same instant, they don't all retry in lockstep and re-create the same thundering herd:
```go
func backoff(attempt int) time.Duration {
    const base = 500 * time.Millisecond
    const cap = 30 * time.Second
    d := base * (1 << attempt) // 500ms, 1s, 2s, 4s, ...
    if d > cap {
        d = cap
    }
    // full jitter: sleep a random amount in [0, d].
    return time.Duration(rand.Int63n(int64(d)))
}
```
The cap matters: without it, `1 << attempt` grows without bound and your "retry" becomes "hang for ten minutes." Full jitter — a random value between zero and the computed delay — is the variant that spreads retries out best; it's worth more than the precise exponent.
## The loop, with a deadline
Now the loop itself. Bounded attempts, backoff between tries, and — critically — it honors a `context` so a caller's timeout or cancellation can stop the whole thing mid-backoff:
```go
func submitWithRetry(ctx context.Context, req Request) (apiResponse, error) {
    const maxAttempts = 4
    var last apiResponse
    for attempt := 0; attempt < maxAttempts; attempt++ {
        if attempt > 0 {
            select {
            case <-time.After(backoff(attempt)):
            case <-ctx.Done():
                return last, ctx.Err() // caller gave up; stop sleeping.
            }
        }
        resp, status, err := doRequest(ctx, req)
        if !retryable(status, resp, err) {
            return resp, err // success, or a terminal error — return immediately.
        }
        last = resp
        log.Warnf("attempt %d/%d transient (status=%d code=%s); retrying",
            attempt+1, maxAttempts, status, resp.Code)
    }
    return last, fmt.Errorf("gave up after %d attempts", maxAttempts)
}
```
Two things to notice. First, `!retryable(...)` is the *exit* condition — it returns on both success and terminal failure, so the loop only continues on transient errors. Second, the backoff sleep is a `select` on `time.After` **and** `ctx.Done()`; if the request's deadline expires while you're waiting to retry, you bail out instead of blowing past it.
## The rule you can't skip: only retry idempotent operations
Retries have one sharp edge. If an operation is **not idempotent** — say, "charge this card" or "create this order" — a retry can double it. The dangerous case is when the first attempt actually *succeeded* on the server but the response got lost on the way back (a dropped connection after the write). Your code sees a network error, classifies it retryable, fires again — and now there are two charges.
So before wrapping a call in this loop, make sure one of these holds:
- The operation is naturally idempotent (a `GET`, a lookup, a "set state to X").
- Or you send an **idempotency key** the server uses to dedupe, so a replayed request is recognized and collapsed into the original.
Read-only and validation calls are safe to retry freely. For writes, retry only with idempotency protection — otherwise a retry loop quietly turns a network blip into duplicate data.
## Takeaways
- **Classify failures by reading the body, not just the status.** A `200` can hide a transient backend error; a `4xx` is usually terminal. Put that decision in one testable function.
- **Fail fast on terminal errors.** Retrying a validation error three times just delays the error and wastes round-trips.
- **Exponential backoff with full jitter, and a cap.** Spread retries out so you don't pile onto an already-struggling upstream, and never let the delay grow unbounded.
- **Honor the caller's context** so a deadline can interrupt a backoff sleep.
- **Only retry idempotent operations** — or use an idempotency key — or you'll turn dropped responses into duplicates.
A retry loop is five lines of control flow wrapped around one hard question: *is this failure worth repeating?* Spend your effort answering that question well, and the rest is mechanical.
