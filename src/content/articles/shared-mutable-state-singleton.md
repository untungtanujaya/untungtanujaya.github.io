---
title: "The Bug That Only Happens Under Load: Shared Mutable State on a Singleton"
subtitle: "Concurrency & Data Races"
summary: "Some bugs are easy: you can see them in the code, reproduce them on the first try, and fix them before lunch. This is a story about the other kind — the bug that passes every test, works flawlessly in development, and then, once real traffic arrives, starts producing *wrong data* with no error, no stack trace, and no obvious pattern. The culprit was a single attribute stashed on a long-lived service object. It's one of the most common concurrency mistakes there is, and because the symptom is \"occasionally wrong values\" rather than \"crash,\" it can live in production for months. Here's how it happens, why it's so hard to catch, and the small change that fixes it for good."
pubDate: 2026-06-15
read_time: 6
slug: "shared-mutable-state-singleton"
---
Some bugs are easy: you can see them in the code, reproduce them on the first try, and fix them before lunch. This is a story about the other kind — the bug that passes every test, works flawlessly in development, and then, once real traffic arrives, starts producing *wrong data* with no error, no stack trace, and no obvious pattern. The culprit was a single attribute stashed on a long-lived service object. It's one of the most common concurrency mistakes there is, and because the symptom is "occasionally wrong values" rather than "crash," it can live in production for months. Here's how it happens, why it's so hard to catch, and the small change that fixes it for good.
## The setup
I had a service that processed uploads in batches. Within a batch, one record is the *primary* — it carries shared metadata (a date, some shared attributes) that should be copied onto the *related* records in the same batch. Think of a cover sheet whose header fields get stamped onto every page behind it.
The service was a singleton — one instance, created at startup, reused for every request. (This is normal; constructing it is expensive, and it's meant to be stateless.) The processing code looked, simplified, like this:
```python
class RecordProcessor:
    def __init__(self):
        self._primary = None  # <-- the landmine
    def handle_primary(self, record):
        self._primary = record          # stash it for later
    def backfill_related(self, related):
        if self._primary:               # read it back during processing
            related.shared_date = self._primary.shared_date
            related.attributes = self._primary.attributes
        return related
```
`handle_primary` runs when the primary record is parsed; `backfill_related` runs a moment later when each related record is processed. In a single request, the sequence is: stash the primary, then read it back. Clean, simple, and **completely correct as long as exactly one request is ever in flight.**
## Where it breaks
Now run two batches at once. The service is a singleton, so both requests share the *same* `self._primary` field. Interleave them:
```
Request A: handle_primary(A_primary)   -> self._primary = A_primary
Request B: handle_primary(B_primary)   -> self._primary = B_primary   (clobbers A's!)
Request A: backfill_related(A_related) -> copies B_primary's data onto A's records
```
Request A just stamped **Request B's** metadata onto its own records. No exception. No log line. The write succeeds — with the wrong values. To anyone watching, batch A simply came out with a date and attributes that belong to batch B. Try to reproduce it by hand and you can't, because by the time you look, the two requests aren't interleaving anymore.
This is a **data race on shared mutable state**, and singletons are where it loves to hide. The object was designed to be stateless and reusable; the moment someone added a "convenient" instance attribute to pass a value between two methods, it became a shared mailbox that every concurrent request writes to and reads from.
Three properties make it nasty:
- **No error.** The failure mode is incorrect data, not a crash, so monitoring that watches for exceptions sees nothing.
- **Load-dependent.** It only manifests when two requests overlap, so it's invisible in dev and intermittent in production.
- **Non-local.** The write (`handle_primary`) and the faulty read (`backfill_related`) are in different methods, possibly different files, so reading either one in isolation looks fine.
## The fix: scope the state by key, and lock it
The root cause is that one piece of state is shared across requests that should each have their own. So give each request its own slot. Key the state by something unique to the logical unit of work — here, the batch id — and protect access with a lock so concurrent reads and writes can't tear:
```python
import threading
class RecordProcessor:
    def __init__(self):
        self._lock = threading.Lock()
        self._primary_by_batch = {}     # batch_id -> primary record
    def handle_primary(self, batch_id, record):
        with self._lock:
            self._primary_by_batch[batch_id] = record
    def backfill_related(self, batch_id, related):
        with self._lock:
            primary = self._primary_by_batch.get(batch_id)
        if primary:
            related.shared_date = primary.shared_date
            related.attributes = primary.attributes
        return related
    def finish_batch(self, batch_id):
        with self._lock:
            self._primary_by_batch.pop(batch_id, None)   # don't leak memory
```
Now batch A reads batch A's primary and batch B reads batch B's — they index into different dict entries, so they can't clobber each other. The lock guards the dict itself (Python dict operations are mostly atomic under the GIL, but "check then act" sequences across methods are not, so don't rely on the GIL — make the intent explicit). And `finish_batch` cleans up the entry when the work is done, so the dict doesn't grow forever — the other half of state management people forget.
## The second bug hiding underneath
Once the leak was fixed, a subtler question surfaced: what if a single batch legitimately contains *two* primaries? The backfill logic assumed exactly one. With two, "copy the primary's fields onto the related records" is ambiguous — *which* primary?
The safe answer is: **don't guess.** If the assumption that makes the feature well-defined doesn't hold, disable the feature for that case rather than silently picking one:
```python
    def backfill_related(self, batch_id, related):
        with self._lock:
            primaries = self._primaries_by_batch.get(batch_id, [])
        if len(primaries) != 1:
            return related          # 0 or many -> ambiguous, skip backfill
        primary = primaries[0]
        related.shared_date = primary.shared_date
        return related
```
A correct "did nothing" beats a confident "did the wrong thing." When the input violates the precondition your logic depends on, degrade gracefully instead of producing data you can't justify.
## How to avoid it in the first place
The deeper lesson is about *where state lives*. The bug existed because a value that belonged to one request was stored on an object shared by all requests. The defenses, in rough order of preference:
1. **Pass state explicitly.** If `backfill_related` needs the primary, pass it as an argument. State threaded through function parameters can't be shared by accident. The instance attribute existed only to avoid passing one extra argument — a terrible trade.
2. **If state must be shared, scope it by key and lock it.** That's the fix above. Use it when explicit passing is genuinely awkward.
3. **Treat singletons as immutable after construction.** A reusable service should hold configuration and dependencies, never per-request data. The moment you write `self.something = <a request's value>` on a shared object, stop and ask who else can see it.
## Takeaways
- **Per-request data does not belong on a shared object.** A singleton with a mutable instance attribute is a shared mailbox; under concurrency, requests overwrite each other's mail.
- **The symptom is wrong data, not a crash** — which is why these bugs survive so long. They're invisible in single-threaded dev and intermittent under load.
- **Fix by scoping state per logical unit of work** (a dict keyed by id) **and guarding it with a lock**; clean the entry up when the work finishes.
- **When a precondition fails, do nothing rather than guess.** Ambiguous input should disable a feature, not trigger a silent wrong answer.
- **Best of all, pass state explicitly.** The cheapest concurrency bug to fix is the one you never create by keeping request data out of shared objects entirely.
