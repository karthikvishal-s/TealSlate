import { useEffect, useRef, useState } from 'react';
import { motion, useAnimate, useInView, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { Clapperboard, RotateCcw } from 'lucide-react';
import { easeExpo } from '../lib/motion';
import { site } from '../data/site';
import DevelopImage from './DevelopImage';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';

const tiltSpring = { stiffness: 260, damping: 22, mass: 0.3 };
const flipSpring = { type: 'spring', stiffness: 120, damping: 20 };
// Clapperboard stripes (the subject itself, so stripes are earned here).
const STRIPES = 'repeating-linear-gradient(-45deg, var(--color-paper) 0 14px, var(--color-ink) 14px 28px)';
const STRIPES_BAR = 'repeating-linear-gradient(45deg, var(--color-paper) 0 14px, var(--color-ink) 14px 28px)';

/** Animated abstract portrait used until a real founder photo is added. */
function PortraitArt({ founder }) {
  const [a, b, c] = founder.palette;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: `linear-gradient(160deg, ${c} 0%, ${a} 55%, ${b} 100%)` }}
    >
      {/* Slowly rotating organic shapes */}
      <div className="portrait-anim spin-slow absolute -left-1/4 -top-1/4 size-[150%] opacity-70">
        <svg viewBox="0 0 200 200" className="size-full">
          <path
            fill={c}
            fillOpacity="0.55"
            d="M47.6,-61.2C60.9,-52.6,70.1,-37.3,74.3,-20.6C78.5,-3.9,77.6,14.2,70.2,28.9C62.8,43.6,48.9,54.9,33.3,62.7C17.7,70.5,0.4,74.8,-17.6,72.6C-35.6,70.4,-54.3,61.7,-65.4,47.1C-76.5,32.5,-80,12,-76.4,-6.6C-72.8,-25.2,-62.1,-41.9,-47.6,-50.7C-33.1,-59.5,-16.5,-60.4,0.4,-60.9C17.4,-61.4,34.3,-69.8,47.6,-61.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className="portrait-anim spin-slow-reverse absolute -bottom-1/3 -right-1/3 size-[120%] opacity-60">
        <svg viewBox="0 0 200 200" className="size-full">
          <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 6" />
          <circle cx="100" cy="100" r="52" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
        </svg>
      </div>
      <div className="portrait-anim float-y absolute right-[14%] top-[12%] size-[22%] rounded-full bg-white/35" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: 'radial-gradient(rgb(255 255 255) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
      />
      <span className="absolute inset-0 grid place-items-center font-display text-[clamp(3.5rem,7vw,5.5rem)] font-bold tracking-tighter text-white drop-shadow-[0_6px_24px_rgb(20_33_31/0.25)]">
        {founder.initials}
      </span>
    </div>
  );
}

function SlateField({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col border-paper/15 px-3.5 py-2.5 ${className}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-bright">{label}</dt>
      <dd className="mt-1 font-display text-sm font-semibold leading-snug text-paper">{children}</dd>
    </div>
  );
}

/**
 * Founder card as a film slate. It enters on its slate side: the clapper snaps shut and
 * the card flips round to the founder ("Action!"). "Flip the slate" turns it back to read
 * the take: production, roll, scene, take, director, focus, and what they're like off camera.
 *
 * Layers (outer → inner): article = pointer tilt + sheen (Motion springs); flipper = rotateY
 * 0 ↔ 180 (Motion spring); the two faces share one grid cell so the card keeps one height.
 * The clap is a short transform sequence on the stick and the board. Reduced motion: front
 * from the start, instant flips, no clap.
 */
