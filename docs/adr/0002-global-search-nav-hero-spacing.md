# ADR-0002: Global Search page, navbar tri-zone layout, hero spacing fix

- Status: Accepted
- Date: 2026-08-01

## Context

Three issues were raised together:

1. **Hero spacing bug.** On Resume, Projects, and Articles the eyebrow, page
   title, and subtitle were glued together with zero vertical gap, on desktop
   and mobile. Root cause: the global `* { margin: 0 }` reset in `global.css`
   plus a plain `<div>` wrapper inside `.page-hero` / `.resume-hero` with no
   `display: grid; gap`. The home page never had the bug because `.hero-copy`
   is a grid with `gap: 1rem`.
2. **Per-page search duplication.** Projects and Articles each had their own
   search box (two near-identical delegated scripts) that could only filter
   their own page's cards.
3. **Navbar layout.** The desktop nav was logo-left + links-right; the user
   wanted a tri-zone layout — menus left, logo center, search right — and a
   single Global Search covering the whole site, with pagination.

Research inputs (NN/g): *Search: Visible and Simple* (desktop search must be an
open text field, icon-only is acceptable on mobile, field wide enough to see
the query — ≥27ch), *The Magnifying-Glass Icon in Search Design* (icon must
submit, Enter must work, schematic icon, large target, upper-right placement),
*Infinite Scrolling Is Not for Every Website* (pagination is correct for
goal-oriented finding), *Hamburger Menus and Hidden Navigation Hurt UX
Metrics*.

## Decision

**Hero spacing.** `.page-hero > div:first-child` and
`.resume-hero > div:first-child` become `display: grid; gap: 0.75rem`. The
desktop two-column hero rule now applies to `.resume-hero` only (it is the
only hero with a second column after per-page search removal); single-child
heroes stay full width. Regression-locked by bounding-box tests (≥8px between
eyebrow→title and title→subtitle on 4 pages × 2 viewports).

**Navbar tri-zone.** DOM order in `Layout.astro` is `.nav-links` → `.logo` →
`.nav-actions` so tab order matches visual order (WCAG 2.4.3). Desktop ≥768px:
`.nav-content` becomes `grid-template-columns: 1fr auto 1fr` — pill menu
`justify-self: start`, logo `center`, actions `end`. The pill wrapper around
menu links is kept (segmented-control metaphor: the active page reads as the
selected segment; zero style churn). Mobile <768px: unchanged pattern — logo
left, actions right (search icon + burger), following apple.com's current
mobile convention; a bottom tab bar was considered (NN/g favors visible
navigation) but rejected by the user in favor of that convention.

**Search entry points (NN/g-conform).** Desktop: an open text field
(`.nav-search-input`, 27ch) + submit button as a native
`<form action="/search/" method="get">` — submission works with JavaScript
disabled. Mobile: icon-only `.nav-search-link` (44px target, schematic
magnifier, `aria-label`) linking to `/search/`, where the field is focused on
arrival ("don't make people click twice").

**Global Search page (`/search/`).**

- **Search Index**: built at build time in the page frontmatter from the
  articles content collection + `projects/experiences/educations/skills.json`
  + 14 clinical tools (mirrored from `MedicalTools.tsx`, EN strings —
  duplication accepted and documented here) + the 5 top-level pages. Metadata
  only (title, description, keywords) — no article bodies — ≈39 items, ~10KB.
- The index is embedded as HTML-escaped JSON in a hidden `<div
  id="search-index">` (in the DOM, not on `window`), so ClientRouter body
  swaps always restore it fresh and no extra fetch is needed on flaky
  connections.
- **Filtering**: vanilla JS, delegated `input` listener + idempotent
  registration (`window.__globalSearchDelegated`) per ADR-0001's script-
  lifecycle rules. Tokens AND-match; relevance score title(4) > keywords(2) >
  description(1) because "the first results page is golden". Results render
  via `textContent` only (no `innerHTML`) — queries can never inject markup.
- **Pagination**: 10 per page, real `<a href="?q=&page=N">` links, state
  synced to the URL. Typing uses `history.replaceState` (no history spam);
  pagination navigates (back/forward works). Empty query = browse-all mode.
- **ClientRouter state preservation**: `replaceState` must pass
  `window.history.state` (not `null`) — passing null clobbers the router's
  per-entry metadata and breaks its popstate DOM restoration (found via a
  failing regression test: after back-navigation the URL changed but the
  articles DOM remained).
- **No-JS degradation**: the server renders the first 10 results + an honest
  count; pagination is JS-only because static hosting cannot vary a page by
  query string. The navbar form still submits.

**Per-page search removal.** `.page-tools`, `#empty-state`, and both delegated
scripts are deleted from Projects and Articles; their tests were replaced by
`tests/search.spec.ts` (16 tests). `.search-input` styles are reused by the
search page.

## Consequences

- Bundle: +~12KB on `/search/` only (index JSON + ~2KB JS); other pages gain
  only the small navbar form/icon markup (~0.5KB). No new dependencies.
- Clinical tool metadata is now duplicated (component + search index); when
  tools change, update both — acceptable until a shared data module is wanted.
- Lighthouse gate (local, preview build, 2026-08-01): mobile 100/100/100/100
  on home, resume, projects, articles, search, search?q=go; desktop home
  97/100/100/100; TBT 0, CLS 0, console errors 0 everywhere. Zero regression
  vs the ADR-0001 baseline.
- Playwright: 89/89 green (73 pre-existing after removing 2 per-page search
  tests, +16 new).
