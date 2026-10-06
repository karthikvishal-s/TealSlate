import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from '../lib/gsap';
import { useLenis } from '../hooks/useLenis';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { services } from '../data/services';
import SplitTextReveal from '../components/SplitTextReveal';
import DevelopImage from '../components/DevelopImage';

/**
 * The Viewfinder. The section pins with a camera viewfinder in the middle; service titles
 * scroll up through it while the photos scroll down, and each pair meets in the frame.
 * Whatever is in the viewfinder is in focus: full-ink title, details showing, photo
 * developed into colour. Between items the brackets ease open, then lock as the next
 * pair settles.
 *
 * Smoothness: every frame is a pure function of scroll progress (Lenis does the smoothing),
 * written with quickSetters as transforms and opacity only. No CSS transitions, no React
 * state, no snapping, so it plays backwards exactly as it plays forwards.
 * Phones: one column of photos rises through the frame, with captions crossfading below.
 * Reduced motion: a plain stacked list.
 */

const N = services.length;
const REST = 0.05; // pinned scroll at each end where the first/last item simply rests

function Brackets() {
  const corner = 'absolute size-7 border-teal md:size-9';
  return (
    <>
      <span className={`${corner} left-0 top-0 rounded-tl-xl border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 rounded-tr-xl border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-xl border-b-2 border-r-2`} />
    </>
  );
}

function Tags({ tags }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Capabilities">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink/80">
          {tag}
        </li>
      ))}
    </ul>
  );
}

function Photo({ service, index, children }) {
  return (
    <li data-svc-photo data-index={index} className="relative h-[var(--v)] shrink-0 overflow-hidden rounded-3xl bg-ink">
      <DevelopImage
        data-svc-parallax
        src={service.image}
        mode="manual"
        className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform"
      />
      {children}
    </li>
  );
}

