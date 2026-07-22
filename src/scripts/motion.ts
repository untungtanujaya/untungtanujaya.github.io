/**
 * Motion System — single orchestration module for all animation effects.
 * See docs/adr/0001-motion-system-zero-regression.md for the contract.
 *
 * Effects owned here:
 *  - scrollReveals: IntersectionObserver + WAAPI, transform/opacity only.
 *      - `data-reveal="shift"` (above-fold, e.g. hero support elements):
 *        transform-only, opacity is NEVER animated (LCP guard).
 *      - `data-reveal` (below-fold): opacity+transform, revealed on scroll.
 *  - heroReveal: word-level stagger on the home hero title (transform-only).
 *
 * Kill-switch: flip a flag here to disable an effect without removing code.
 * Page transitions & spring micro-interactions are separate kill-switches:
 * see Layout.astro (MOTION.pageTransitions) and global.css (--apple-spring).
 *
 * Invariants (do not break):
 *  - Reduced motion = OFF TOTAL. The .motion-ok gate class is only added by
 *    the inline gate script when the user has no reduced-motion preference,
 *    and initMotion() bails out as well. No-JS = content fully visible.
 *  - Failsafe: if this module fails to load, the inline gate adds .motion-off
 *    after 2.5s and every CSS start-state is released (content visible).
 */
const CONFIG = {
  scrollReveals: true,
  heroReveal: true,
} as const;

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'; // --apple-response: critically damped feel
const REVEAL_DISTANCE = '14px';
const REVEAL_DURATION = 450;
const REVEAL_STAGGER = 60;
const REVEAL_STAGGER_CAP = 300;
const HERO_WORD_DURATION = 500;
const HERO_WORD_STAGGER = 55;

let observer: IntersectionObserver | null = null;

function settle(el: HTMLElement, anim: Animation) {
  anim.addEventListener('finish', () => {
    anim.cancel();
    // Write the end state inline so the CSS gate can't re-hide the element
    // (works everywhere WAAPI works; no commitStyles support needed).
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.setAttribute('data-reveal-done', '');
  }, { once: true });
}

function initScrollReveals() {
  // Split into two cohorts:
  //  - immediate: explicit shift variants + anything above the fold at load.
  //    These animate transform-only RIGHT NOW with stagger — opacity is never
  //    animated above the fold (LCP guard: a fade would delay the LCP paint).
  //  - observed: below the fold — opacity+transform reveal on scroll (IO).
  const immediate: HTMLElement[] = [];
  const observed: HTMLElement[] = [];
  const foldLine = window.innerHeight * 0.9;

  document
    .querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-done])')
    .forEach((el) => {
      if (el.getAttribute('data-reveal') === 'shift' || el.getBoundingClientRect().top < foldLine) {
        immediate.push(el);
      } else {
        observed.push(el);
      }
    });

  immediate.forEach((el, i) => {
    const anim = el.animate(
      [
        { opacity: '1', transform: `translateY(${REVEAL_DISTANCE})` },
        { opacity: '1', transform: 'translateY(0)' },
      ],
      {
        duration: REVEAL_DURATION,
        delay: Math.min(i * REVEAL_STAGGER, REVEAL_STAGGER_CAP),
        easing: EASE_OUT,
        fill: 'both',
      },
    );
    settle(el, anim);
  });

  if (observed.length > 0) {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          const el = entry.target as HTMLElement;
          const anim = el.animate(
            [
              { opacity: '0', transform: `translateY(${REVEAL_DISTANCE})` },
              { opacity: '1', transform: 'translateY(0)' },
            ],
            { duration: REVEAL_DURATION, easing: EASE_OUT, fill: 'both' },
          );
          settle(el, anim);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observed.forEach((el) => observer!.observe(el));
  }
}

function initHeroReveal() {
  const words = Array.from(
    document.querySelectorAll<HTMLElement>('.hero-title .word:not([data-reveal-done])'),
  );
  words.forEach((word, i) => {
    const anim = word.animate(
      [{ transform: 'translateY(0.35em)' }, { transform: 'translateY(0)' }],
      { duration: HERO_WORD_DURATION, delay: i * HERO_WORD_STAGGER, easing: EASE_OUT, fill: 'both' },
    );
    settle(word, anim);
  });
}

function initMotion() {
  const w = window as unknown as { __motionFailsafe?: number };
  window.clearTimeout(w.__motionFailsafe);
  document.documentElement.classList.remove('motion-off');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (CONFIG.scrollReveals) initScrollReveals();
  if (CONFIG.heroReveal) initHeroReveal();
}

// astro:page-load fires on initial load and after every ClientRouter swap.
document.addEventListener('astro:page-load', initMotion);
