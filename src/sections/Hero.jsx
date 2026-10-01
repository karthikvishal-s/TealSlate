import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { useLenis } from '../hooks/useLenis';
import { hero } from '../data/site';
import SplitTextReveal from '../components/SplitTextReveal';
import MagneticButton from '../components/MagneticButton';
import ImageTrail from '../components/ImageTrail';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { heroTrail } from '../data/heroTrail';

export default function Hero({ ready }) {
  const root = useRef(null);
  const content = useRef(null);
  const bg = useRef(null);
  const { scrollTo } = useLenis();
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();

  // Supporting content fades up once the preloader hands over.
  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-hero-fade]');
      if (!ready) {
        gsap.set(items, { autoAlpha: 0, y: 40 });
        return;
      }
      gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.1, delay: 0.55, ease: 'expo.out' });
    },
    { scope: root, dependencies: [ready] },
  );

  // Scroll-out: content recedes and fades while the gradient drifts (scrubbed).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrollTrigger = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to(content.current, { scale: 0.88, yPercent: 12, autoAlpha: 0, ease: 'none', scrollTrigger });
        gsap.to(bg.current, { yPercent: 25, ease: 'none', scrollTrigger });
      });
    },
    { scope: root },
  );

  const go = (e, href) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <section
      id="top"
      ref={root}
      aria-label="Introduction"
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      {/* Animated gradient mesh */}
      <div ref={bg} aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-paper/30 to-paper" />
      </div>

      {/* Interactive image trail (desktop pointers only, after the preloader) */}
      {ready && !touch && !reduced && <ImageTrail images={heroTrail} targetRef={root} />}

      <div
        ref={content}
        className="gutter relative z-10 flex flex-1 origin-top flex-col justify-end pb-10 pt-32 md:pb-14"
      >
        <p data-hero-fade className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-muted md:mb-10">
          {hero.eyebrow}
        </p>

        <SplitTextReveal
          as="h1"
          ready={ready}
          delay={0.15}
          duration={1.6}
          stagger={0.12}
          className="font-display text-mega font-bold"
        >
          {hero.headline} <span className="text-teal">{hero.headlineAccent}</span>
        </SplitTextReveal>

        <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end">
          <p data-hero-fade className="max-w-md text-base leading-relaxed text-muted md:col-span-5 md:text-lg">
            {hero.subline}
          </p>

          <div data-hero-fade className="flex flex-wrap items-center gap-4 md:col-span-5 md:col-start-8 md:justify-end">
            <MagneticButton
              href={hero.cta.href}
              onClick={(e) => go(e, hero.cta.href)}
              size="lg"
              icon={ArrowUpRight}
            >
              {hero.cta.label}
            </MagneticButton>
            <MagneticButton
              href={hero.secondaryCta.href}
              onClick={(e) => go(e, hero.secondaryCta.href)}
              variant="outline"
              size="lg"
            >
              {hero.secondaryCta.label}
            </MagneticButton>
          </div>
        </div>

        <div data-hero-fade className="mt-12 flex items-center justify-between border-t border-line pt-5 text-xs uppercase tracking-[0.28em] text-muted md:mt-16">
          <a href="#showreel" onClick={(e) => go(e, '#showreel')} className="flex items-center gap-4">
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue-line absolute inset-0 bg-teal" />
            </span>
            Scroll to explore
          </a>
          <span className="hidden sm:block">Websites · Brands · Films · Campaigns</span>
        </div>
      </div>
    </section>
  );
}
