---
name: emil-design-eng
description: >-
  Emil Kowalski's philosophy on UI polish, component craft, animation decisions,
  spring physics, custom easing curves, sub-300ms timings, and invisible details.
---

# Emil Kowalski Design Engineering & Animation Philosophy

## Core Principles

1. **Taste is trained, not innate:**
   - Reverse engineer animations. Inspect interactions.
   - Unseen details compound into software that feels immediately right.

2. **The 10 Non-Negotiable Animation Standards:**
   - **Justified motion:** Clear purpose (Feedback, Spatial consistency, State indication, Preventing jarring changes). Never "it looks cool" on high-frequency elements.
   - **Frequency-appropriate:** 
     - 100+/day (keyboard shortcuts, command palette) → **0ms / No animation**.
     - Tens/day (hover, lists) → Near-imperceptible, fast and subtle (120–180ms).
     - Occasional (modals, drawers, toasts) → Standard (200–280ms).
     - Rare (celebration, onboarding) → Delight budget.
   - **Responsive Custom Easing:**
     - **Never use `ease-in` on UI entrances.** It delays the exact moment the user watches most.
     - Use custom strong curves:
       ```css
       --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
       --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
       --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
       ```
   - **Sub-300ms Duration Rule:**
     - Button press feedback: `100–160ms`
     - Tooltips / Popovers: `125–200ms`
     - Dropdowns / Selects: `150–220ms`
     - Modals / Drawers: `200–280ms`
   - **Physical Correctness & Origin Awareness:**
     - **Never animate from `scale(0)`.** Start from `scale(0.95)` + `opacity: 0`.
     - Popovers scale from their trigger (`transform-origin`), modals stay centered.
   - **Button Press Responsiveness:**
     - Add `transform: scale(0.97)` on `:active` with `transition: transform 160ms var(--ease-out)`.
   - **GPU-Only Properties:**
     - Animate `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`.
   - **Accessibility & Hover Gating:**
     - Gate hover states: `@media (hover: hover) and (pointer: fine)`.
     - Support `@media (prefers-reduced-motion: reduce)`: preserve opacity and color transitions, drop spatial motion.
