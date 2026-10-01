import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
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
      // Run the decorative portrait animations only while this block is visible.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        toggleClass: { targets: root.current, className: 'is-live' },
      });

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.utils.toArray('[data-founder-reveal]').forEach((el, i) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(18% 8% 18% 8% round 1.75rem)', autoAlpha: 0, y: 50 },
            {
              clipPath: 'inset(0% 0% 0% 0% round 1.75rem)',
              autoAlpha: 1,
              y: 0,
              duration: 1,
              delay: i * 0.08,
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
            { yPercent: i ? 5 : 2 },
            {
              yPercent: i ? -3 : -1,
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
    <section ref={root} className="mt-24 md:mt-32" aria-labelledby="founders-title">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Intro stays in view beside the cards on desktop */}
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:will-change-transform">
          <SectionLabel>{foundersIntro.label}</SectionLabel>
          <SplitTextReveal
            as="h3"
            id="founders-title"
            className="mt-6 max-w-[16ch] font-display text-display font-bold"
          >
            {foundersIntro.heading}
          </SplitTextReveal>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">{foundersIntro.body}</p>
          <CircularText text={foundersIntro.badge} className="mt-8 size-28 text-ink md:size-32">
            <span className="grid size-11 place-items-center rounded-full bg-teal text-paper md:size-12">
              <ArrowDown aria-hidden="true" className="size-5 lg:-rotate-90" />
            </span>
          </CircularText>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 sm:gap-5 lg:col-span-8 lg:gap-6">
          {founders.map((founder, i) => (
            <div key={founder.id} data-founder-parallax className="will-change-transform">
              <div data-founder-reveal>
                <FounderCard founder={founder} index={i} />
              </div>
              <SplitTextReveal
                as="blockquote"
                type="words"
                stagger={0.03}
                className="mt-4 px-1 font-display text-base font-medium leading-snug tracking-tight text-ink/85 md:text-lg"
              >
                &ldquo;{founder.quote}&rdquo;
              </SplitTextReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
