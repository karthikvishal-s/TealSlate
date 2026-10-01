import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { showreel } from '../data/showreel';
import Media from '../components/Media';

/**
 * Pinned section: the reel frame starts as a small card and grows to fill the
 * screen as you scroll. Transform-only (scale), so it stays on the compositor —
 * a scrubbed clip-path would repaint the whole photo every frame.
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
            scrub: true, // Lenis already smooths; extra scrub smoothing reads as lag
            anticipatePin: 1,
          },
        });
        tl.fromTo(frame.current, { scale: desktop ? 0.5 : 0.86 }, { scale: 1 })
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
      <div ref={frame} className="absolute inset-0 overflow-hidden rounded-[2rem] bg-sand will-change-transform">
        <div ref={media} className="size-full will-change-transform">
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
              image={showreel.poster}
              gradient="linear-gradient(135deg, #2dd4bf 0%, #0f766e 60%, #14211f 100%)"
              alt="A film crew setting up lights and cameras on set"
            />
          )}
        </div>

        {/* Scrim keeps the overlay text legible on any footage */}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-ink/25" />

        {/* Placeholder play glyph (decorative until a real video is added) */}
        {!showreel.videoSrc && (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <div className="grid size-24 place-items-center rounded-full border border-white/40 bg-white/15 md:size-32">
              <Play className="ml-1 size-8 fill-white text-white md:size-10" />
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <h2
          data-reel-title
          className="font-display text-huge font-bold text-white drop-shadow-[0_4px_30px_rgb(20_33_31/0.45)]"
        >
          {showreel.title}
          <sup className="ml-2 align-super text-[0.25em] font-semibold tracking-normal text-teal-bright">
            {showreel.year}
          </sup>
        </h2>
      </div>

      <div
        data-reel-ui
        className="gutter absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8 md:pb-12"
      >
        <p className="max-w-sm text-sm leading-relaxed text-white/85 md:text-base">{showreel.caption}</p>
        {showreel.videoSrc && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause showreel' : 'Play showreel'}
              className="grid size-12 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/25"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute showreel' : 'Mute showreel'}
              className="grid size-12 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/25"
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
