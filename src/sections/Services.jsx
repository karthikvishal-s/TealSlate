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
      className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-card p-6 max-lg:sticky max-lg:top-[calc(6rem+var(--i)*1rem)] md:p-10 motion-safe:lg:h-[min(68vh,40rem)] motion-safe:lg:min-h-0 motion-safe:lg:w-[min(36rem,40vw)] motion-safe:lg:shrink-0 motion-safe:lg:portrait:h-[min(60vh,50rem)] motion-safe:lg:portrait:w-[min(40rem,62vw)]"
    >
      {/* Hover glow */}
      <div
        aria-hidden="true"
        className="absolute -right-1/4 -top-1/4 size-[70%] rounded-full bg-teal/20 opacity-0 blur-3xl transition-opacity duration-500 ease-expo group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-6xl font-bold leading-none tracking-tighter text-teal/90 md:text-7xl">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase tracking-[0.28em] text-muted">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Photo: the wrapper zooms on hover (CSS), the img drifts with the horizontal scroll (GSAP) */}
      <div className="relative my-6 aspect-[16/9] overflow-hidden rounded-2xl motion-safe:lg:my-5 motion-safe:lg:aspect-auto motion-safe:lg:min-h-0 motion-safe:lg:flex-1">
        <div className="absolute inset-0 grayscale-[35%] transition-[transform,filter] duration-600 ease-expo group-hover:scale-105 group-hover:grayscale-0">
          <img
            data-service-img
            src={service.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-y-0 -left-[8%] h-full w-[116%] max-w-none object-cover will-change-transform"
          />
        </div>
      </div>

      <div className="relative">
        <h3 className="flex items-start justify-between gap-4 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {service.title}
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 size-8 shrink-0 text-teal transition-transform duration-500 ease-expo group-hover:rotate-45"
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
        const range = { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, invalidateOnRefresh: true };

        // 3D curved carousel: the cards ride a drum. The card in focus faces you at full size;
        // the further a card is from the focus, the more it swings away, recedes, and dims.
        // The focus point drifts from the first card's centre to the last one's over the pin,
        // so the reel opens and closes on a card facing forward without adding scroll length.
        const cards = gsap.utils.toArray('[data-service-card]');
        gsap.set(cards, { transformPerspective: 1100 });
        const set = cards.map((card) => ({
          rotate: gsap.quickSetter(card, 'rotationY', 'deg'),
          z: gsap.quickSetter(card, 'z', 'px'),
          x: gsap.quickSetter(card, 'x', 'px'),
          opacity: gsap.quickSetter(card, 'opacity'),
        }));
        // Layout is read once per refresh (offsets ignore transforms), never per frame.
        let layout = { centres: [], widths: [], dist: 0, spread: 1 };
        const measure = () => {
          layout = {
            centres: cards.map((c) => c.offsetLeft + c.offsetWidth / 2),
            widths: cards.map((c) => c.offsetWidth),
            dist: distance(),
            spread: window.innerWidth * 0.75,
          };
        };
        const curve = (p) => {
          const { centres, widths, dist, spread } = layout;
          const first = centres[0];
          const focus = first + (centres[centres.length - 1] - dist - first) * p;
          cards.forEach((_, i) => {
            const d = gsap.utils.clamp(-1, 1, (centres[i] - dist * p - focus) / spread);
            const a = Math.abs(d);
            set[i].rotate(-42 * d);
            set[i].z(-260 * a);
            set[i].x(-d * widths[i] * 0.12); // tuck turned cards in towards the focus
            set[i].opacity(1 - 0.45 * a);
          });
        };

        // Linear mapping (ease: none); scrub smoothing provides the easing.
        const move = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            ...range,
            pin: true,
            scrub: true, // Lenis already smooths
            anticipatePin: 1,
            onRefresh: (self) => {
              measure();
              curve(self.progress);
            },
            onUpdate: (self) => curve(self.progress),
          },
        });
        gsap.fromTo(progress.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...range, scrub: true } });

        // Each photo drifts against the track direction while its card crosses the screen.
        gsap.utils.toArray('[data-service-img]').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: img.closest('[data-service-card]'),
                containerAnimation: move,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });

        // quickSetter writes aren't recorded by the context, so clear them when leaving desktop.
        return () => gsap.set(cards, { clearProps: 'transform,opacity' });
      });

      // Mobile/tablet: simple fade-up for each stacked card.
      mm.add(`not ${DESKTOP} and ${MOTION_OK}`, () => {
        gsap.utils.toArray('[data-service-card]').forEach((card) => {
          gsap.from(card, {
            autoAlpha: 0,
            y: 60,
            duration: 0.8,
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
          <SplitTextReveal id="services-title" className="mt-6 font-display text-display font-bold">
            Services built to <span className="text-teal">scale</span>
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
          <div ref={progress} className="h-px origin-left scale-x-0 bg-teal" />
        </div>
      </div>
    </section>
  );
}
