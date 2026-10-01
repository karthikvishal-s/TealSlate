import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { founders, foundersIntro } from '../data/founders';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';
import CircularText from '../components/CircularText';
import FounderCard from '../components/FounderCard';

/**
 * "Meet the founders" block inside the Studio section.
 * Layering per card (outer → inner):
 *   [data-founder-parallax]  GSAP scrubbed drift (desktop)
 *   [data-founder-reveal]    GSAP clip-path wipe on enter
 *   <FounderCard>            Motion tilt / hover only
 */
export default function Founders() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.utils.toArray('[data-founder-reveal]').forEach((el, i) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(22% 12% 22% 12% round 2rem)', autoAlpha: 0, y: 80 },
            {
              clipPath: 'inset(0% 0% 0% 0% round 2rem)',
              autoAlpha: 1,
              y: 0,
              duration: 1.6,
              delay: i * 0.12,
              ease: 'expo.out',
              clearProps: 'clipPath', // let the 3D tilt + shadow breathe after the reveal
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          );
        });
      });

      // Desktop: the two cards drift at different speeds for depth.
      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        gsap.utils.toArray('[data-founder-parallax]').forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: i ? 14 : 4 },
            {
              yPercent: i ? -8 : -4,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mt-28 md:mt-44" aria-labelledby="founders-title">
      <div className="grid items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <SectionLabel>{foundersIntro.label}</SectionLabel>
          <SplitTextReveal
            as="h3"
            id="founders-title"
            className="mt-6 max-w-[16ch] font-display text-display font-bold"
          >
            {foundersIntro.heading}
          </SplitTextReveal>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{foundersIntro.body}</p>
        </div>
        <div className="flex md:col-span-4 md:justify-end">
          <CircularText text={foundersIntro.badge} className="size-36 text-ink md:size-44">
            <span className="grid size-14 place-items-center rounded-full bg-teal text-paper md:size-16">
              <ArrowDown aria-hidden="true" className="size-6" />
            </span>
          </CircularText>
        </div>
      </div>

      <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-2 md:gap-10 lg:gap-16">
        {founders.map((founder, i) => (
          <div key={founder.id} data-founder-parallax className={i ? 'md:mt-24' : ''}>
            <div data-founder-reveal>
              <FounderCard founder={founder} index={i} />
            </div>
            <SplitTextReveal
              as="blockquote"
              type="words"
              stagger={0.03}
              className="mt-8 max-w-md px-2 font-display text-xl font-medium leading-snug tracking-tight text-ink/85 md:text-2xl"
            >
              &ldquo;{founder.quote}&rdquo;
            </SplitTextReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
