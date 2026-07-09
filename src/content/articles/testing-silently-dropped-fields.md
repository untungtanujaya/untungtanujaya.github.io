---
title: "Testing the Update You Didn't Write: Catching Silently-Dropped Fields in Go"
subtitle: "Contract Tests & Pure Functions"
summary: "Here's a bug with no error message. A user edits a field in a form, hits save, gets a green success toast — and the value never reaches the database. Everything \"worked.\" The request was `200 OK`, the row was updated, no exception was logged. But one field was silently dropped somewhere between the JSON body and the SQL, because a developer added it to the form and the DTO but forgot to wire it into the function that builds the update. These are some of the most expensive bugs to find, because nothing points at them: you only discover the data is wrong when a user complains weeks later. This post is about a tiny, fast, database-free testing pattern that makes this entire class of bug impossible to ship."
pubDate: 2026-06-15
read_time: 5
slug: "testing-silently-dropped-fields"
---
Here's a bug with no error message. A user edits a field in a form, hits save, gets a green success toast — and the value never reaches the database. Everything "worked." The request was `200 OK`, the row was updated, no exception was logged. But one field was silently dropped somewhere between the JSON body and the SQL, because a developer added it to the form and the DTO but forgot to wire it into the function that builds the update. These are some of the most expensive bugs to find, because nothing points at them: you only discover the data is wrong when a user complains weeks later. This post is about a tiny, fast, database-free testing pattern that makes this entire class of bug impossible to ship.
## Why partial updates leak fields
The trouble starts with `PATCH` semantics. A partial update needs to distinguish three states for every field: *set to a value*, *explicitly cleared*, and *not provided at all*. In Go the idiomatic way is pointer fields — `nil` means "not provided," a non-nil pointer means "use this value":
```go
type UpdateContactRequest struct {
    Name  *string `json:"name"`
    Email *string `json:"email"`
    Phone *string `json:"phone"`
}
```
Then, somewhere, a function turns that struct into the set of columns to write — because you only want to update the columns the caller actually sent, not stomp the rest to zero:
```go
func buildContactUpdates(req UpdateContactRequest) map[string]any {
    updates := map[string]any{}
    if req.Name != nil {
        updates["name"] = *req.Name
    }
    if req.Email != nil {
        updates["email"] = *req.Email
    }
    // Bug: someone added Phone to the request struct and the form,
    // but never added this block. Phone is silently never written.
    return updates
}
```
The bug is an *omission*. The code that's there is correct; it's the code that *isn't* there that loses data. Phone arrives in the JSON, deserializes into the struct, and then `buildContactUpdates` just... ignores it. The ORM dutifully writes the two columns it was handed. No layer in the stack has any reason to complain — silently dropping a field you didn't ask about is, from each component's point of view, the correct behavior.
You cannot catch this with a test that asserts "the call returned no error." The call never errors. You have to assert on the **content of the update** — which columns it produced.
## The pattern: make the mapping a pure function, then pin it
Two ingredients make this testable. First — and you've probably already done this if `buildContactUpdates` is a standalone function — the mapping from request to columns must be **pure**: input a struct, output a map, no database, no I/O. Pure functions are trivial to test exhaustively.
Second, write table-driven tests that assert exactly **which keys appear** in the output map for a given input. Three kinds of cases pin the contract:
```go
func strPtr(s string) *string { return &s } // nil = "field not provided"
func TestBuildContactUpdates(t *testing.T) {
    cases := []struct {
        name       string
        req        UpdateContactRequest
        wantKeys   []string // columns that MUST be present
        absentKeys []string // columns that MUST NOT be present
    }{
        {
            name:     "all fields present writes all columns",
            req:      UpdateContactRequest{strPtr("Ada"), strPtr("ada@x.io"), strPtr("123")},
            wantKeys: []string{"name", "email", "phone"},
        },
        {
            name:       "only name present writes only name",
            req:        UpdateContactRequest{Name: strPtr("Ada")},
            wantKeys:   []string{"name"},
            absentKeys: []string{"email", "phone"},
        },
        {
            name:       "phone present must reach the column", // the regression guard
            req:        UpdateContactRequest{Phone: strPtr("123")},
            wantKeys:   []string{"phone"},
            absentKeys: []string{"name", "email"},
        },
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := buildContactUpdates(tc.req)
            for _, k := range tc.wantKeys {
                if _, ok := got[k]; !ok {
                    t.Errorf("expected column %q to be written, but it was dropped", k)
                }
            }
            for _, k := range tc.absentKeys {
                if _, ok := got[k]; ok {
                    t.Errorf("column %q written but request didn't set it", k)
                }
            }
        })
    }
}
```
Run this against the buggy `buildContactUpdates` and the third case fails immediately with a crisp message: *expected column "phone" to be written, but it was dropped.* The test encodes the contract — "every field the request can carry must reach its column" — so the day someone adds a field to the struct without wiring the mapping, a red test tells them precisely what they forgot.
The two-sided assertion matters. `wantKeys` catches the silent-drop bug. `absentKeys` catches its opposite — a field written when the caller didn't set it, which would clobber existing data with a zero value. Both are real; test both directions.
## Keep them out of the fast path with build tags
These are contract tests, a notch heavier in intent than a plain unit test, and you may want to run them separately (say, only in CI, or in their own suite). Go's build tags make that clean:
```go
//go:build regression
package contact
```
With the tag, `go test ./...` skips the file by default, and `go test -tags=regression ./...` includes it. You get a named suite you can run on demand without slowing the everyday `go test` loop — and without any database, mocks, or fixtures, because the thing under test is a pure function.
## Why this beats an integration test here
You could catch the same bug with a full integration test: spin up a database, `PATCH` the endpoint, read the row back, assert the phone number. It works, but it's the wrong tool. It's slow (real DB, migrations, HTTP), it's flaky (network, ports, cleanup), and worst of all it tests *everything at once* — so when it fails you don't immediately know whether the bug is in the handler, the mapping, the ORM, or the schema. The pure-function test isolates the exact layer where this class of bug lives — the request-to-columns mapping — and runs in microseconds. Save integration tests for behavior that genuinely spans layers; use a focused contract test for a focused contract.
## Takeaways
- **Silently-dropped fields produce no error.** A partial update with a missing mapping branch returns `200`, updates the row, logs nothing, and writes stale data. You can only catch it by asserting on *which columns* the update touches.
- **Isolate the mapping as a pure function** (request → column map) so it can be tested with zero I/O.
- **Assert both presence and absence.** "This field must be written" guards against drops; "this field must not be written" guards against clobbering.
- **Add a case for every field the request can carry**, so adding a field without wiring it turns a silent data bug into a loud failing test.
- **Reach for build tags** to keep contract tests as a named, on-demand suite separate from the fast unit loop.
The bug that ships is the one no test was looking for. A handful of table rows asserting your update's contract turns an invisible data-loss bug into a red build — which is exactly where you want it.
