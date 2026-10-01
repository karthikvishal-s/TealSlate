# TealSlate

**We craft brands that move.**

TealSlate is a creative production studio that builds websites, brand identities, films, and digital campaigns. This repository holds the studio's landing site. The site doubles as its portfolio piece, so it is cinematic, motion-led, and tuned for smooth performance on every screen size.

![TealSlate landing page, hero section](docs/preview.jpg)

---

## Highlights

- **Interactive hero image trail.** Photos glide in along the cursor path, tilt, and fade as you move across the headline.
- **Cinematic preloader.** A 0→100 counter with the wordmark, then a curtain wipe that hands off to the hero animation.
- **Smooth scrolling.** Lenis runs from GSAP's ticker, so the smooth scroll and every scroll-driven animation update in the same frame.
- **Split-text reveals.** Headlines rise line by line, or word by word, from behind masks as they enter the viewport.
- **Scroll-scrubbed storytelling:**
  - The showreel frame expands from a card to full-bleed.
  - The studio statement fills in word by word.
  - A process timeline line draws itself as you scroll.
- **Meet the founders.** The founder cards tilt in 3D toward the cursor, with a moving light sheen and skill chips that pop in on hover. A circular badge spins faster as you scroll, and the cards reveal and drift in parallax.
- **Parallax photo collage.** Studio photos wipe into view, and each one drifts at its own speed.
- **Pinned horizontal services.** On desktop the six service cards scroll sideways and their photos drift in parallax. On mobile they stack as sticky cards.
- **Selected work list.** A floating preview follows the cursor with spring physics and leans into movement. Each row wipes open as it scrolls in.
- **Custom cursor.** A dot and a trailing ring that change state over links, projects ("View"), and the carousel ("Drag").
- **Magnetic interactions.** Buttons and the contact heading pull toward the cursor and spring back.
- **Velocity-aware marquees.** Client logos speed up with fast scrolling and flip direction when you scroll up.
- **Draggable testimonials.** Momentum snaps to the nearest card, with button and keyboard controls.
- **Contact form.** Inline validation, focus management, and loading, success, and error states.
- **Sticky footer reveal.** The footer sits underneath the page and is uncovered as you reach the bottom.

## Built with

| | |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4, with design tokens defined via `@theme` |
| Scroll animation | GSAP, ScrollTrigger, SplitText (`@gsap/react`) |
| Interaction animation | Motion |
| Smooth scroll | Lenis |
| Icons | Lucide |
| Palette | Warm paper (#F5F2EC), deep slate ink (#14211F), teal (#0F766E) |
| Type | Plus Jakarta Sans (display) and Inter (body) |

**Motion rule of thumb:** GSAP owns everything driven by scrolling, and Motion owns everything driven by the pointer. The two never animate the same element.

## Accessibility & performance

- **Reduced motion.** `prefers-reduced-motion` turns off smooth scrolling, pinning, and cursor effects, and leaves simple fades in their place.
- **Semantics and focus.** The markup is semantic, there's a skip link, form labels are accessible, and focus states are visible.
- **Touch devices** get their own layouts, with no custom cursor and inline project images.
- **Cheap animation.** Only `transform`, `opacity`, and `clip-path` are animated, and every animation is cleaned up when its component unmounts.
- **Small, cacheable bundles.** Media loads lazily, and React, GSAP, and Motion ship as separately cached vendor chunks.
- **SEO.** Meta description, Open Graph, and Twitter card tags are in place.

## Project structure

```
src/
├── components/   Reusable UI and motion primitives (cursor, preloader, navbar, magnetic button, marquee…)
├── sections/     Page sections: Hero → Showreel → Clients → About → Services → Work → Process → Stats → Testimonials → Contact → Footer
├── hooks/        Lenis access, media queries, pointer position, magnetic behaviour
├── data/         All site copy and content (including founders)
├── assets/       Optimized WebP photography (see assets/images/CREDITS.md)
├── lib/          GSAP registration, motion presets, contact form integration
└── index.css     Design tokens, global styles, and keyframes
```

## Photography

The placeholder photography is from [Unsplash](https://unsplash.com) under the Unsplash License. Photographers are credited in `src/assets/images/CREDITS.md`.

## License

© 2026 TealSlate. All rights reserved.

This code, design, and content are proprietary. No permission is granted to copy, modify, redistribute, or reuse any part of this repository.
