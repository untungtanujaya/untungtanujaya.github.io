# ADR-0003: Warm editorial redesign — serif display type, single brass accent, subset variable fonts

- Status: Accepted
- Date: 2026-10-03

## Context

Two goals were set together:

1. **New UI/UX that does not look AI-generated.** The v3 baseline look
   (blue-black `#07090d`, six pastel accents, 800-weight sans headings) is a
   recognizable "vibe-coded" fingerprint. The redesign had to read as
   hand-crafted, keep the Motion System contract (ADR-0001), and keep
   Lighthouse green on desktop and mobile.
2. **Content update.** The owner is now an M.S. Software Engineering student
   at Harbin Institute of Technology (started 2026-09-01); the fr8co role
   ended June 2026. Location is Harbin, China.

## Decision

### Design language ("warm editorial")

- **Palette:** warm ink neutrals (`--bg-primary: #131110`) with exactly one
  accent, brass `#d2a75e`. Semantic hues (teal/purple/blue/green) survive only
  in muted form for clinical-app categories and search-result type badges —
  semantic color carries meaning, never decoration.
- **Typography:** Fraunces (variable serif, optical sizing) for all headings;
  Plus Jakarta Sans for body; mono for eyebrows/meta with a brass hairline
  dash. Hero name uses italic serif in brass. Headings run light (500–640) —
  serif carries hierarchy through contrast, not weight.
- **Micro-motion** (transform/opacity only, LCP-safe): nav-link underline
  grows on hover (desktop), primary-button arrow nudge, card titles settle to
  brass on hover. Existing reveal/page-transition system untouched.
- **Desktop nav: underline metaphor, not buttons.** The tri-zone layout
  (ADR-0002) is kept, but the pill container, link background fills, and
  spring lift/compress are removed — nav links are plain text links whose
  only affordance is the growing brass hairline (consistent with the eyebrow
  dashes and hairline borders). Mobile dropdown keeps fills (touch targets).
  One affordance metaphor per component; stacking pill + underline read as
  indecisive.

### Font engineering (the performance crux)

Naively adding Fraunces costs 173KB of preloads (Jakarta 27KB + Fraunces
normal 66KB + italic 80KB), which dropped desktop-home Lighthouse 97 → 87
(LCP 1.13s → 2.26s simulated). Recovery steps, measured at each step:

| Step | Font payload | desktop-home P | LCP (sim) |
|---|---|---|---|
| Baseline (sans only) | 27KB | 97 | 1.13s |
| + full Fraunces normal+italic | 173KB | 87 | 2.26s |
| pyftsubset → latin subset | 105KB | 91 | 1.80s |
| + instancer pins `opsz=72` (drops axis) | 70KB | 93 | 1.58s |

Final state:

- `@font-face` declared manually in `global.css`; `@fontsource-variable/fraunces`
  CSS imports removed (package kept as the subset source).
- Subset files live in `public/fonts/` (unhashed URLs so `Layout.astro` can
  preload them): `fraunces-opsz-normal-sub.woff2` (24KB, ASCII + punctuation,
  `wght` axis 100–900 kept, `opsz` pinned at 72 — display optical size always,
  headings only), `fraunces-opsz-italic-sub.woff2` (19KB, `A–Za–z.'’` only —
  covers the hero accent word).
- All three fonts (sans 27KB + serif 24KB + italic 19KB) are preloaded;
  removing the italic preload was measured and is *worse* (89 vs 91) because
  the hero title contains the italic word.
- Subset tooling: `.fonttools-venv/` (git-ignored) + `pyftsubset` +
  `fonttools varLib.instancer` + `ttLib.woff2 compress`. Regenerate by
  re-running the same commands against `node_modules/@fontsource-variable/fraunces/files/`.

### Content

- `index.astro`: hero meta → "Harbin, China • M.S. Software Engineering
  student at Harbin Institute of Technology"; now-panel → pursuing M.S. copy
  (focus: AI + software engineering; no computational-biology mention — field
  of research not yet decided).
- `resume.astro`: summary mentions current M.S.; location → Harbin, China.
- `educations.json`: HIT entry description rewritten (kept 2026-09 – Present).
- `experiences.json`: fr8co `end_date` → "June 2026". (The "13-month tenure"
  claim in its description now matches exactly: May 2025 – June 2026.)

## Consequences

- **Mobile is untouched or better:** mobile-home back to 100, all mobile pages
  99–100, A11y/BP/SEO 100 everywhere, TBT 0, CLS 0.000.
- **desktop-home 97 → 93** (simulated LCP 1.58s). This is Lantern pessimism
  about a second font family — observed LCP is ~37ms and all fonts finish
  ~11ms into the trace. Accepted as the inherent price of a serif display
  face; closing the last points would require dropping the serif or the
  preload, both worse tradeoffs.
- Playwright 89/89 green; all DOM structure, class names, and the motion-gate
  contract preserved (redesign is CSS + content only).
- Italic subset is content-coupled: if the hero accent word changes beyond
  `A–Za–z.'’`, the italic subset must be regenerated (see tooling above).
