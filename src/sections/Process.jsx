import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../lib/gsap';
import { process } from '../data/process';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

export default function Process() {
  const root = useRef(null);
  const timeline = useRef(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray('[data-step]');

      // The line's head sits exactly at 60% of the viewport (linear scrub from the
      // timeline's top to its bottom), so each dot lights up as the line reaches it.
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top+=14 60%',
          toggleClass: { targets: step.querySelector('[data-dot]'), className: 'is-active' },
        });
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-draw]',
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: timeline.current, start: 'top 60%', end: 'bottom 60%', scrub: true },
          },
        );

        steps.forEach((step) => {
          gsap.from(step.querySelector('[data-step-body]'), {
            autoAlpha: 0,
            y: 50,
            duration: 0.9,
            scrollTrigger: { trigger: step, start: 'top 78%', once: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="process" ref={root} aria-labelledby="process-title" className="gutter py-28 md:py-40">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="(04)">Process</SectionLabel>
            <SplitTextReveal id="process-title" className="mt-6 font-display text-display font-bold">
              From first call to <span className="text-teal">full launch</span>
            </SplitTextReveal>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-muted">
              A clear, collaborative process with no black boxes. You always know what&apos;s happening, what&apos;s next,
              and why.
            </p>
          </div>
        </div>

        <ol ref={timeline} className="relative lg:col-span-7">
          <svg
            aria-hidden="true"
            className="absolute left-[23px] top-0 h-full w-[2px] overflow-visible"
            preserveAspectRatio="none"
          >
            <line x1="1" y1="0" x2="1" y2="100%" stroke="var(--color-line)" strokeWidth="2" />
            <line
              data-draw
              x1="1"
              y1="0"
              x2="1"
              y2="100%"
              stroke="var(--color-teal)"
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0"
            />
          </svg>

          {process.map((step, i) => (
            <li key={step.title} data-step className="relative pb-20 pl-16 last:pb-0 md:pb-28 md:pl-24">
              <span
                data-dot
                aria-hidden="true"
                className="absolute left-6 top-3 size-4 -translate-x-1/2 rounded-full border-2 border-line bg-paper transition-all duration-500 ease-expo [&.is-active]:scale-125 [&.is-active]:border-teal [&.is-active]:bg-teal [&.is-active]:shadow-[0_0_24px_4px_rgb(45_212_191/0.45)]"
              />
              <div data-step-body>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-display text-sm font-bold text-teal">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted">
                    {step.duration}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">{step.title}</h3>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
