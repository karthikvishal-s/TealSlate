import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { services } from '../data/services';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

function ServiceCard({ service, index, total }) {
  return (
    <article
      data-service-card
      // Mobile: sticky cards that stack on top of each other while scrolling.
      style={{ '--i': index }}
      className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-deep p-7 max-lg:sticky max-lg:top-[calc(6rem+var(--i)*1rem)] md:p-10 motion-safe:lg:h-[min(68vh,40rem)] motion-safe:lg:min-h-0 motion-safe:lg:w-[min(36rem,40vw)] motion-safe:lg:shrink-0"
    >
      {/* Hover glow */}
      <div
        aria-hidden="true"
        className="absolute -right-1/4 -top-1/4 size-[70%] rounded-full bg-teal/20 opacity-0 blur-3xl transition-opacity duration-700 ease-expo group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-7xl font-extrabold leading-none tracking-tighter text-teal-light/90 md:text-8xl">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase tracking-[0.28em] text-muted">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className="relative">
        <h3 className="flex items-start justify-between gap-4 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {service.title}
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 size-8 shrink-0 text-teal-light transition-transform duration-500 ease-expo group-hover:rotate-45"
          />
        </h3>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{service.description}</p>
        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Capabilities">
          {service.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink/80 transition-colors duration-500 group-hover:border-teal/50"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Services() {
  const root = useRef(null);
  const track = useRef(null);
  const progress = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pin the section and translate the card track horizontally.
      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const tl = gsap.timeline({
          defaults: { ease: 'none' }, // linear mapping; scrub smoothing provides the easing
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track.current, { x: () => -distance() }).fromTo(progress.current, { scaleX: 0 }, { scaleX: 1 }, 0);
      });

      // Mobile/tablet: simple fade-up for each stacked card.
      mm.add(`not ${DESKTOP} and ${MOTION_OK}`, () => {
        gsap.utils.toArray('[data-service-card]').forEach((card) => {
          gsap.from(card, {
            autoAlpha: 0,
            y: 60,
            duration: 1.2,
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="services"
      ref={root}
      aria-labelledby="services-title"
      className="relative py-24 md:py-32 motion-safe:lg:flex motion-safe:lg:h-svh motion-safe:lg:flex-col motion-safe:lg:justify-center motion-safe:lg:overflow-hidden motion-safe:lg:py-0"
    >
      <div className="gutter mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-10">
        <div>
          <SectionLabel index="(02)">What we do</SectionLabel>
          <SplitTextReveal id="services-title" className="mt-6 font-display text-display font-extrabold uppercase">
            Services built to <span className="text-teal-light">scale</span>
          </SplitTextReveal>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-muted">
          Six disciplines, one team. Mix and match, or let us run the whole show end to end.
        </p>
      </div>

      <div ref={track} className="gutter flex flex-col gap-5 motion-safe:lg:w-max motion-safe:lg:flex-row motion-safe:lg:gap-6 motion-reduce:lg:grid motion-reduce:lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} total={services.length} />
        ))}
      </div>

      <div aria-hidden="true" className="gutter mt-10 hidden motion-safe:lg:block">
        <div className="h-px w-full bg-line">
          <div ref={progress} className="h-px origin-left scale-x-0 bg-teal-light" />
        </div>
      </div>
    </section>
  );
}
