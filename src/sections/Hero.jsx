import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, useSpring } from 'motion/react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { springFollow } from '../lib/motion';
import { isPlainClick, usePageNav } from '../components/PageTransition';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hero } from '../data/site';
import { showreel } from '../data/showreel';
import SplitTextReveal from '../components/SplitTextReveal';
import MagneticButton from '../components/MagneticButton';
import DevelopImage from '../components/DevelopImage';
import ImageTrail from '../components/ImageTrail';
import { heroTrail } from '../data/heroTrail';

/**
 * Hero + showreel as one shot. "move." is cut out of a paper wall (mix-blend-lighten:
 * paper stays paper, the ink letters let the footage underneath through). Scrolling
 * pushes the camera into the "o" until the footage fills the frame and becomes the reel.
 *
 * Layers, back to front: footage → paper wall (copy of the layout, only "move." inked)
 * → real copy (h1, CTAs; "move." transparent) → reel UI. Wall and copy render the same
 * <HeroCopy>, so their lines wrap identically at every width.
 */

/** Plays the reel only while it's on screen. */
function useReelVideo() {
  const video = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = video.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && playing) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [playing]);

  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return { video, playing, muted, togglePlay, toggleMute: () => setMuted((m) => !m) };
}

function ReelControls({ reel, className = '' }) {
  if (!showreel.videoSrc) return null;
  const btn =
    'grid size-12 place-items-center rounded-full bg-paper/20 text-paper transition-colors duration-300 hover:bg-paper/30';
  return (
    <div className={`flex gap-3 ${className}`}>
      <button type="button" onClick={reel.togglePlay} aria-label={reel.playing ? 'Pause showreel' : 'Play showreel'} className={btn}>
        {reel.playing ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>
      <button type="button" onClick={reel.toggleMute} aria-label={reel.muted ? 'Unmute showreel' : 'Mute showreel'} className={btn}>
        {reel.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </div>
  );
}

/** The footage itself: the video when one is configured (and not `still`), otherwise the poster. */
function Footage({ reel, developed, still = false }) {
  if (showreel.videoSrc && !still) {
    return (
      <video
        ref={reel.video}
        className="size-full object-cover"
        src={showreel.videoSrc}
        poster={showreel.poster ?? undefined}
        muted={reel.muted}
        loop
        playsInline
        preload="metadata"
        aria-label={`${showreel.title} ${showreel.year}`}
      />
    );
  }
  return (
    <DevelopImage
      src={showreel.poster}
      alt="A film crew setting up lights and cameras on set"
      mode="state"
      developed={developed}
      inDuration={1400}
      loading="eager"
      fetchPriority="high"
      className="kenburns absolute inset-0"
    />
  );
}

function HeroCopy({ variant, ready, go }) {
  const wall = variant === 'wall';
  const { hrefFor } = usePageNav();
  return (
    <div className="gutter flex min-h-svh flex-col justify-center pb-10 pt-28 md:pb-14 md:pt-32 md:portrait:min-h-[min(100svh,60rem)]">
      <p
        data-hero-fade={wall ? undefined : ''}
        className={`mb-6 text-xs font-medium uppercase tracking-[0.28em] md:mb-10 ${wall ? 'invisible' : 'hero-text text-muted'}`}
      >
        {hero.eyebrow}
      </p>

      <SplitTextReveal
        as={wall ? 'p' : 'h1'}
        ready={ready}
        delay={0.15}
        duration={1.1}
        stagger={0.08}
        className={`font-display text-mega font-bold md:portrait:text-[11vw] ${wall ? 'text-paper' : 'hero-text'}`}
      >
        {hero.headline}{' '}
        {/* One unbroken span in both layers (a nested span would give the splitter a break point) */}
        <span data-dive-word={wall ? '' : undefined} className={`whitespace-nowrap ${wall ? 'text-ink' : 'text-transparent [text-shadow:none]'}`}>
          {hero.headlineAccent}
        </span>
      </SplitTextReveal>

      <div className={`mt-10 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end ${wall ? 'invisible' : ''}`}>
        <p data-hero-fade={wall ? undefined : ''} className="hero-text max-w-md text-base leading-relaxed text-muted md:col-span-5 md:text-lg">
          {hero.subline}
        </p>
        <div
          data-hero-fade={wall ? undefined : ''}
          className="flex flex-wrap items-center gap-4 md:col-span-5 md:col-start-8 md:justify-end"
        >
          <MagneticButton href={hrefFor(hero.cta.href)} onClick={(e) => go(e, hero.cta.href)} size="lg" icon={ArrowUpRight}>
            {hero.cta.label}
          </MagneticButton>
          <MagneticButton
            href={hero.secondaryCta.href}
            onClick={(e) => go(e, hero.secondaryCta.href)}
            variant="outline"
            size="lg"
            className="hero-cta-soft"
          >
            {hero.secondaryCta.label}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

/** The wall's "move." span. SplitText can leave an empty copy of it at a line end, so skip those. */
const findDiveWord = (wall) => [...wall.querySelectorAll('[data-dive-word]')].find((el) => el.offsetWidth > 0);

/**
 * Where to aim the push-in: the middle of the "o"'s left stroke (the letters are the
 * window; the counter inside the "o" is paper). Font metrics aren't known up front, so
 * the glyph is drawn on a canvas and its first inked run is measured.
 * Returns the point in the wall's (untransformed) coordinates plus the stroke thickness.
 */
function measureDiveTarget(wall) {
  const word = findDiveWord(wall);
  const text = word?.textContent ?? '';
  const at = text.indexOf('o');
  if (at < 0) return null;
  const cs = getComputedStyle(word);
  const size = parseFloat(cs.fontSize);
  const tracking = parseFloat(cs.letterSpacing) || 0;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(size * 1.2);
  canvas.height = Math.ceil(size * 1.6);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  ctx.textBaseline = 'alphabetic';
  // Advance of the letters before the "o", including the headline's (negative) tracking.
  const before = ctx.measureText(text.slice(0, at)).width + at * tracking;
  const m = ctx.measureText('o');
  const baseline = Math.ceil(m.fontBoundingBoxAscent);
  ctx.fillText('o', 0, baseline);
  const midY = Math.round(baseline - m.actualBoundingBoxAscent / 2);
  const row = ctx.getImageData(0, midY, canvas.width, 1).data;
  let start = -1;
  let end = -1;
  for (let x = 0; x < canvas.width; x++) {
    if (row[x * 4 + 3] > 128) {
      if (start < 0) start = x;
      end = x;
    } else if (start >= 0) break;
  }
  if (start < 0) return null;

  // Offsets ignore transforms, so this is correct even mid-dive.
  let left = 0;
  let top = 0;
  for (let el = word; el && el !== wall; el = el.offsetParent) {
    left += el.offsetLeft;
    top += el.offsetTop;
  }
  return { x: left + before + (start + end) / 2, y: top + midY, thickness: end - start + 1 };
}

function ReelOverlay({ reel }) {
  return (
    <div className="gutter pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8 text-paper md:pb-12">
      <div className="max-w-xl">
        <h2 data-reel-item className="font-display text-huge font-bold">
          {showreel.title}
          <sup className="ml-2 align-super text-[0.25em] font-semibold tracking-normal text-teal-bright">{showreel.year}</sup>
        </h2>
        <p data-reel-item className="mt-4 max-w-sm text-sm leading-relaxed text-paper/85 md:text-base">
          {showreel.caption}
        </p>
      </div>
      <div data-reel-item className="pointer-events-auto">
        <ReelControls reel={reel} />
      </div>
    </div>
  );
}

/** Reduced motion: the reel sits in the page flow as a plain framed panel. */
function ReelPanel({ reel }) {
  return (
    <section aria-label="Showreel" className="gutter pb-16">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand sm:aspect-video">
        <Footage reel={reel} developed />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-ink/25" />
        <ReelOverlay reel={reel} />
      </div>
    </section>
  );
}

export default function Hero({ ready }) {
  const root = useRef(null);
  const footage = useRef(null);
  const settle = useRef(null);
  const wall = useRef(null);
  const centre = useRef(null);
  const diver = useRef(null);
  const trail = useRef(null);
  const copy = useRef(null);
  const restScrim = useRef(null);
  const reelScrim = useRef(null);
  const reelUi = useRef(null);
  const { go: navigateTo } = usePageNav();
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const reel = useReelVideo();
  const [developed, setDeveloped] = useState(false);

  // Looking through a window: the footage drifts a little toward the pointer.
  const peekX = useSpring(0, springFollow);
  const peekY = useSpring(0, springFollow);
  const onPointerMove = (e) => {
    if (touch || reduced || e.pointerType !== 'mouse') return;
    peekX.set((0.5 - e.clientX / window.innerWidth) * 48);
    peekY.set((0.5 - e.clientY / window.innerHeight) * 48);
  };

  // The footage develops as the preloader curtain lifts.
  useEffect(() => {
    if (!ready) return undefined;
    const t = setTimeout(() => setDeveloped(true), 200);
    return () => clearTimeout(t);
  }, [ready]);

  // Entrance: supporting copy fades up and the footage settles once the preloader hands over.
  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-hero-fade]');
      if (!ready) {
        gsap.set(items, { autoAlpha: 0, y: 40 });
        return;
      }
      gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, delay: 0.3, ease: 'expo.out' });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(settle.current, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
      });
    },
    { scope: root, dependencies: [ready] },
  );

  // The push-in (scrubbed, pinned).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: `${DESKTOP} and ${MOTION_OK}`, any: MOTION_OK }, (ctx) => {
        if (!ctx.conditions.any) return undefined;
        const { desktop } = ctx.conditions;
        const w = wall.current;
        const a = centre.current;
        const b = diver.current;
        let geo = { dx: 0, dy: 0, s0: 1, maxScale: 1 };
        // Centre "move." (wrapper A), then dive into the "o" (wrapper B). Offsets ignore
        // transforms, so this measures the resting layout even mid-scroll.
        const measure = () => {
          const target = measureDiveTarget(w);
          const word = findDiveWord(w);
          if (!target || !word) return geo;
          let left = 0;
          for (let el = word; el && el !== w; el = el.offsetParent) left += el.offsetLeft;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const cx = left + word.offsetWidth / 2;
          const cy = target.y; // the lowercase midline reads as the word's visual centre
          const s0 = Math.min(1.8, (0.7 * vw) / word.offsetWidth);
          gsap.set(a, { transformOrigin: `${cx}px ${cy}px` });
          b.style.transformOrigin = `${target.x}px ${target.y}px`;
          // Where the "o" sits once centred; its stroke has to outgrow the farthest corner.
          const px = vw / 2 + s0 * (target.x - cx);
          const py = vh / 2 + s0 * (target.y - cy);
          const far = Math.max(Math.hypot(px, py), Math.hypot(vw - px, py), Math.hypot(px, vh - py), Math.hypot(vw - px, vh - py));
          geo = { dx: vw / 2 - cx, dy: vh / 2 - cy, s0, maxScale: ((far * 2) / (target.thickness * s0)) * 1.15 };
          return geo;
        };
        // Exponential zoom reads as constant speed; power1.in makes the dive accelerate.
        const dive = { p: 0 };
        const render = () => {
          b.style.transform = dive.p > 0 ? `scale(${Math.pow(geo.maxScale, dive.p)})` : '';
        };

        // Image trail: follows the pointer only while the hero is at rest, never on scroll.
        let trailOn = true;

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: desktop ? '+=200%' : '+=130%',
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              render();
            },
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.12 !== trailOn) {
                trailOn = p < 0.12;
                trail.current?.setEnabled(trailOn);
              }
            },
          },
        });
        tl.to(copy.current, { autoAlpha: 0, y: -80, duration: 0.15, ease: 'power2.in' }, 0)
          .fromTo(
            a,
            { x: 0, y: 0, scale: 1 },
            {
              x: () => measure().dx,
              y: () => measure().dy,
              scale: () => measure().s0,
              duration: 0.27,
              ease: 'power3.inOut',
              force3D: false, // keep the type re-rendering sharp as it grows
            },
            0.05,
          )
          .to(dive, { p: 1, duration: 0.44, ease: 'power1.in', onUpdate: render }, 0.38)
          .fromTo(footage.current, { scale: 1.12 }, { scale: 1, duration: 0.44 }, 0.38)
          .to(restScrim.current, { opacity: 0, duration: 0.3 }, 0.5)
          .to(reelScrim.current, { opacity: 1, duration: 0.3 }, 0.55)
          .set(w, { autoAlpha: 0 }, 0.82)
          .fromTo(
            reelUi.current.querySelectorAll('[data-reel-item]'),
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.03, ease: 'expo.out' },
            0.85,
          );

        return () => {
          b.style.transform = '';
          b.style.transformOrigin = '';
          trail.current?.setEnabled(true);
        };
      });

      // Pause the Ken Burns drift once the shot has scrolled away (no hidden GPU work).
      ScrollTrigger.create({
        trigger: root.current,
        start: 'bottom top',
        end: 'max',
        toggleClass: { targets: footage.current, className: 'is-offscreen' },
      });
    },
    { scope: root },
  );

  const go = (e, href) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    navigateTo(href);
  };

  return (
    <>
      <section
        id="top"
        ref={root}
        aria-label="Introduction"
        onPointerMove={onPointerMove}
        className="relative isolate overflow-hidden"
      >
        {/* 1. Footage: GSAP scales this layer, Motion drifts the next, GSAP settles the one inside */}
        <div ref={footage} aria-hidden={reduced || undefined} className="absolute inset-0 overflow-hidden bg-ink">
          <motion.div style={{ x: peekX, y: peekY }} className="absolute -inset-8">
            <div ref={settle} className="size-full">
              {/* With reduced motion the reel plays in its own panel below, so the window shows the still */}
              <Footage reel={reel} developed={developed} still={reduced} />
            </div>
          </motion.div>
          {/* Just enough to keep highlights under the paper's brightness, so lighten never ghosts */}
          <div ref={restScrim} aria-hidden="true" className="absolute inset-0">
            <div className="absolute inset-0 bg-ink/15" />
            {/* Teal key light: lifts the shadows so the letters read as footage, not ink */}
            <div className="absolute inset-0 bg-teal-bright/40 mix-blend-screen" />
          </div>
          <div
            ref={reelScrim}
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-ink/25 opacity-0"
          />
        </div>

        {/* 2. Paper wall with "move." cut out of it */}
        <div ref={wall} aria-hidden="true" className="absolute inset-0 bg-paper mix-blend-lighten">
          {/* A centres "move."; B dives into it. The paper itself never moves. */}
          <div ref={centre}>
            <div ref={diver}>
              <HeroCopy variant="wall" ready={ready} go={go} />
            </div>
          </div>
        </div>

        {/* Image trail: over the paper, under the copy (desktop pointers only, after the preloader) */}
        {ready && !touch && !reduced && <ImageTrail ref={trail} images={heroTrail} targetRef={root} />}

        {/* 3. The real copy */}
        <div ref={copy} className="relative">
          <HeroCopy variant="ink" ready={ready} go={go} />
        </div>

        {/* 4. Reel UI, revealed at the end of the push-in */}
        {!reduced && (
          <div ref={reelUi} id="showreel">
            <ReelOverlay reel={reel} />
          </div>
        )}
      </section>

      {reduced && (
        <div id="showreel">
          <ReelPanel reel={reel} />
        </div>
      )}
    </>
  );
}