function DesktopViewfinder({ stage, pick }) {
  return (
    <div className="gutter mt-6 min-h-0 flex-1">
      <div ref={stage} className="relative h-full overflow-hidden">
        <div className="grid h-full grid-cols-12 gap-x-8">
          {/* Titles rise */}
          <div className="relative col-span-5 h-full">
            <ul data-col="titles" className="absolute left-6 right-0 top-0 flex flex-col gap-6 will-change-transform">
              {services.map((service, i) => (
                <li key={service.id} data-svc-title data-index={i} className="flex h-[var(--v)] shrink-0 flex-col justify-center">
                  <button
                    type="button"
                    data-svc-heading
                    onClick={() => pick(i)}
                    onFocus={() => pick(i)}
                    className="group/title self-start text-left font-display text-4xl font-bold leading-[1.05] tracking-tight xl:text-5xl"
                  >
                    <span className="inline-block transition-transform duration-200 ease-expo group-hover/title:translate-x-2">
                      {service.title}
                    </span>
                  </button>
                  <div data-svc-details className="mt-4 max-w-md">
                    <p className="text-base leading-relaxed text-muted">{service.description}</p>
                    <Tags tags={service.tags} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Photos fall (stacked in reverse so the column can travel downward) */}
          <div className="relative col-span-6 col-start-7 h-full">
            <ul data-col="photos" aria-hidden="true" className="absolute left-0 right-6 top-0 flex flex-col gap-6 will-change-transform">
              {[...services].reverse().map((service) => (
                <Photo key={service.id} service={service} index={services.indexOf(service)} />
              ))}
            </ul>
          </div>
        </div>

        {/* Soft paper edges, so items fade in and out rather than being cut off */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-linear-to-b from-paper to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-linear-to-t from-paper to-transparent" />

        <div
          data-viewfinder
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-[calc(var(--v)+1.5rem)] will-change-transform"
        >
          <Brackets />
        </div>
      </div>
    </div>
  );
}

function PhoneViewfinder({ stage }) {
  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden">
        <ul data-col="photos" aria-hidden="true" className="gutter absolute inset-x-0 top-0 flex flex-col gap-6 will-change-transform">
          {services.map((service, i) => (
            <Photo key={service.id} service={service} index={i}>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/85 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5 font-display text-2xl font-bold leading-tight tracking-tight text-paper">
                {service.title}
              </span>
            </Photo>
          ))}
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[14%] bg-linear-to-b from-paper to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-linear-to-t from-paper to-transparent" />
        <div
          data-viewfinder
          aria-hidden="true"
          className="gutter pointer-events-none absolute inset-x-0 top-1/2 h-[calc(var(--v)+1.25rem)] will-change-transform"
        >
          <div className="relative -mx-2.5 h-full">
            <Brackets />
          </div>
        </div>
      </div>

      {/* Captions for the shot in the frame, crossfading with scroll */}
      <div className="gutter grid h-[9.5rem] shrink-0 pt-4">
        {services.map((service, i) => (
          <div key={service.id} data-svc-details data-index={i} className="[grid-area:1/1]">
            <h3 className="sr-only">{service.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{service.description}</p>
            <Tags tags={service.tags} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StaticList() {
  return (
    <ul className="gutter mt-12 flex flex-col gap-16 md:mt-16">
      {services.map((service) => (
        <li key={service.id} className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl lg:col-span-6">
            <img src={service.image} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{service.title}</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{service.description}</p>
            <Tags tags={service.tags} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Services() {
  const root = useRef(null);
  const stage = useRef(null);
  const trigger = useRef(null);
  const desktop = useMediaQuery(DESKTOP);
  const reduced = useReducedMotion();
  const { scrollTo } = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from('[data-services-intro]', {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          delay: 0.2,
          scrollTrigger: { trigger: '[data-services-intro]', start: 'top 90%', once: true },
        });
      });
      if (reduced) return undefined;

      const box = stage.current;
      const q = gsap.utils.selector(root);
      const byIndex = (sel) => {
        const out = [];
        q(sel).forEach((el) => {
          out[Number(el.dataset.index)] = el;
        });
        return out;
      };
      const titles = byIndex('[data-svc-title]');
      const photos = byIndex('[data-svc-photo]');
      // Desktop details live inside each title item; phone captions carry their own index.
      const details = titles.length ? titles.map((t) => t.querySelector('[data-svc-details]')) : byIndex('[data-svc-details]');
      const headings = titles.map((t) => t.querySelector('[data-svc-heading]'));

      // One quickSetter per animated value; these are the only writes per frame.
      const set = (els, prop, unit) => els.map((el) => el && gsap.quickSetter(el, prop, unit));
      // quickSetter takes single properties, so uniform scale writes scaleX and scaleY.
      const scaler = (el) => {
        const sx = gsap.quickSetter(el, 'scaleX');
        const sy = gsap.quickSetter(el, 'scaleY');
        return (v) => {
          sx(v);
          sy(v);
        };
      };
      const titleCol = q('[data-col="titles"]')[0];
      const titlesY = titleCol && gsap.quickSetter(titleCol, 'y', 'px');
      const photosY = gsap.quickSetter(q('[data-col="photos"]')[0], 'y', 'px');
      const finderEl = q('[data-viewfinder]')[0];
      // GSAP owns the frame's transform (it clears Tailwind's separate `translate`), so it
      // centres the frame too.
      gsap.set(finderEl, { yPercent: -50 });
      const finder = scaler(finderEl);
      const headingAlpha = set(headings, 'opacity');
      const detailAlpha = set(details, 'opacity');
      const detailY = set(details, 'y', 'px');
      const photoScale = photos.map((el) => el && scaler(el));
      const veilAlpha = set(photos.map((p) => p.querySelector('[data-develop-veil]')), 'opacity');
      const parallax = set(photos.map((p) => p.querySelector('[data-svc-parallax]')), 'yPercent');

      let geo = { pitch: 0, top: 0 };
      const measure = () => {
        const h = box.clientHeight;
        const v = desktop ? Math.min(h * 0.5, 416) : Math.min(h * 0.82, 352);
        box.style.setProperty('--v', `${v}px`);
        geo = { pitch: v + 24, top: (h - v) / 2 };
      };

      let current = -1;
      const render = (progress) => {
        const s = gsap.utils.clamp(0, 1, (progress - REST) / (1 - REST * 2)) * (N - 1);
        const { pitch, top } = geo;
        titlesY?.(top - s * pitch);
        // Desktop photos are stacked in reverse and travel down; phone photos rise.
        photosY(desktop ? top - (N - 1) * pitch + s * pitch : top - s * pitch);
        for (let i = 0; i < N; i++) {
          const d = Math.abs(s - i);
          const m = Math.min(1, d);
          headingAlpha[i]?.(1 - 0.72 * m);
          detailAlpha[i]?.(1 - Math.min(1, d * 2.5));
          detailY[i]?.(d * 24);
          photoScale[i]?.(0.9 + 0.1 * (1 - m));
          veilAlpha[i]?.(Math.min(1, d * 1.3));
          parallax[i]?.(gsap.utils.clamp(-1, 1, s - i) * -6);
        }
        // Focus lock: the brackets ease open between items and tighten as one settles.
        const off = Math.abs(s - Math.round(s));
        finder(1 + 0.035 * Math.min(1, off * 2));
        const nearest = Math.round(s);
        if (nearest !== current) {
          headings[current]?.removeAttribute('aria-current');
          headings[nearest]?.setAttribute('aria-current', 'true');
          current = nearest;
        }
      };

      measure();
      trigger.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${(N - 1) * (desktop ? 55 : 45)}%`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => {
          measure();
          render(self.progress);
        },
      });
      render(trigger.current.progress);

      return () => {
        trigger.current = null;
      };
    },
    { scope: root, dependencies: [desktop, reduced] },
  );

  // Click/Enter on a title: glide to the scroll position where it sits in the viewfinder.
  const pick = (i) => {
    const st = trigger.current;
    if (!st) return;
    scrollTo(st.start + (st.end - st.start) * (REST + ((1 - REST * 2) * i) / (N - 1)));
  };

  return (
    <section
      id="services"
      ref={root}
      aria-labelledby="services-title"
      className={reduced ? 'py-24 md:py-32' : 'relative flex h-svh flex-col pb-6 pt-24 md:pt-28'}
    >
      <header className="gutter">
        <SplitTextReveal id="services-title" className="font-display text-display font-bold">
          Services built to <span className="text-teal">scale</span>
        </SplitTextReveal>
        <p data-services-intro className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Six disciplines, one team. Mix and match, or let us run the whole show end to end.
        </p>
      </header>

      {reduced ? <StaticList /> : desktop ? <DesktopViewfinder stage={stage} pick={pick} /> : <PhoneViewfinder stage={stage} />}
    </section>
  );
}
