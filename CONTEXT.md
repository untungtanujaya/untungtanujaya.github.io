# Portfolio Website

This context defines the public portfolio concepts used by Untung Tanujaya's personal website. It keeps product language consistent across the resume, projects, writing, and clinical app areas.

## Language

**Portfolio Site**:
The public website that presents Untung Tanujaya's professional profile, selected work, technical writing, and clinical utilities.
_Avoid_: Personal homepage, landing page

**Project**:
A selected work sample that demonstrates a concrete system, workflow, or product contribution.
_Avoid_: Case, item

**Technical Article**:
A written explanation of a software engineering problem, pattern, or lesson learned.
_Avoid_: Blog post, note

**Clinical App**:
A client-facing calculator or assessment utility for a clinical specialty workflow.
_Avoid_: Medical tool, calculator

**Motion System**:
The set of rules governing how elements on the Portfolio Site enter, travel, and respond to interaction. It exists to make the site feel polished without ever delaying or hiding content, and it is bound by a zero-regression performance contract (Lighthouse scores and Web Vitals must not degrade).
_Avoid_: Animations, effects layer

**Reveal**:
The entrance of a content element into view. Above the fold a Reveal is position-only and never touches visibility; below the fold it may include a gentle fade once the visitor scrolls to it. Content is always fully present without it.
_Avoid_: Scroll animation, fade-in

**Page Transition**:
The visual continuity when a visitor moves between pages of the Portfolio Site, replacing the browser's default hard cut. Unsupported browsers simply keep the hard cut.
_Avoid_: SPA navigation, route animation
