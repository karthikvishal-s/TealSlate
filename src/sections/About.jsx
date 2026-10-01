import { useRef } from 'react';
import { gsap, SplitText, useGSAP, MOTION_OK } from '../lib/gsap';
import { about } from '../data/about';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

// Collage layout: varied sizes/offsets so the photos feel placed, not gridded.
const COLLAGE_LAYOUT = ['col-span-2 md:col-span-5', 'md:col-span-4 md:mt-40', 'md:col-span-3 md:mt-12'];
const COLLAGE_RATIO = ['aspect-[4/3] md:aspect-[4/5]', 'aspect-[3/4]', 'aspect-[3/4] md:aspect-square'];
const COLLAGE_SPEED = [1, 1.6, 0.7];

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

        // Collage: each frame wipes up into view, and its photo drifts at its own speed.
        gsap.utils.toArray('[data-collage-item]').forEach((item) => {
          gsap.fromTo(
            item,
            { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 1.5rem)',
              duration: 1.5,
              ease: 'expo.out',
              scrollTrigger: { trigger: item, start: 'top 90%', once: true },
            },
          );
          const speed = Number(item.dataset.speed);
          gsap.fromTo(
            item.querySelector('img'),
            { yPercent: -8 * speed },
            {
              yPercent: 8 * speed,
              ease: 'none',
              scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
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

      <div className="mt-20 grid grid-cols-2 gap-4 md:mt-28 md:grid-cols-12 md:gap-6">
        {about.collage.map((item, i) => (
          <figure key={item.caption} className={COLLAGE_LAYOUT[i]}>
            <div data-collage-item data-speed={COLLAGE_SPEED[i]} className={`relative overflow-hidden rounded-3xl ${COLLAGE_RATIO[i]}`}>
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
