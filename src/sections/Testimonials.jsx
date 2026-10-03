import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { testimonials } from '../data/testimonials';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

// Each card's pose in the scattered pile: rotation (deg) plus a nudge (px) off the pile centre.
const PILE = [
  { rotate: -9, x: -40, y: 30 },
  { rotate: 4, x: 0, y: -20 },
  { rotate: 9, x: 40, y: 30 },
  { rotate: -18, x: -25, y: -50 },
  { rotate: 16, x: 25, y: -60 },
];

/**
 * Testimonials start as a messy pile and spread open into a neat layout as you scroll.
 * Layering per card (outer → inner):
 *   <li data-pile-slot>   untransformed: layout slot, measured for the pile offsets, scroll trigger
 *   [data-pile-card]      GSAP scrubbed pile → spread
 *   <figure>              CSS hover lift
 */
export default function Testimonials() {
  const root = useRef(null);
  const pile = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const slots = gsap.utils.toArray('[data-pile-slot]');
      const cards = slots.map((slot) => slot.querySelector('[data-pile-card]'));
      const pose = (i) => PILE[i % PILE.length];

      // Desktop: every card is pulled to the centre of the group, tilted, then fans out to its slot.
      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        const centre = (i, axis) => {
          const slot = slots[i];
          const list = pile.current;
          return axis === 'x'
            ? list.offsetWidth / 2 - (slot.offsetLeft + slot.offsetWidth / 2)
            : list.offsetHeight / 2 - (slot.offsetTop + slot.offsetHeight / 2);
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pile.current,
            start: 'center 95%',
            end: 'center 45%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        // One tween per card (not a staggered tween) so every card renders its pile pose
        // up front; a staggered fromTo only applies the first card's start state.
        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            {
              x: () => centre(i, 'x') + pose(i).x,
              y: () => centre(i, 'y') + pose(i).y,
              rotate: pose(i).rotate,
              scale: 0.94,
            },
            { x: 0, y: 0, rotate: 0, scale: 1, ease: 'power3.out', immediateRender: true },
            i * 0.06,
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="testimonials-title" className="overflow-hidden py-28 md:py-40">
      <div className="gutter">
        <div className="mb-16 md:mb-24">
          <SectionLabel index="(05)">Kind words</SectionLabel>
          <SplitTextReveal id="testimonials-title" className="mt-6 font-display text-display font-bold">
            Clients who <span className="text-teal">stay</span>
          </SplitTextReveal>
        </div>

        <ul
          ref={pile}
          className="relative flex flex-col items-center gap-5 lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:gap-6"
        >
          {testimonials.map((t, i) => (
            <li
              key={t.name}
              data-pile-slot
              className="relative w-full max-w-[34rem] lg:w-[min(26rem,28vw)] lg:max-w-none"
            >
              <div data-pile-card className="motion-safe:will-change-transform">
                <figure
                  className={`flex min-h-[22rem] flex-col justify-between rounded-3xl border-4 border-paper p-7 shadow-[0_24px_60px_-28px_rgb(20_33_31/0.35)] transition-transform duration-500 ease-expo hover:-translate-y-1.5 md:p-10 ${
                    i % 2 ? 'bg-mint' : 'bg-card'
                  }`}
                >
                  <Quote aria-hidden="true" className="size-9 fill-teal/20 text-teal" />
                  <blockquote className="mt-7 font-display text-lg font-medium leading-snug tracking-tight md:text-xl">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full bg-teal/15 font-display text-sm font-bold text-teal"
                    >
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <span>
                      <cite className="block font-semibold not-italic">{t.name}</cite>
                      <span className="text-sm text-muted">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
