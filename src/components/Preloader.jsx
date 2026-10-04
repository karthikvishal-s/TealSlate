import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { site } from '../data/site';
import { LogoMark, LogoWordmark } from './Logo';

/**
 * The logo assembles (T drops in, S slides in, the camera triangle clicks on, the
 * wordmark rises) while a counter runs 0→100, then a curtain wipe reveals the site.
 * `onComplete` fires as the curtain starts lifting so the hero animates in underneath it.
 */
export default function Preloader({ onComplete }) {
  const root = useRef(null);
  const counter = useRef(null);
  const bar = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const letters = q('[data-letter]');
      const tagline = q('[data-tagline]');
      const [t, s, cam] = ['t', 's', 'cam'].map((part) => q(`[data-mark-part="${part}"]`));
      const count = { v: 0 };
      const render = () => {
        counter.current.textContent = String(Math.round(count.v));
      };
      const finish = () => onCompleteRef.current?.();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const tl = gsap.timeline({ onComplete: () => setDone(true) });

      if (reduced) {
        tl.to(count, { v: 100, duration: 0.6, ease: 'power1.out', onUpdate: render })
          .add(finish)
          .to(root.current, { autoAlpha: 0, duration: 0.4, ease: 'power1.out' });
        return;
      }

      tl.from(t, { yPercent: -120, duration: 0.8, ease: 'expo.out' })
        .from(s, { xPercent: 40, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.12)
        .from(cam, { scale: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'back.out(2.5)' }, 0.38)
        .from(letters, { yPercent: 115, duration: 0.8, stagger: 0.035, ease: 'expo.out' }, 0.2)
        .from(tagline, { autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out' }, 0.5)
        .to(count, { v: 100, duration: 1.4, ease: 'power3.inOut', onUpdate: render }, 0.1)
        .to(bar.current, { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0.1)
        .to(letters, { yPercent: -115, duration: 0.55, stagger: 0.025, ease: 'power4.in' }, '+=0.05')
        // Lift the whole mark (not each part): the camera triangle is short and sits mid-height,
        // so 120% of its own height would leave it stuck inside the mask.
        .to('[data-preloader-mark]', { yPercent: -120, duration: 0.55, ease: 'power4.in' }, '<')
        // Also fade it out, so no hairline of the lens can linger at the mask edge
        // (some browsers, notably Safari, leave a sliver of clipped SVG painted there).
        .to('[data-preloader-mark]', { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, '<0.3')
        .to(tagline, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, '<')
        .to('[data-counter-wrap]', { yPercent: -115, duration: 0.55, ease: 'power4.in' }, '<')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'power4.inOut' }, '-=0.15')
        .add(finish, '-=0.5');
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading TealSlate"
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-4 text-paper sm:p-8 md:p-12"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-paper/60">
        <span>{site.tagline}</span>
        <span>©{new Date().getFullYear()}</span>
      </div>

      {/* Logo lockup: mark beside the wordmark on tablets and up, stacked on phones */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
        {/* Clips the T as it drops in and the parts as they leave */}
        <div className="overflow-hidden py-1 pr-2">
          <LogoMark data-preloader-mark className="h-[clamp(5rem,14vw,11rem)] w-auto text-brand" />
        </div>
        <LogoWordmark className="h-[clamp(3.5rem,9vw,8rem)] w-auto text-paper" taglineClassName="text-brand" />
      </div>

      <div className="flex flex-col items-end gap-4 md:gap-6">
        {/* Full-width track; the teal fill sweeps edge to edge as the counter climbs */}
        <div className="h-px w-full bg-paper/15">
          <div className="h-px w-full origin-left scale-x-0 bg-teal-bright" ref={bar} />
        </div>
        <div className="overflow-hidden">
          <p data-counter-wrap className="font-display text-5xl font-bold tabular-nums md:text-7xl">
            <span ref={counter}>0</span>
            <span className="text-teal-bright">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
