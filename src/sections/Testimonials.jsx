import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { gsap, SplitText, useGSAP, MOTION_OK, DESKTOP, MOBILE } from '../lib/gsap';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { stretch } from '../lib/velocity';
import { testimonials } from '../data/testimonials';
import SplitTextReveal from '../components/SplitTextReveal';

// Each card's pose in the scattered pile: rotation (deg) plus a nudge (px) off the pile centre.
const PILE = [
  { rotate: -9, x: -40, y: 30 },
  { rotate: 4, x: 0, y: -20 },
  { rotate: 9, x: 40, y: 30 },
  { rotate: -18, x: -25, y: -50 },
  { rotate: 16, x: 25, y: -60 },
];
// Stacking order within the pile: the near-straight second card sits on top.
const STACK = [3, 5, 4, 1, 2];
const tiltSpring = { stiffness: 260, damping: 24, mass: 0.3 };
const DIM = 0.18; // undeveloped quote words

/**
 * One review card. Desktop mouse: it tilts toward the pointer under a soft moving sheen and
 * lifts while hovered (Motion springs on the figure; GSAP owns the wrappers around it).
 */
function ReviewCard({ t, i }) {
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  const interactive = desktop && !touch && !reduced;
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const lift = useSpring(0, tiltSpring);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(20);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.55), transparent 60%)`;

  const onPointerMove = (e) => {
    if (!interactive || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set(-(py - 0.5) * 10);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };
  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
  };

  return (
    <motion.figure
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => interactive && e.pointerType === 'mouse' && lift.set(-6)}
      onPointerLeave={onPointerLeave}
      style={interactive ? { rotateX, rotateY, y: lift, transformPerspective: 900 } : undefined}
      className={`group relative flex min-h-[22rem] flex-col justify-between rounded-3xl border-4 border-paper p-7 shadow-[0_24px_60px_-28px_rgb(20_33_31/0.35)] md:p-10 ${
        i % 2 ? 'bg-mint' : 'bg-card'
      }`}
    >
      {interactive && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
      )}
      <Quote
        aria-hidden="true"
        className="size-9 fill-teal/20 text-teal transition-[transform,fill] duration-200 ease-expo group-hover:-rotate-8 group-hover:fill-teal"
      />
      <blockquote data-quote className="mt-7 font-display text-lg font-medium leading-snug tracking-tight md:text-xl">
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
    </motion.figure>
  );
}

/**
 * Testimonials start as a messy pile and spread open as you scroll.
 * - Desktop: the pile fans out into a neat 3 + 2 layout.
 * - Phones/tablets: there's only room to read one card at a time, so the cards stay in a
 *   pinned pile and each scroll step deals the top card away while the next one straightens.
 * The quotes "develop" as they arrive: words go from faint to full ink as the pile fans out
 * (desktop) or as each card straightens to the top of the deck (phones). Hovering a card
 * (desktop) tilts it toward the pointer and dims the others, a focus pull.
 * Layering per card (outer → inner):
 *   <li data-pile-slot>   untransformed: layout slot, measured for the pile offsets, scroll trigger
 *   [data-pile-card]      GSAP scrubbed pile → spread
 *   [data-stretch]        GSAP scroll-speed lean
 *   .focus-dim            CSS focus pull (opacity + scale)
 *   <figure>              Motion tilt, sheen, lift
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
      // Quote words, split per card (reverted with the matchMedia context).
      const splitQuotes = () =>
        slots.map((slot) => SplitText.create(slot.querySelector('[data-quote]'), { type: 'words' }).words);

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
            // A long, gentle range so the spread unfolds at reading pace.
            start: 'center 100%',
            end: 'center 35%',
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
            { x: 0, y: 0, rotate: 0, scale: 1, ease: 'power2.out', immediateRender: true },
            i * 0.1,
          );
        });
        // Each quote develops word by word as its card settles into place.
        splitQuotes().forEach((words, i) => {
          tl.fromTo(words, { opacity: DIM }, { opacity: 1, ease: 'none', duration: 0.6, stagger: { amount: 0.35 } }, 0.2 + i * 0.1);
        });

        // Cards lean with scroll speed (on a wrapper; the pile tween owns the card itself).
        return stretch(pile.current.querySelectorAll('[data-stretch]'));
      });

      // Phones/tablets: a pinned deck. The cards share one spot (CSS grid stack); the top card
      // is flat and readable, the rest peek out tilted beneath it. Each scroll step deals the
      // top card up and away while the next one straightens into place.
      mm.add(`${MOBILE} and ${MOTION_OK}`, () => {
        const count = cards.length;
        // Pose of a card `depth` places below the top of the deck.
        const deckPose = (i, depth) =>
          depth === 0
            ? { rotate: 0, y: 0, scale: 1 }
            : { rotate: pose(i).rotate * 0.6, y: depth * 12, scale: 1 - depth * 0.04 };

        slots.forEach((slot, i) => gsap.set(slot, { zIndex: count - i }));
        cards.forEach((card, i) => gsap.set(card, deckPose(i, i)));
        // The top card reads in full; the rest develop as they reach the top.
        const words = splitQuotes();
        words.forEach((w, i) => gsap.set(w, { opacity: i ? DIM : 1 }));

        const STEP = 1; // one deal
        const HOLD = 0.45; // a pause with the new top card flat, so it can be read
        const tl = gsap.timeline({
          defaults: { duration: STEP, ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: pile.current,
            start: 'center 52%',
            end: () => `+=${window.innerHeight * 0.5 * ((count - 1) * (STEP + HOLD) + HOLD)}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        for (let k = 0; k < count - 1; k++) {
          const at = HOLD + k * (STEP + HOLD);
          tl.to(
            cards[k],
            {
              y: () => -window.innerHeight * 0.75,
              x: k % 2 ? 70 : -70,
              rotate: k % 2 ? 12 : -12,
              autoAlpha: 0,
              ease: 'power2.in',
            },
            at,
          );
          for (let j = k + 1; j < count; j++) tl.to(cards[j], deckPose(j, j - k - 1), at);
          tl.to(words[k + 1], { opacity: 1, ease: 'none', duration: STEP * 0.5, stagger: { amount: STEP * 0.4 } }, at + STEP * 0.3);
        }
        tl.to({}, { duration: HOLD }); // let the last card rest before the pin releases
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="testimonials-title" className="overflow-hidden py-28 md:py-40">
      <div className="gutter">
        <div className="mb-16 md:mb-24">
          <SplitTextReveal id="testimonials-title" className="font-display text-display font-bold">
            Clients who <span className="text-teal">stay</span>
          </SplitTextReveal>
        </div>

        <ul
          ref={pile}
          // Below lg with motion on, the cards stack in one grid cell to form the deck.
          className="review-pile relative flex flex-col items-center gap-5 max-lg:motion-safe:grid max-lg:motion-safe:place-items-center lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:gap-6"
        >
          {testimonials.map((t, i) => (
            <li
              key={t.name}
              data-pile-slot
              className="relative w-full max-w-[34rem] max-lg:motion-safe:[grid-area:1/1] lg:w-[min(26rem,28vw)] lg:max-w-none lg:portrait:w-[min(26rem,42vw)]"
              style={{ zIndex: STACK[i % STACK.length] }}
            >
              <div data-pile-card className="motion-safe:will-change-transform">
                <div data-stretch>
                  <div className="focus-dim">
                    <ReviewCard t={t} i={i} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
