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
 * Contact is a full-bleed black panel that runs to the end of the page. The panel is a
 * separate fill layer (with a soft glow, grain, and a faint TS watermark) so it can widen
 * to the screen edges on scroll without ever transforming the form above it.
 */
export default function Contact() {
  const root = useRef(null);
  const fill = useRef(null);
  const mark = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The panel widens to full bleed as it arrives (same move as the Work panel).
        gsap.fromTo(
          fill.current,
          { scaleX: 0.92 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 30%', scrub: true } },
        );
        // The watermark drifts slowly across the whole section.
        gsap.fromTo(
          mark.current,
          { yPercent: 8, rotate: -4 },
          {
            yPercent: -8,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title">
      <div
        data-cursor-theme="dark"
        className="theme-night gutter relative isolate py-24 [color-scheme:dark] md:py-36"
      >
        {/* Bottom corners follow <main>: square when the page ends square, rounded (a hair tighter, to hide main's anti-aliased edge) when
            the footer reveal rounds it, so no paper ever shows around the panel's bottom */}
        <div
          ref={fill}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -bottom-px -z-10 overflow-hidden rounded-t-[2rem] bg-night will-change-transform group-data-[rounded=true]/main:rounded-b-[calc(2rem-2px)] md:rounded-t-[3rem] md:group-data-[rounded=true]/main:rounded-b-[calc(3rem-2px)]"
        >
          {/* Square, and fading out before its own edges, so the glow never shows a hard line on tall boxes */}
          <div className="absolute -right-[12%] -top-24 aspect-square md:-top-40 w-[min(80%,48rem)] bg-[radial-gradient(circle_closest-side,rgb(45_212_191/0.16),transparent)]" />
          <div className="grain" />
          <div ref={mark} className="absolute -bottom-[10%] -right-[6%] w-[min(60%,40rem)] will-change-transform">
            <LogoMark className="w-full text-paper opacity-[0.045]" />
          </div>
        </div>

        <SectionLabel>Contact</SectionLabel>

        {/* Motion (magnetic) on the wrapper, GSAP (split reveal) on the heading inside: never the same element */}
        <Magnetic strength={0.08} className="mt-6 inline-block">
          {/* Contact is its own page now, so this is the page's one h1 */}
          <SplitTextReveal
            as="h1"
            id="contact-title"
            type="words"
            className="font-display text-mega font-bold"
          >
            Let&apos;s <span className="text-teal">talk</span>
          </SplitTextReveal>
        </Magnetic>

        <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-12">
          <div className="flex flex-col gap-10 lg:col-span-4">
            <p className="max-w-sm text-lg leading-relaxed text-muted">{contact.intro}</p>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Email us</p>
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
              >
                <RollingText>{site.email}</RollingText>
                <ArrowUpRight aria-hidden="true" className="size-6 text-teal transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted">Follow along</p>
              <ul className="flex flex-wrap gap-x-6">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="group inline-block py-1.5 text-sm font-medium">
                      <RollingText>{s.label}</RollingText>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
