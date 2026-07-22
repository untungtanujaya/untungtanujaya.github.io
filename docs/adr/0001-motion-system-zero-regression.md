# ADR-0001: Motion System — zero-regression contract, no animation library

- Status: Accepted
- Date: 2026-07-22

## Context

The Portfolio Site had zero JavaScript animation (CSS hover/tap transitions only)
and Lighthouse mobile Performance 95–100, A11y/BP/SEO 100. We wanted "advanced"
motion (scroll reveals, page transitions, hero text reveal, spring
micro-interactions) as pure UX polish, under the original constraint that the
site must stay fast on low-end phones with flaky connections, with objective
proof that nothing regressed.

A future reader will wonder why there is no animation library (GSAP,
framer-motion, Motion One) in `package.json` — this is deliberate, not an
oversight.

## Decision

**Contract (zero-regression gate).** Every motion effect ships under a hard
gate: Lighthouse mobile Performance stays 100 on home / ≥95 elsewhere (same 9
audited pages), A11y/BP/SEO stay 100, with sub-gates LCP +≤0.1s, CLS 0,
TBT +≤50ms per page. Evidence = before/after Lighthouse runs on the 9 pages +
bundle diff + full Playwright suite, stored under `audit/`. An effect that
breaks the gate is switched off via its kill-switch — no debate.

**Stack (no library).**

- Scroll reveals: IntersectionObserver + WAAPI (`element.animate()`),
  transform/opacity only, unobserve after first reveal.
- Page transitions: Astro `<ClientRouter />` (native View Transitions API),
  mirrored fade/slide keyframes.
- Spring micro-interactions: CSS `linear()` critically-damped spring curve in
  `--apple-spring` (zero JS bytes), with cubic-bezier fallback.
- One orchestration module `src/scripts/motion.ts` (~1.5KB inlined by Astro).

**LCP guard.** Opacity is never animated on elements that may contain the LCP
candidate: hero title words use `data-reveal="shift"` (transform-only), and any
`data-reveal` element above the fold at load is automatically promoted to the
transform-only cohort. Below the fold, reveals may fade.

**Reduced motion = off total.** The `.motion-ok` gate class is added only when
the user has no reduced-motion preference; `motion.ts` also bails out. View
Transitions are forced instant. No-JS keeps all content visible because start
states live behind the JS-added gate; a 2.5s failsafe (`.motion-off`) releases
all start states if the module fails to load.

**Doctrine.** Springs are critically damped (damping ratio 1.0) everywhere;
overshoot/bounce is reserved for momentum-driven gestures only (there are none
yet). The previous hover overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) was
removed for this reason.

**Kill-switches.** `CONFIG` in `src/scripts/motion.ts` (scrollReveals,
heroReveal), `MOTION.pageTransitions` in `Layout.astro`, `--apple-spring` in
`global.css`.

## Consequences

- Positive: all four effects run on the compositor thread; total added JS is
  ~7KB gzip (ClientRouter 5.4KB cached + 1.5KB inlined module); TBT stayed 0,
  CLS stayed 0, LCP within noise on all audited pages; reduced-motion and no-JS
  users get a fully readable site.
- Negative: WAAPI/View Transitions exclude very old browsers (they degrade to
  no animation, which is acceptable by design); the `.motion-ok` gate +
  failsafe adds two small concepts contributors must understand before touching
  reveal markup.
- **Script lifecycle constraint (discovered 2026-07-22):** with ClientRouter,
  `is:inline` scripts execute only once and the `<body>` DOM is replaced on
  every navigation — listeners attached to elements die with the old DOM. Any
  persistent UI behavior (menu toggle, search inputs) MUST use document-level
  event delegation with idempotent registration, not per-element listeners.
  Violating this produced the "burger menu dead after navigation" bug.
- Neutral: reveal choreography constants (distance 14px, duration 450ms,
  stagger 60ms) live in `motion.ts` and are tuning, not contract.

## Alternatives considered

- **GSAP / framer-motion / Motion One**: 4–50KB gzip plus per-page parse cost,
  buying physics we only need in critically-damped form — rejected by the gate.
- **CSS scroll-driven animations** (`animation-timeline: view()`): zero JS but
  support is not universal; using it would force a second fallback code path —
  rejected for duplication.
- **Custom View Transitions script instead of ClientRouter**: would have to
  re-implement React island re-hydration after swaps — rejected; ~2KB saved is
  not worth correctness risk.
- **Fade reveals above the fold**: measurably delayed LCP (+0.15s on list
  pages) in the first implementation — replaced by the transform-only cohort.
