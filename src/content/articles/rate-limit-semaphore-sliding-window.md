---
title: "Staying Under a Provider's Rate Limit in Python: Semaphore + Sliding Window"
subtitle: "Semaphore & Sliding Window"
summary: "When you call a metered third-party API — an LLM endpoint, a geocoder, a payment processor — from a pool of workers, you're caught between two pressures. You want to fan out and run many calls at once, because each one is slow and mostly spent waiting on the network. But the provider publishes limits, and crossing them earns you `429 Too Many Requests`, throttling, or a temporary ban. The catch is that providers usually enforce *two different* ceilings at the same time: a cap on how many requests you may have **in flight concurrently**, and a cap on how many you may send **per minute** (RPM). A single semaphore handles the first and silently violates the second. This post builds a small client-side limiter in Python that respects both — and gets right the one detail that quietly destroys throughput if you miss it: where you put the sleep."
pubDate: 2026-06-15
read_time: 6
slug: "rate-limit-semaphore-sliding-window"
---
When you call a metered third-party API — an LLM endpoint, a geocoder, a payment processor — from a pool of workers, you're caught between two pressures. You want to fan out and run many calls at once, because each one is slow and mostly spent waiting on the network. But the provider publishes limits, and crossing them earns you `429 Too Many Requests`, throttling, or a temporary ban. The catch is that providers usually enforce *two different* ceilings at the same time: a cap on how many requests you may have **in flight concurrently**, and a cap on how many you may send **per minute** (RPM). A single semaphore handles the first and silently violates the second. This post builds a small client-side limiter in Python that respects both — and gets right the one detail that quietly destroys throughput if you miss it: where you put the sleep.
## Two limits, two mechanisms
It's worth being precise about why one tool isn't enough.
- **Concurrency** is an *instantaneous* count: how many requests are open at this exact moment. The right tool is a **semaphore** of size `max_concurrent` — acquire before a call, release after.
- **Rate (RPM)** is a count *over a time window*: how many requests you started in the last 60 seconds, regardless of whether they've finished. A semaphore knows nothing about time, so it can't enforce this. You could run well under your concurrency cap and still blow past RPM by firing short requests back-to-back.
You need both, working together: the semaphore bounds simultaneous load, and a sliding-window counter bounds the rate.
## The sliding window
The cleanest way to track "requests in the last 60 seconds" is a deque of timestamps. Before each request: drop everything older than the window, then look at what's left. If you're already at the limit, the oldest timestamp tells you exactly how long to wait — that request will fall out of the window at `oldest + 60s`, freeing a slot.
```python
import time, threading
from collections import deque
class RateLimiter:
    def __init__(self, max_concurrent: int, rpm: int):
        self._sem = threading.Semaphore(max_concurrent)
        self._rpm = rpm
        self._window = 60.0
        self._calls = deque()           # timestamps of recent requests
        self._lock = threading.Lock()
    def acquire(self):
        self._sem.acquire()             # 1) bound concurrency
        try:
            self._wait_for_rate_slot()  # 2) bound rate
        except BaseException:
            self._sem.release()         # don't leak the slot on error
            raise
    def release(self):
        self._sem.release()
```
The `acquire`/`release` pair mirrors a lock: every caller acquires before the API call and releases after (use a `try/finally`, or wrap it in a context manager). Note the small but important detail in `acquire`: if the rate-wait step raises, we release the semaphore slot we already took — otherwise a failure slowly drains the pool until nothing can run.
## The detail that matters: sleep *outside* the lock
Here's where it's easy to throw away all your concurrency. The rate check has to be atomic — you read the deque, decide, and record your timestamp without another thread interleaving. So it needs a lock. The naive version sleeps while *holding* that lock:
```python
def _wait_for_rate_slot(self):
    with self._lock:
        self._evict_old()
        if len(self._calls) >= self._rpm:
            sleep_for = self._window - (time.monotonic() - self._calls[0])
            time.sleep(sleep_for)        # WRONG: every other thread is now blocked
        self._calls.append(time.monotonic())
```
If one thread sleeps for 40 seconds inside the lock, **every other worker that wants a rate slot is frozen behind it** — even the ones that could have proceeded immediately. You've serialized your whole pool on a single sleeping thread. The throughput you bought with a `ThreadPoolExecutor` evaporates.
The fix: do all the *decision-making* under the lock, then release it, and *only then* sleep. Loop, because after you wake the situation may have changed:
```python
    def _wait_for_rate_slot(self):
        while True:
            with self._lock:
                self._evict_old()
                if len(self._calls) < self._rpm:
                    self._calls.append(time.monotonic())  # claim the slot
                    return
                # at the limit — compute the wait, but don't sleep here
                sleep_for = self._window - (time.monotonic() - self._calls[0])
            # lock released; other threads can proceed while we wait
            time.sleep(max(sleep_for, 0.0))
    def _evict_old(self):
        cutoff = time.monotonic() - self._window
        while self._calls and self._calls[0] < cutoff:
            self._calls.popleft()
```
Now the lock is held only for a few microseconds of bookkeeping. A thread that needs to wait computes its delay, *lets go of the lock*, and sleeps on its own time. Other threads keep flowing through. Use `time.monotonic()`, not `time.time()` — you're measuring elapsed durations, and a wall-clock adjustment (NTP, DST) must not make your window jump.
## Wiring it to a worker pool
With the limiter in place, fanning out is ordinary `concurrent.futures`. Every worker funnels its call through `acquire`/`release`:
```python
from concurrent.futures import ThreadPoolExecutor
limiter = RateLimiter(max_concurrent=10, rpm=600)
def call_api(item):
    limiter.acquire()
    try:
        return do_request(item)         # the actual metered call
    finally:
        limiter.release()
with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(call_api, items))
```
The pool size and the semaphore size should agree (both `max_concurrent`); the semaphore is the real enforcer, but matching them avoids spawning workers that immediately block. The RPM ceiling then acts as a second gate underneath: even at full concurrency, no more than `rpm` requests start per minute. Pair this with the retry-and-backoff pattern from a previous post, and a `429` that slips through (clock skew with the provider, a burst at a window boundary) is caught and retried rather than surfaced as a failure.
A practical note: set your client-side limits slightly *below* the provider's published numbers. Their counter and yours won't agree to the millisecond, and leaving a little headroom is far cheaper than getting throttled.
## Why a sliding window over the alternatives
You'll see two simpler approaches. A **fixed window** ("reset the count every minute on the minute") is easy but allows a burst of `2 × rpm` straddling the boundary — `rpm` at 0:59 and another `rpm` at 1:01. A **token bucket** is excellent and smooths bursts, but needs a refill thread or careful time math. The sliding window of timestamps is a sweet spot for client-side limiting: it's a few lines, it never allows more than `rpm` in any 60-second span, and the oldest timestamp hands you the exact wait time for free. Its only cost is memory proportional to `rpm`, which for any realistic limit is trivial.
## Takeaways
- **Respect both ceilings.** Concurrency (a semaphore) and rate (a time-windowed counter) are different constraints; one tool can't enforce the other.
- **A deque of timestamps is a complete sliding-window limiter.** Evict the old, count the rest, and the oldest entry tells you how long to wait.
- **Compute under the lock; sleep outside it.** Sleeping while holding the lock serializes your entire pool on one thread and silently kills the throughput you fanned out for.
- **Use `monotonic` time, release slots on error, and leave headroom** below the provider's published limits.
The whole limiter is a semaphore, a deque, and a lock — but arranged so that waiting is something each thread does alone, never something one thread imposes on all the others.
