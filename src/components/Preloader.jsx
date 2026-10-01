import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { site } from '../data/site';

/**
 * Counter 0→100 with wordmark, then a curtain wipe that reveals the site.
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
      const letters = root.current.querySelectorAll('[data-letter]');
      const count = { v: 0 };
      const render = () => {
        counter.current.textContent = String(Math.round(count.v)).padStart(3, '0');
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

      tl.from(letters, { yPercent: 115, duration: 0.8, stagger: 0.035, ease: 'expo.out' })
        .to(count, { v: 100, duration: 1.4, ease: 'power3.inOut', onUpdate: render }, 0.1)
        .to(bar.current, { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0.1)
        .to(letters, { yPercent: -115, duration: 0.55, stagger: 0.025, ease: 'power4.in' }, '+=0.05')
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

      <div className="overflow-hidden pb-[0.1em]">
        <p className="flex font-display text-[clamp(3.25rem,15vw,15rem)] font-bold leading-[0.95] tracking-[-0.05em]">
          {site.name.split('').map((ch, i) => (
            <span key={i} data-letter className={`inline-block ${i >= 4 ? 'text-teal-bright' : ''}`}>
              {ch}
            </span>
          ))}
        </p>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div className="h-px w-full max-w-md origin-left scale-x-0 bg-teal-bright" ref={bar} />
        <div className="overflow-hidden">
          <p data-counter-wrap className="font-display text-5xl font-bold tabular-nums md:text-7xl">
            <span ref={counter}>000</span>
            <span className="text-teal-bright">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
