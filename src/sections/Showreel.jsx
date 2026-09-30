import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { showreel } from '../data/showreel';
import Media from '../components/Media';

/**
 * Pinned section: the reel frame starts as a small inset card and expands to
 * full-bleed as you scroll (scrubbed clip-path + inner scale for depth).
 */
export default function Showreel() {
  const root = useRef(null);
  const frame = useRef(null);
  const media = useRef(null);
  const video = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: `${DESKTOP} and ${MOTION_OK}`, mobile: `not ${DESKTOP} and ${MOTION_OK}` }, (ctx) => {
        const { desktop } = ctx.conditions;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: desktop ? '+=130%' : '+=80%',
            pin: true,
            scrub: 1,
          },
        });
        tl.fromTo(
          frame.current,
          { clipPath: desktop ? 'inset(22% 26% 22% 26% round 28px)' : 'inset(26% 6% 26% 6% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
        )
          .fromTo(media.current, { scale: 1.35 }, { scale: 1 }, 0)
          .fromTo('[data-reel-title]', { yPercent: 0 }, { yPercent: -60, autoAlpha: 0 }, 0)
          .fromTo('[data-reel-ui]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.7);
      });
    },
    { scope: root },
  );

  // Only play the reel while it's on screen (saves battery/bandwidth).
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

  return (
    <section id="showreel" ref={root} aria-label="Showreel" className="relative h-svh overflow-hidden">
      <div ref={frame} className="absolute inset-0 overflow-hidden bg-panel">
        <div ref={media} className="size-full">
          {showreel.videoSrc ? (
            <video
              ref={video}
              className="size-full object-cover"
              src={showreel.videoSrc}
              poster={showreel.poster ?? undefined}
              muted={muted}
              loop
              playsInline
              preload="none"
              aria-label={`${showreel.title} ${showreel.year}`}
            />
          ) : (
            <Media
              gradient="radial-gradient(ellipse at 30% 30%, #2dd4bf 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, #0e7490 0%, transparent 60%), linear-gradient(135deg, #0f766e 0%, #111a1e 70%)"
              alt=""
            />
          )}
        </div>

        {/* Placeholder play glyph (decorative until a real video is added) */}
        {!showreel.videoSrc && (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <div className="grid size-24 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm md:size-32">
              <Play className="ml-1 size-8 fill-white text-white md:size-10" />
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <h2
          data-reel-title
          className="font-display text-huge font-extrabold uppercase text-ink drop-shadow-[0_4px_30px_rgb(11_18_21/0.5)]"
        >
          {showreel.title}
          <sup className="ml-2 align-super text-[0.25em] font-semibold tracking-normal text-teal-light">
            {showreel.year}
          </sup>
        </h2>
      </div>

      <div
        data-reel-ui
        className="gutter absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8 md:pb-12"
      >
        <p className="max-w-sm text-sm leading-relaxed text-ink/80 md:text-base">{showreel.caption}</p>
        {showreel.videoSrc && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause showreel' : 'Play showreel'}
              className="grid size-12 place-items-center rounded-full bg-ink/15 backdrop-blur-md transition-colors hover:bg-ink/25"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute showreel' : 'Mute showreel'}
              className="grid size-12 place-items-center rounded-full bg-ink/15 backdrop-blur-md transition-colors hover:bg-ink/25"
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
