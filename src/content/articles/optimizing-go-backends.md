---
title: "Speeding Up an I/O-Bound Batch API in Go: Dedup + a Bounded Worker Pool"
subtitle: "Concurrency & Profiling"
summary: "A surprising number of \"slow API\" problems aren't CPU problems at all — they're *waiting* problems. The endpoint spends almost all of its time blocked on a slow downstream: a third-party HTTP API, another microservice, a database round-trip. When that work arrives in batches, the naive implementation does the worst possible thing — it waits for each item, one at a time, and it re-does work it has already done. In this post I walk through a small, reusable Go pattern for these endpoints: collapse the batch with a key-value map to kill duplicate work, then run what's left through a bounded worker pool built from a buffered channel. The same three ideas — **bulk, map, fan-out** — turned a multi-second batch endpoint into a sub-second one in the systems I've worked on."
pubDate: 2026-06-15
read_time: 5
slug: "optimizing-go-backends"
---
A surprising number of "slow API" problems aren't CPU problems at all — they're *waiting* problems. The endpoint spends almost all of its time blocked on a slow downstream: a third-party HTTP API, another microservice, a database round-trip. When that work arrives in batches, the naive implementation does the worst possible thing — it waits for each item, one at a time, and it re-does work it has already done. In this post I walk through a small, reusable Go pattern for these endpoints: collapse the batch with a key-value map to kill duplicate work, then run what's left through a bounded worker pool built from a buffered channel. The same three ideas — **bulk, map, fan-out** — turned a multi-second batch endpoint into a sub-second one in the systems I've worked on.
## The problem: one slow call per item, in a loop
Picture an endpoint that takes a batch of records and validates each one against a slow third-party API:
```go
func ValidateBatch(ctx context.Context, items []Item) []Result {
    results := make([]Result, len(items))
    for i, item := range items {
        results[i] = Result{
            ID:     item.ID,
            Status: callAPI(ctx, item.DocNo, item.Kind), // ~500ms each, blocking
        }
    }
    return results
}
```
It's correct, and it's slow. Two things are wrong, and both are about wasted waiting:
1. **Duplicate work.** Real batches are rarely all-unique. The same `(DocNo, Kind)` shows up many times, and we call the upstream again for every repeat — paying full latency for an answer we already have.
2. **Serial waiting.** Each call blocks the next. If one call takes 500ms and there are 100 records, that's 50 seconds of mostly *idle* CPU, sitting on its hands waiting for the network.
The fix attacks both: do each *unique* call exactly once, and do the remaining calls concurrently instead of one-by-one.
## Step 1 — Collapse the batch with a key-value map
Before calling anything, group the items by what actually determines the answer. Build a map from a composite key to the list of positions that share it:
```go
func ValidateBatch(ctx context.Context, items []Item) []Result {
    results := make([]Result, len(items))
    type dedupKey struct {
        docNo string
        kind  string
    }
    groups := make(map[dedupKey][]int)
    for i, item := range items {
        // Skip blanks up front so they never reach the network.
        if item.DocNo == "" || item.Kind == "" {
            results[i] = Result{ID: item.ID, Status: "NOT_CHECKED"}
            continue
        }
        key := dedupKey{docNo: item.DocNo, kind: item.Kind}
        groups[key] = append(groups[key], i)
    }
    // ... workers go here
}
```
Two things to notice. First, the map *value* is `[]int` — the original indices — not the data itself. That's the trick that lets us write results back in the right place later. Second, invalid items are short-circuited immediately; there's no reason to spend a network round-trip discovering that an empty string is empty.
If a 100-item batch contains only 20 distinct keys, we've just deleted 80% of the upstream calls before writing a single goroutine.
## Step 2 — Bound the concurrency with a channel-as-semaphore
Now run the unique lookups in parallel — but *not* unbounded. Spawning one goroutine per key and letting all of them hit the upstream at once is a great way to get rate-limited, tip over a fragile dependency, or exhaust your own connection pool. You want a fixed ceiling on in-flight requests.
Go gives you a counting semaphore for free: a buffered channel. Its capacity *is* your concurrency limit.
```go
const maxWorkers = 10
sem := make(chan struct{}, maxWorkers) // buffered channel = counting semaphore
var wg sync.WaitGroup
for key, indices := range groups {
    wg.Add(1)
    sem <- struct{}{} // acquire a slot — blocks once 10 calls are already in flight
    go func(key dedupKey, indices []int) {
        defer wg.Done()
        defer func() { <-sem }() // release the slot
        status := callAPI(ctx, key.docNo, key.kind) // exactly one call per unique key
        // Step 3: fan the single result out to every item that shares this key.
        for _, idx := range indices {
            results[idx] = Result{ID: items[idx].ID, Status: status}
        }
    }(key, indices)
}
wg.Wait()
return results
```
The shape is worth internalizing because it's the same every time:
- `sem <- struct{}{}` **before** launching reserves a slot; if all 10 are taken, the loop blocks right here until one frees up. That's the backpressure.
- `defer func() { <-sem }()` releases the slot when the goroutine finishes.
- `sync.WaitGroup` lets the function block until every goroutine has written its result.
- The loop variables `key` and `indices` are passed as arguments to the goroutine, not captured — a classic Go closure footgun if you skip it.
`struct{}` as the channel element is deliberate: an empty struct takes zero bytes, so the channel is pure signaling with no payload.
## Step 3 — Fan one result out to many, in order
This is the part people miss. Because each map value is a slice of the *original indices*, one upstream answer can be written to every position that needed it:
```go
for _, idx := range indices {
    results[idx] = Result{ID: items[idx].ID, Status: status}
}
```
The `results` slice was allocated once, at full input length, and we write by index — so the output order exactly matches the input order even though the work finished in a scrambled, concurrent order. The caller never sees the concurrency. Duplicates are handled for free: we computed the answer once and stamped it everywhere it belonged.
## Make it production-safe
Concurrency makes failures louder, so the per-item call needs guardrails. The point isn't the specifics — it's that *one* bad record must never sink the whole batch:
```go
func callAPI(ctx context.Context, docNo, kind string) string {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    status, err := doRequest(ctx, docNo, kind)
    if err != nil {
        // one retry on a transient blip (timeout / network)
        if status, err = doRequest(ctx, docNo, kind); err != nil {
            return "ERROR" // isolate the failure to this key
        }
    }
    return status
}
```
A few habits that pay off here:
- **A per-request timeout** (via `context.WithTimeout`) so a single hung upstream call can't pin a worker forever.
- **A single bounded retry** for transient errors — and, if you authenticate, a refresh-and-retry on a 401 rather than failing the whole batch.
- **Per-item error isolation:** a failed key returns an `ERROR` status for *its* records and nothing else. The other 99 still come back fine.
## Why it's faster (the honest math)
Two independent savings stack, so it's worth keeping them separate in your head.
**Deduplication** turns *N* items into *U* unique calls. If a batch is 100 items with 20 distinct keys, you've cut the upstream calls by 5× before any concurrency.
**Bounded concurrency** then runs those *U* calls roughly `ceil(U / W)` batches deep instead of `U` one at a time, where *W* is your worker count. For I/O-bound work — where the goroutine is asleep waiting on the network — the wall-clock speedup approaches *W*×.
A worked, illustrative example (not a benchmark — your real numbers depend on your dedup ratio and your upstream's latency and rate limits):
- 100 records, ~500ms per upstream call.
- **Naive serial:** 100 × 500ms ≈ **50s**.
- **After dedup** to 20 unique keys, **10 workers**: `ceil(20 / 10)` × 500ms ≈ **1s**.
That's a ~10× win from concurrency alone, multiplied again by whatever your duplicate rate gives you. The lever to remember: for I/O-bound batches, **N workers buys up to ~N× on the network-bound portion** — so pick *W* to match what your downstream can actually tolerate, not the biggest number you can think of.
## Takeaways
The pattern is small enough to keep in your head and reach for whenever a batch endpoint is slow because it's *waiting*:
1. **Bulk → map.** Group the batch by the key that determines the answer; store indices, not data. Kill duplicate work and screen out invalid input before touching the network.
2. **Bounded worker pool.** A buffered channel is a one-line counting semaphore. Cap your in-flight calls; never fan out unbounded against a shared dependency.
3. **Fan-out in order.** Write results back by original index so the concurrency stays invisible to the caller, and one answer serves every item that needed it.
It's not exotic — no framework, no dependency, just `map`, a buffered `chan`, and a `WaitGroup` from the standard library. But on an I/O-bound endpoint, those three moves are routinely the difference between a multi-second request and a sub-second one.
