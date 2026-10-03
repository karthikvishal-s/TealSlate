import { useRef } from 'react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../lib/gsap';
import { useLenis } from '../hooks/useLenis';
import { navLinks, site, socials } from '../data/site';
import MagneticButton from '../components/MagneticButton';
import RollingText from '../components/RollingText';

/**
 * Sits underneath <main> (fixed, z-0) and is uncovered as the page scrolls past
 * the end of <main>. App.jsx measures it and adds matching margin to <main>.
 * Falls back to normal flow when taller than the viewport.
 */
export default function Footer({ ref, fixed }) {
  const inner = useRef(null);
  const { scrollTo } = useLenis();

  // Content drifts up into place while the footer is being revealed (subtle parallax).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          inner.current,
          { yPercent: -25, autoAlpha: 0.3 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              start: () => ScrollTrigger.maxScroll(window) - inner.current.offsetHeight,
              end: 'max',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: inner, dependencies: [fixed], revertOnUpdate: true },
  );

  const go = (e, href) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <footer
      ref={ref}
      data-cursor-theme="dark"
      className={`${fixed ? 'fixed' : 'relative'} inset-x-0 bottom-0 z-0 overflow-hidden bg-ink text-paper`}
    >
      <div ref={inner} className="gutter flex flex-col pb-6 pt-20 will-change-[transform,opacity] md:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-display text-display font-bold">
              Have an idea? <br />
              <span className="text-teal-bright">Let&apos;s make it move.</span>
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-8 inline-flex items-center gap-2 text-lg font-semibold md:text-xl"
            >
              <RollingText accent="text-teal-bright">{site.email}</RollingText>
              <ArrowUpRight aria-hidden="true" className="size-5 text-teal-bright transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-paper/55">Menu</p>
              <ul className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} onClick={(e) => go(e, l.href)} className="group">
                      <RollingText accent="text-teal-bright">{l.label}</RollingText>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-paper/55">Social</p>
              <ul className="flex flex-col gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="group">
                      <RollingText accent="text-teal-bright">{s.label}</RollingText>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-paper/55">Studio</p>
              <p className="text-paper/80">{site.location}</p>
              <p className="mt-2 text-paper/55">Mon–Fri, 9:00–18:00</p>
            </div>
          </nav>
        </div>

        {/* Container-query units: the wordmark (≈3.9em wide) always spans the content width exactly */}
        <div className="@container mt-16 md:mt-24">
          <p
            aria-hidden="true"
            className="select-none whitespace-nowrap text-center font-display text-[25cqi] font-bold leading-[0.85] tracking-[-0.06em]"
          >
            Teal<span className="text-teal-bright">Slate</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse items-start gap-6 border-t border-paper/15 pt-6 text-sm text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="hidden md:block">Designed &amp; built in-house</p>
          <MagneticButton
            onClick={() => scrollTo(0, { duration: 1.6 })}
            variant="outline-dark"
            size="circle"
            aria-label="Back to top"
            strength={0.5}
          >
            <ArrowUp aria-hidden="true" className="size-5" />
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
}
