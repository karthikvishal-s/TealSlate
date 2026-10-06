import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { springSnappy, easeExpo } from '../lib/motion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMousePosition } from '../hooks/useMousePosition';
import { isPlainClick, usePageNav } from '../components/PageTransition';
import { projects } from '../data/projects';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';
import MagneticButton from '../components/MagneticButton';
import Media from '../components/Media';
import { LogoMark } from '../components/Logo';

/**
 * Floating preview that trails the cursor on a tight spring.
 * All project images live in one vertical strip; switching projects slides the
 * strip, so the swap reads as one continuous motion rather than a hard cut.
 *
 * Jelly: the frame leans (skew) and squashes with pointer speed and springs back when the
 * pointer rests. It's all transforms on GPU layers (no filters), so it stays smooth on any
 * screen. Switching projects adds a quick scale "cut".
 */
function CursorPreview({ active, lastIndex }) {
  const { x, y } = useMousePosition();
  const sx = useSpring(x, springSnappy);
  const sy = useSpring(y, springSnappy);
  const vx = useVelocity(sx);
  const vy = useVelocity(sy);
  // Lean into horizontal movement for a physical feel.
  const rotate = useTransform(vx, [-3000, 3000], [-8, 8], { clamp: true });
  const skewX = useTransform(vx, [-3000, 3000], [8, -8], { clamp: true });
  const cut = useMotionValue(1);
  const speed = useTransform(() => Math.min(1, Math.hypot(vx.get(), vy.get()) / 3000));
  const scaleX = useTransform(() => (1 + speed.get() * 0.06) * cut.get());
  const scaleY = useTransform(() => (1 - speed.get() * 0.04) * cut.get());

  useEffect(() => {
    const controls = animate(cut, [0.96, 1], { duration: 0.22, ease: easeExpo });
    return () => controls.stop();
  }, [lastIndex, cut]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{ x: sx, y: sy, rotate }}
    >
      <motion.div style={{ skewX, scaleX, scaleY }}>
        <motion.div
          className="h-[17rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] xl:h-[20rem] xl:w-[28rem]"
          initial={false}
          animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
          transition={{ duration: 0.22, ease: easeExpo }}
        >
          <motion.div
            className="size-full"
            initial={false}
            animate={{ scale: active ? 1 : 1.2 }}
            transition={{ duration: 0.35, ease: easeExpo }}
          >
            <motion.div
              className="size-full"
              initial={false}
              animate={{ y: `${-lastIndex * 100}%` }}
              transition={{ duration: 0.28, ease: easeExpo }}
            >
              {projects.map((p) => (
                <div key={p.id} className="size-full">
                  <Media image={p.image} gradient={p.gradient} label={p.name} />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Project name whose letters roll up, one after another, to a teal copy on hover
 * (pure CSS transforms). Letters are grouped per word so long names still wrap; the
 * extra 0.25em of travel carries descenders (y, g) fully out of each letter's mask.
 */
function RollingTitle({ text }) {
  let n = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((ch) => {
                const delay = `${n++ * 10}ms`;
                return (
                  <span key={n} className="relative -mb-[0.15em] inline-block overflow-hidden pb-[0.15em]">
                    <span
                      className="inline-block transition-transform duration-300 ease-expo group-hover:-translate-y-[calc(100%+0.25em)]"
                      style={{ transitionDelay: delay }}
                    >
                      {ch}
                    </span>
                    <span
                      className="absolute left-0 top-0 inline-block translate-y-[calc(100%+0.25em)] text-teal transition-transform duration-300 ease-expo group-hover:translate-y-0"
                      style={{ transitionDelay: delay }}
                    >
                      {ch}
                    </span>
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

// Which edge of the row the pointer crossed, so the hover highlight sweeps in (and out) from that side.
const edge = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  return e.clientY < r.top + r.height / 2 ? 'top' : 'bottom';
};

export default function Work() {
  const root = useRef(null);
  const fill = useRef(null);
  const mark = useRef(null);
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const showPreview = !touch && !reduced;
  const { go } = usePageNav();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The black panel widens to full bleed as it scrolls in, and narrows again on the way out.
        // Only the solid fill is scaled (one compositor layer, no repaint), never the content.
        gsap.fromTo(
          fill.current,
          { scaleX: 0.9 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 30%', scrub: true } },
        );
        gsap.fromTo(
          fill.current,
          { scaleX: 1 },
          {
            scaleX: 0.9,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: root.current, start: 'bottom 70%', end: 'bottom top', scrub: true },
          },
        );

        // The watermark drifts slowly across the whole section.
        gsap.fromTo(
          mark.current,
          { yPercent: 8, rotate: -4 },
          {
            yPercent: -8,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );

        gsap.from('[data-work-line="top"]', {
          scaleX: 0,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-work-line="top"]', start: 'top 92%', once: true },
        });

        // Each row wipes open from the top as it enters, while its divider draws left to right.
        gsap.utils.toArray('[data-work-row]').forEach((row) => {
          const scrollTrigger = { trigger: row, start: 'top 92%', once: true };
          gsap.fromTo(
            row,
            { clipPath: 'inset(0% 0% 100% 0%)', y: 40 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              y: 0,
              duration: 1,
              ease: 'expo.out',
              clearProps: 'clipPath',
              scrollTrigger,
            },
          );
          gsap.from(row.querySelector('[data-work-line]'), { scaleX: 0, duration: 1.4, ease: 'expo.out', delay: 0.1, scrollTrigger });
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="work"
      ref={root}
      aria-labelledby="work-title"
      data-cursor-theme="dark"
      className="theme-night gutter relative isolate py-28 md:py-40"
    >
      <div
        ref={fill}
        aria-hidden="true"
        className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem] bg-night will-change-transform md:rounded-[5rem]"
      >
        {/* Faint TS watermark in the bottom-right corner, drifting slowly (matches the Contact box) */}
        <div ref={mark} className="absolute -bottom-[4%] -right-[6%] w-[min(60%,44rem)] will-change-transform">
          <LogoMark className="w-full text-paper opacity-[0.045]" />
        </div>
      </div>

      <div className="mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel>Selected work</SectionLabel>
          <SplitTextReveal id="work-title" className="mt-6 font-display text-display font-bold">
            Work that <span className="text-teal">moves</span> the needle
          </SplitTextReveal>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-muted">
          A few recent favourites across branding, digital, film, and growth. Full case studies available on request.
        </p>
      </div>

      <div data-work-line="top" aria-hidden="true" className="h-px origin-left bg-line" />
      <ul className="work-list" onPointerLeave={() => setActive(false)}>
        {projects.map((project, i) => (
          <li
            key={project.id}
            data-work-row
            className="work-row group/row relative isolate"
            onPointerEnter={(e) => {
              if (e.pointerType !== 'mouse') return;
              e.currentTarget.dataset.edge = edge(e);
              setIndex(i);
              setActive(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') e.currentTarget.dataset.edge = edge(e);
            }}
          >
            {/* Hover highlight: sweeps in from the edge the pointer entered, and out through the one it left */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -inset-x-3 -z-10 origin-top scale-y-0 rounded-2xl bg-paper/[0.05] transition-transform duration-300 ease-expo group-hover/row:scale-y-100 group-data-[edge=bottom]/row:origin-bottom md:-inset-x-6"
            />

            <a
              href={project.href}
              data-cursor="view"
              // Placeholder links: swap `href` in src/data/projects.js for real case-study URLs.
              onClick={(e) => project.href === '#' && e.preventDefault()}
              className="work-row-content group grid grid-cols-12 items-center gap-x-4 gap-y-2 py-7 transition-opacity duration-200 ease-expo md:py-10"
            >
              <span className="col-span-2 text-sm tabular-nums text-muted md:col-span-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="col-span-10 font-display text-[clamp(1.9rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight transition-transform duration-300 ease-expo group-hover:translate-x-4 md:col-span-6">
                <RollingTitle text={project.name} />
              </h3>
              <span className="col-span-7 col-start-3 text-sm text-muted md:col-span-3 md:col-start-auto">
                {project.category}
              </span>
              <span className="col-span-3 flex items-center justify-end gap-3 text-sm tabular-nums md:col-span-2">
                {project.year}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 text-teal transition-transform duration-300 ease-expo group-hover:rotate-45"
                />
              </span>
            </a>

            {/* Touch devices: no hover, so show the image inline */}
            {touch && (
              <div className="mb-8 aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[2/1] lg:aspect-[5/2]">
                <Media image={project.image} gradient={project.gradient} alt={`${project.name} project preview`} />
              </div>
            )}

            <span data-work-line aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-line" />
          </li>
        ))}
      </ul>

      <div className="mt-14 flex justify-center">
        <MagneticButton
          href="/contact"
          onClick={(e) => {
            if (!isPlainClick(e)) return;
            e.preventDefault();
            go('/contact');
          }}
          variant="outline-dark"
          size="lg"
          icon={ArrowUpRight}
        >
          Start your project
        </MagneticButton>
      </div>

      {showPreview && <CursorPreview active={active} lastIndex={index} />}
    </section>
  );
}
