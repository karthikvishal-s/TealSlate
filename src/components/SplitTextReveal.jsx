import { useRef } from 'react';
import { gsap, SplitText, useGSAP, MOTION_OK, REDUCED } from '../lib/gsap';

/**
 * Masked slide-up reveal for headings, split by lines or words.
 *
 * - `ready` undefined → plays when scrolled into view.
 * - `ready` boolean   → plays as soon as it becomes true (e.g. hero after preloader).
 */
export default function SplitTextReveal({
  as: Tag = 'h2',
  type = 'lines',
  ready,
  delay = 0,
  stagger,
  duration = 1.3,
  start = 'top 85%',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (ready === false) return;
      const el = ref.current;
      // Only attach a ScrollTrigger when scroll-driven (an explicit `scrollTrigger: undefined` key still registers the plugin).
      const trigger = ready === undefined ? { scrollTrigger: { trigger: el, start, once: true } } : {};
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        SplitText.create(el, {
          type,
          mask: type,
          linesClass: 'split-line',
          wordsClass: 'split-word',
          // autoSplit re-splits on resize/font load; returning the tween lets GSAP
          // carry its progress over to the new split.
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self[type], {
              yPercent: 115,
              rotate: type === 'words' ? 4 : 0,
              duration,
              delay,
              stagger: stagger ?? (type === 'lines' ? 0.1 : 0.04),
              ease: 'expo.out',
              ...trigger,
            }),
        });
      });

      // Reduced motion: scroll reveals become a plain fade; ready-gated text (hero)
      // simply appears, since the preloader's fade-out already reveals it.
      mm.add(REDUCED, () => {
        if (ready !== undefined) return;
        gsap.from(el, { autoAlpha: 0, duration: 0.6, ease: 'power1.out', ...trigger });
      });
    },
    { scope: ref, dependencies: [ready] },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
