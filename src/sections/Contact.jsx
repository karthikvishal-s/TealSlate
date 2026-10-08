import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { contact } from '../data/contact';
import { site, socials } from '../data/site';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';
import Magnetic from '../components/Magnetic';
import ContactForm from '../components/ContactForm';
import RollingText from '../components/RollingText';
import { LogoMark } from '../components/Logo';

/**
 * Contact fills its page edge to edge in night, and on laptops and up the whole thing
 * (intro and form) fits in one screen with no scrolling.
 * The backdrop is its own layer (two slow aurora glows, grain, and a faint TS watermark)
 * so nothing on it ever transforms the form. Everything arrives in one staged entrance
 * once `ready` (the preloader or page curtain is lifting).
 */
export default function Contact({ ready = true }) {
  const root = useRef(null);
  const mark = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const items = root.current.querySelectorAll('[data-reveal]');
        const rule = root.current.querySelector('[data-rule]');
        if (!ready) {
          gsap.set(items, { autoAlpha: 0, y: 28 });
          gsap.set(rule, { scaleY: 0 });
          return;
        }
        gsap
          .timeline({ delay: 0.35 })
          .fromTo(rule, { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: 'expo.inOut' }, 0)
          .fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, 0.3);

        // The watermark drifts slowly as the page scrolls.
        gsap.fromTo(
          mark.current,
          { yPercent: 6, rotate: -4 },
          {
            yPercent: -6,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title">
      <div
        data-cursor-theme="dark"
        className="theme-night gutter relative isolate flex min-h-[100svh] flex-col pb-16 pt-32 [color-scheme:dark] md:pt-36 lg:pb-10 lg:pt-28"
      >
        {/* Bottom corners follow <main>: square when the page ends square, rounded (a hair tighter, to hide main's anti-aliased edge) when
            the footer reveal rounds it, so no paper ever shows around the panel's bottom */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -bottom-px -z-10 overflow-hidden bg-night group-data-[rounded=true]/main:rounded-b-[calc(2rem-2px)] md:group-data-[rounded=true]/main:rounded-b-[calc(3rem-2px)]"
        >
          {/* Square and fading out before their own edges, so the glows never show a hard line */}
          <div className="aurora-a absolute -right-[18%] -top-[22%] aspect-square w-[min(95%,58rem)] bg-[radial-gradient(circle_closest-side,rgb(45_212_191/0.17),transparent)]" />
          <div className="aurora-b absolute -bottom-[30%] -left-[20%] aspect-square w-[min(90%,52rem)] bg-[radial-gradient(circle_closest-side,rgb(15_118_110/0.28),transparent)]" />
          {/* A soft line of light under the navbar, so the header sits on the page rather than floating over it */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-bright/25 to-transparent" />
          <div className="grain" />
          <div ref={mark} className="absolute -bottom-[8%] -right-[6%] w-[min(60%,40rem)] will-change-transform">
            <LogoMark className="w-full text-paper opacity-[0.04]" />
          </div>
        </div>

        {/* Everything fits in one screen on laptops and up: the intro on the left, the form on the right */}
        <div className="grid flex-1 gap-14 lg:grid-cols-12 lg:items-center lg:gap-0">
          <div className="flex flex-col gap-8 lg:col-span-5 lg:pr-12">
            <div data-reveal className="flex flex-wrap items-center justify-between gap-4">
              <SectionLabel>Contact</SectionLabel>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper/[0.03] px-4 py-2 text-xs font-medium text-paper/80">
                <span aria-hidden="true" className="relative grid size-2 place-items-center">
                  <span className="pulse-dot absolute inset-0 rounded-full bg-teal" />
                  <span className="relative size-2 rounded-full bg-teal" />
                </span>
                Replies within one business day
              </p>
            </div>

            {/* Motion (magnetic) on the wrapper, GSAP (split reveal) on the heading inside: never the same element */}
            <Magnetic strength={0.08} className="inline-block self-start">
              {/* Contact is its own page, so this is the page's one h1 */}
              <SplitTextReveal
                as="h1"
                id="contact-title"
                type="words"
                ready={ready}
                delay={0.4}
                duration={1.2}
                stagger={0.08}
                className="font-display text-[clamp(3rem,6.2vw,6.5rem)] font-bold leading-[0.98] tracking-[-0.045em]"
              >
                Let&apos;s <span className="text-teal">talk</span>
              </SplitTextReveal>
            </Magnetic>

            <p data-reveal className="max-w-md text-lg leading-relaxed text-muted">
              {contact.intro}
            </p>

            <div data-reveal>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Email us</p>
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
              >
                <RollingText>{site.email}</RollingText>
                <ArrowUpRight aria-hidden="true" className="size-6 text-teal transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </div>

            <div data-reveal className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Follow along</p>
              <ul className="flex flex-wrap gap-x-6">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="group inline-block py-1 text-sm font-medium">
                      <RollingText>{s.label}</RollingText>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">{site.location}</p>
            </div>
          </div>

          <div className="relative lg:col-span-7 lg:pl-14">
            {/* A hairline between the columns that draws down on arrival */}
            <span data-rule aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-px origin-top bg-line lg:block" />
            <div data-reveal>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