export default function FounderCard({ founder, index }) {
  const ref = useRef(null);
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const interactive = !touch && !reduced;
  const [hovered, setHovered] = useState(false);
  // Motion-safe cards start on the slate and flip round as they enter.
  const [flipped, setFlipped] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  // The button that was pressed sits on the face that turns away (and goes inert), so focus
  // follows the flip to the matching button on the other side.
  const frontButton = useRef(null);
  const backButton = useRef(null);
  const focusAfterFlip = useRef(false);
  useEffect(() => {
    if (!focusAfterFlip.current) return;
    focusAfterFlip.current = false;
    (flipped ? backButton : frontButton).current?.focus({ preventScroll: true });
  }, [flipped]);
  const [board, animateBoard] = useAnimate();

  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.5), transparent 55%)`;

  // Open the clapper, then snap it shut with a small jolt through the board.
  const clap = async () => {
    if (reduced || !board.current) return;
    await animateBoard('[data-clap-stick]', { rotate: -24 }, { duration: 0.25, ease: easeExpo });
    await animateBoard('[data-clap-stick]', { rotate: 0 }, { duration: 0.12, ease: 'easeIn', delay: 0.08 });
    animateBoard(board.current, { y: [0, 3, 0] }, { duration: 0.18 });
  };

  // Entrance: clap, beat, flip to the founder (the second card follows a beat later).
  useEffect(() => {
    if (!inView || reduced) return undefined;
    let live = true;
    const start = setTimeout(async () => {
      await clap();
      setTimeout(() => live && setFlipped(false), 250);
    }, index * 250);
    return () => {
      live = false;
      clearTimeout(start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, index]);

  const toSlate = () => {
    focusAfterFlip.current = true;
    setFlipped(true);
    clap();
  };

  const toFront = () => {
    focusAfterFlip.current = true;
    setFlipped(false);
  };

  const onPointerMove = (e) => {
    if (!interactive || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set(-(py - 0.5) * 8);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  const scene = founder.role.split(' · ').pop();

  return (
    <motion.article
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative h-full transform-3d"
      aria-label={founder.name}
    >
      <motion.div
        className="grid h-full transform-3d"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : flipSpring}
      >
        {/* Front: the founder */}
        <div
          inert={flipped || undefined}
          aria-hidden={flipped || undefined}
          className="flex flex-col rounded-[1.75rem] border border-line bg-card p-2.5 shadow-[0_24px_60px_-36px_rgb(20_33_31/0.35)] backface-hidden [grid-area:1/1]"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
            <div className="absolute inset-0 transition-transform duration-500 ease-expo group-hover:scale-[1.05]">
              {founder.photo ? (
                // Develops on hover where hover exists; always developed on touch.
                <DevelopImage
                  src={founder.photo}
                  alt={`Portrait of ${founder.name}`}
                  mode="state"
                  developed={hovered || !interactive}
                  className="relative size-full"
                />
              ) : (
                <PortraitArt founder={founder} />
              )}
            </div>

            {/* Sheen that follows the pointer */}
            {interactive && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: glare }}
              />
            )}

            {/* Focus areas sit on the portrait and lift with a quick stagger on hover */}
            <motion.ul
              aria-label={`${founder.name}'s focus areas`}
              className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5"
              initial={false}
              animate={hovered ? 'lift' : 'rest'}
              variants={{ lift: { transition: { staggerChildren: 0.035 } }, rest: {} }}
            >
              {founder.skills.map((skill) => (
                <motion.li
                  key={skill}
                  className="rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm"
                  variants={{
                    lift: { y: -4, transition: { duration: 0.25, ease: easeExpo } },
                    rest: { y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  {skill}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">{founder.role}</p>
            <h4 className="mt-1.5 font-display text-2xl font-bold tracking-tight">{founder.name}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">{founder.bio}</p>
            <div className="flex-1" />
            <button
              ref={frontButton}
              type="button"
              onClick={toSlate}
              aria-pressed="false"
              aria-label={`Show ${founder.name}'s slate`}
              className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-line px-3.5 py-2 text-xs font-semibold transition-colors duration-200 hover:border-teal hover:text-teal"
            >
              <Clapperboard aria-hidden="true" className="size-4" />
              Flip the slate
            </button>
          </div>
        </div>

        {/* Back: the slate */}
        <div
          inert={!flipped || undefined}
          aria-hidden={!flipped || undefined}
          className="overflow-hidden rounded-[1.75rem] bg-ink text-paper shadow-[0_24px_60px_-30px_rgb(20_33_31/0.55)] backface-hidden rotate-y-180 [grid-area:1/1]"
        >
          <div ref={board} className="flex h-full flex-col p-4 md:p-5">
            {/* Clapper: the stick hinges at its bottom-left corner */}
            <div aria-hidden="true" className="relative h-[3.25rem] shrink-0">
              <div
                data-clap-stick
                className="absolute inset-x-0 top-0 h-6 origin-bottom-left rounded-md"
                style={{ background: STRIPES }}
              />
              <div className="absolute inset-x-0 top-[1.625rem] h-6 rounded-md" style={{ background: STRIPES_BAR }} />
            </div>

            {/* The director row takes up the slack, so the name sits big in the middle like a real slate */}
            <dl className="mt-4 grid flex-1 grid-cols-2 grid-rows-[auto_auto_1fr_auto_auto] overflow-hidden rounded-xl border border-paper/15">
              <SlateField label="Production" className="border-b border-r">
                {site.name}
              </SlateField>
              <SlateField label="Roll" className="border-b">
                Est. {site.founded}
              </SlateField>
              <SlateField label="Scene" className="border-b border-r">
                {scene}
              </SlateField>
              <SlateField label="Take" className="border-b">
                {String(index + 1).padStart(2, '0')}
              </SlateField>
              <SlateField label="Director" className="col-span-2 justify-center border-b">
                <span className="block font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">{founder.name}</span>
              </SlateField>
              <SlateField label="Focus" className="col-span-2 border-b">
                {founder.skills.join(' / ')}
              </SlateField>
              <SlateField label="Off camera" className="col-span-2">
                {founder.funFact}
              </SlateField>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
              <ul className="flex gap-4">
                {founder.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block py-2 underline decoration-paper/30 underline-offset-4 transition-colors duration-200 hover:text-teal-bright hover:decoration-teal-bright"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <button
                ref={backButton}
                type="button"
                onClick={toFront}
                aria-pressed="true"
                aria-label="Show portrait"
                className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-3.5 py-2 font-semibold transition-colors duration-200 hover:border-teal-bright hover:text-teal-bright"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Back to portrait
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
