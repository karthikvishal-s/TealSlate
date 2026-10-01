import { useRef } from 'react';
import { gsap, SplitText, useGSAP, MOTION_OK } from '../lib/gsap';
import { about } from '../data/about';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

export default function About() {
  const root = useRef(null);
  const statement = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Each word goes from dim to full as the paragraph scrolls through the viewport.
        SplitText.create(statement.current, {
          type: 'words',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.1,
                scrollTrigger: {
                  trigger: statement.current,
                  start: 'top 80%',
                  end: 'bottom 50%',
                  scrub: true,
                },
              },
            ),
        });

        gsap.from('[data-about-fade]', {
          autoAlpha: 0,
          y: 40,
          stagger: 0.12,
          duration: 1.2,
          scrollTrigger: { trigger: '[data-about-fade]', start: 'top 88%', once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} aria-labelledby="about-title" className="gutter py-28 md:py-44">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel index="(01)">
            <span id="about-title">{about.label}</span>
          </SectionLabel>
        </div>

        <p ref={statement} className="font-display text-lead font-semibold md:col-span-9">
          {about.statement.map((seg, i) => (
            <span key={i} className={seg.accent ? 'text-teal' : undefined}>
              {seg.text}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
        <SplitTextReveal
          as="p"
          type="words"
          className="font-display text-2xl font-bold tracking-tight md:col-span-4 md:col-start-4 md:text-3xl"
        >
          One studio. Every discipline.
        </SplitTextReveal>
        {about.supporting.map((line) => (
          <p
            key={line}
            data-about-fade
            className="max-w-sm text-base leading-relaxed text-muted md:col-span-3 md:first-of-type:col-start-8"
          >
            {line}
          </p>
        ))}
      </div>

    </section>
  );
}
