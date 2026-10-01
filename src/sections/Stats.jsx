import { useRef } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { stats } from '../data/stats';

export default function Stats() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray('[data-stat]').forEach((stat, i) => {
          const num = stat.querySelector('[data-count]');
          const target = Number(num.dataset.count);
          const counter = { v: 0 };
          num.textContent = '0';

          const tl = gsap.timeline({ scrollTrigger: { trigger: stat, start: 'top 88%', once: true }, delay: i * 0.1 });
          tl.from(stat.querySelector('[data-rule]'), { scaleX: 0, duration: 0.9, ease: 'expo.out' })
            .to(
              counter,
              {
                v: target,
                duration: 1.5,
                ease: 'power3.out',
                onUpdate: () => {
                  num.textContent = Math.round(counter.v);
                },
              },
              0,
            )
            .from(stat.querySelectorAll('[data-stat-text]'), { autoAlpha: 0, y: 20, stagger: 0.06, duration: 0.7 }, 0.15);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="TealSlate in numbers" className="gutter py-24 md:py-32">
      <ul className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
        {stats.map((stat) => (
          <li key={stat.label} data-stat className="@container">
            <div data-rule className="mb-6 h-px origin-left bg-line" />
            <p className="font-display text-[clamp(2.25rem,21cqi,7rem)] font-bold leading-none tracking-tighter tabular-nums">
              <span data-count={stat.value}>{stat.value}</span>
              <span className="text-teal">{stat.suffix}</span>
            </p>
            <p data-stat-text className="mt-4 text-base font-semibold md:text-lg">
              {stat.label}
            </p>
            <p data-stat-text className="mt-1 max-w-[18rem] text-sm text-muted">
              {stat.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
