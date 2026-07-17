---
title: "Idempotent Reprocessing: Scoped Deletes That Don't Clobber Prior Work"
subtitle: "Scoped Deletes & Idempotency"
summary: "A common shape of backend work: a user uploads a batch of inputs, an expensive pipeline chews through them and produces derived results, and everyone moves on. Then, days later, the user uploads *a few more* inputs to the same batch and wants them processed too. The lazy implementation of \"reprocess\" is brutally simple — delete all the derived results for the batch and run the whole pipeline again. It's also wrong in three ways: it's slow (you recompute work that was already done), it's expensive (you re-run paid API calls or heavy compute on unchanged inputs), and it's *destructive* (any manual corrections a user made to the earlier results are silently wiped). This post is about doing reprocessing the right way: deleting only what the new inputs touch, recomputing only the new inputs, and making the whole operation safe to run twice."
pubDate: 2026-06-15
read_time: 6
slug: "idempotent-reprocessing-scoped-deletes"
---
A common shape of backend work: a user uploads a batch of inputs, an expensive pipeline chews through them and produces derived results, and everyone moves on. Then, days later, the user uploads *a few more* inputs to the same batch and wants them processed too. The lazy implementation of "reprocess" is brutally simple — delete all the derived results for the batch and run the whole pipeline again. It's also wrong in three ways: it's slow (you recompute work that was already done), it's expensive (you re-run paid API calls or heavy compute on unchanged inputs), and it's *destructive* (any manual corrections a user made to the earlier results are silently wiped). This post is about doing reprocessing the right way: deleting only what the new inputs touch, recomputing only the new inputs, and making the whole operation safe to run twice.
## The trap: truncate-and-rebuild
Here's the version that ships first, because it's the easiest to reason about:
```python
def reprocess(batch_id):
    db.execute("DELETE FROM results WHERE batch_id = :b", {"b": batch_id})
    inputs = db.query("SELECT * FROM inputs WHERE batch_id = :b", {"b": batch_id})
    for inp in inputs:                       # reprocesses EVERYTHING
        results = expensive_pipeline(inp)    # re-runs paid/slow work
        db.insert_results(results)
```
It produces a correct final state, so it passes a naive test. The damage is everything around correctness:
- **It recomputes the unchanged.** If the batch had 500 inputs and the user added 3, you just reprocessed 503. If `expensive_pipeline` calls a metered API, you paid for 500 redundant calls.
- **It destroys downstream edits.** Suppose users can review and *fix* results after processing — correct a mislabel, adjust a value. Truncate-and-rebuild throws all of that away and regenerates raw output. The user's afternoon of corrections is gone, with no warning.
- **It churns IDs.** Every result row gets a new primary key, so anything that referenced a result by id — a foreign key, a saved link, a comment — now dangles.
The root mistake is treating "add a few inputs" as "rebuild the world." The new inputs are a small, identifiable delta. The operation should be scoped to that delta.
## The fix: scope the delete to the new inputs
Two changes. First, the caller already knows which inputs are new — it just uploaded them — so pass their ids in instead of rederiving "everything in the batch." Second, delete only the derived rows that belong to *those* inputs, and reprocess only *those*:
```python
def reprocess(batch_id, new_input_ids):
    if not new_input_ids:
        return                                # nothing to do — trivially idempotent
    with db.begin():                          # delete + insert as one transaction
        # Remove only the derived rows tied to the new inputs.
        db.execute(
            "DELETE FROM results WHERE source_input_id IN :ids",
            {"ids": tuple(new_input_ids)},
        )
        # Reprocess only the new inputs; everything else is untouched.
        new_inputs = db.query(
            "SELECT * FROM inputs WHERE id IN :ids",
            {"ids": tuple(new_input_ids)},
        )
        for inp in new_inputs:
            for row in expensive_pipeline(inp):
                db.insert_result(source_input_id=inp.id, **row)
```
The existing 500 inputs' results are never read, never deleted, never recomputed. Their ids are stable, their downstream references stay valid, and any manual edits on them survive because we never touched those rows. The pipeline runs three times, not 503. The single requirement that makes this safe is a **scoping column** — here `results.source_input_id`, the foreign key from each derived row back to the input that produced it. If your results table doesn't already record which input each row came from, add it; it's the key that makes targeted reprocessing possible.
## Why the `DELETE` before the `INSERT`?
Because reprocessing the *same* input twice should converge, not accumulate. Imagine the user re-triggers reprocess for an input that was already processed once (a double-click, a retry after a timeout, a queue redelivery). Without the scoped delete, the second run *appends* a second copy of that input's results — now every item is duplicated. With "delete this input's results, then insert," the second run removes the first run's output and re-creates it. The end state is identical whether you run it once or five times.
That property — **same inputs in, same state out, no matter how many times you run it** — is *idempotency*, and it's what turns a fragile operation into a safe one. Idempotent endpoints can be retried freely, which matters enormously in a world of network timeouts and at-least-once message delivery. The "scope by key, delete-then-insert within a transaction" recipe is one of the most reliable ways to get it for derived data.
The transaction is load-bearing. Delete and insert must be atomic, so a crash between them can't leave the input with its old results gone and its new ones not yet written. Wrap both in one transaction; on any error, the whole thing rolls back and the prior state stands.
## Don't renumber what others point to
One more discipline that protects callers: when you do scoped reprocessing, **don't renumber the stable identifiers** that the rest of the system references. If inputs carry a human-facing sequence number, or results are keyed by something external code links to, resist the urge to "tidy up" and reassign them on each run. Appending input #501, #502, #503 should leave #1–#500 exactly as they were. Renumbering is the truncate-and-rebuild mistake in miniature — it invalidates references for the convenience of contiguous numbering nobody asked for. Assign new ids to new things; never reissue ids for existing things.
## A checklist for the pattern
When you build a "reprocess after adding more" feature, walk these:
1. **Identify the delta explicitly.** The caller knows what's new — pass the new ids in rather than recomputing "what's in the batch."
2. **Scope the delete by a foreign key** from derived rows back to their source input. No scoping column → you can't target → you're stuck rebuilding everything.
3. **Delete-then-insert inside one transaction**, so reruns converge and a mid-operation crash can't corrupt state.
4. **Preserve stable ids and any downstream edits** on the rows you didn't touch.
5. **Make the empty delta a no-op**, so "reprocess with nothing new" does nothing rather than something.
## Takeaways
- **"Reprocess" is not "rebuild."** Truncate-and-rebuild is slow, expensive, and destroys manual edits and stable ids — even though it lands on a correct final state.
- **Scope work to the delta.** A foreign key from derived rows to their source input lets you delete and recompute only what changed, leaving the rest — and its edits — alone.
- **Delete-then-insert in a transaction makes it idempotent**, so the operation is safe to retry under timeouts and at-least-once delivery.
- **Never reissue ids for existing rows.** Append new ids for new things; leave old references valid.
The whole pattern is one `DELETE ... WHERE source_id IN (new_ids)` followed by an insert, inside a transaction. The discipline isn't in the SQL — it's in the decision to treat reprocessing as a scoped, repeatable delta instead of a destructive full rebuild.
