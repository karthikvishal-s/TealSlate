import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { easeExpo, easeInOut } from '../lib/motion';
import { useLenis } from '../hooks/useLenis';
import { isPlainClick, usePageNav } from './PageTransition';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { navLinks, site, socials } from '../data/site';
import MagneticButton from './MagneticButton';
import RollingText from './RollingText';
import { LogoMark, LogoWordmark } from './Logo';

export default function Navbar({ ready }) {
  const header = useRef(null);
  const inner = useRef(null);
  const menuButton = useRef(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const reduced = useReducedMotion();
  const openRef = useRef(open);
  openRef.current = open;
  const { lenis } = useLenis();
  const { go: navigateTo, hrefFor } = usePageNav();
  const { pathname } = useLocation();
  // On the contact page the Contact link is the current one; at home it follows the scroll.
  const active = pathname === '/contact' ? '/contact' : current;
  // The contact page is night from the top edge, so the bar goes dark with it (the open menu is paper, so it stays light).
  const dark = pathname === '/contact' && !open;

  // Entrance after the preloader.
  useGSAP(
    () => {
      if (!ready) {
        gsap.set(inner.current, { autoAlpha: 0, yPercent: -80 });
        return;
      }
      gsap.to(inner.current, { autoAlpha: 1, yPercent: 0, duration: 0.9, delay: 0.3, ease: 'expo.out' });
    },
    { scope: header, dependencies: [ready] },
  );

  // Which home section is under the middle of the screen (drives the sliding pill and
  // aria-current). Rebuilt per page, since the sections come and go with the route.
  // refreshPriority -1: measure after the pinned sections above have added their spacing.
  useGSAP(
    () => {
      setCurrent(null);
      navLinks.forEach(({ href }) => {
        const section = href.startsWith('#') ? document.querySelector(href) : null;
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          refreshPriority: -1,
          onToggle: (self) => setCurrent((c) => (self.isActive ? href : c === href ? null : c)),
        });
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  // Hide on scroll down, reveal on scroll up.
  useGSAP(
    () => {
      let hidden = false;
      let scrolled = false;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          // Only touch the DOM when the state flips (writing every frame invalidates styles).
          if (y > 40 !== scrolled) {
            scrolled = y > 40;
            header.current.dataset.scrolled = String(scrolled);
          }
          const shouldHide = self.direction === 1 && y > 200 && !openRef.current;
          if (shouldHide === hidden) return;
          hidden = shouldHide;
          gsap.to(header.current, {
            yPercent: hidden ? -110 : 0,
            duration: hidden ? 0.6 : 0.9,
            ease: hidden ? 'power3.in' : 'expo.out',
            overwrite: true,
          });
        },
      });
    },
    { scope: header },
  );

  // Any route change (including back/forward) closes the mobile menu, so it never stays
  // open, with scrolling locked, over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return undefined;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      menuButton.current?.focus({ preventScroll: true });
    };
  }, [open, lenis]);

  const go = (e, href) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (open) {
      setOpen(false);
      // Wait for the overlay to start closing and the scroll lock to lift.
      setTimeout(() => navigateTo(href), 350);
    } else {
      navigateTo(href);
    }
  };

  return (
    <>
      <header
        ref={header}
        data-scrolled="false"
        data-cursor-theme={dark ? 'dark' : undefined}
        className={`group/header fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          dark
            ? 'text-paper data-[scrolled=true]:bg-night/90 data-[scrolled=true]:shadow-[0_1px_0_rgb(245_242_236/0.08)]'
            : 'data-[scrolled=true]:bg-paper/95 data-[scrolled=true]:shadow-[0_1px_0_rgb(20_33_31/0.08)]'
        }`}
      >
        <div ref={inner} className="gutter flex h-20 items-center justify-between gap-6 md:h-24">
          <a
            href="/"
            onClick={(e) => go(e, 0)}
            className="flex items-center gap-3 text-brand"
            aria-label={`${site.name}, back to top`}
          >
            <LogoMark className="h-8 w-auto md:h-9" />
            <LogoWordmark production={false} className="h-3.5 w-auto max-sm:hidden md:h-4" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={hrefFor(link.href)}
                    onClick={(e) => go(e, link.href)}
                    // A route link marks the current page; a section link marks the current place on it.
                    aria-current={active === link.href ? (link.href.startsWith('/') ? 'page' : 'location') : undefined}
                    className="group relative isolate inline-block py-3"
                  >
                    {active === link.href && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden="true"
                        className={`absolute -inset-x-3.5 -inset-y-0.5 -z-10 rounded-full ${dark ? 'bg-paper/10' : 'bg-ink/[0.07]'}`}
                        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: easeExpo }}
                      />
                    )}
                    <RollingText>{link.label}</RollingText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* Already on the contact page: the CTA would only point at itself */}
            {pathname !== '/contact' && (
              <MagneticButton
                href="/contact"
                onClick={(e) => go(e, '/contact')}
                icon={ArrowUpRight}
                className="!h-12 max-sm:hidden"
              >
                Let&apos;s talk
              </MagneticButton>
            )}

            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={`relative grid size-12 place-items-center rounded-full border transition-colors duration-300 lg:hidden ${dark ? 'border-paper/20' : 'border-line'}`}
            >
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-5 ${dark ? 'bg-paper' : 'bg-ink'} transition-[transform,background-color] duration-500 ease-expo ${open ? 'rotate-45' : '-translate-y-[4px]'}`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-5 ${dark ? 'bg-paper' : 'bg-ink'} transition-[transform,background-color] duration-500 ease-expo ${open ? '-rotate-45' : 'translate-y-[4px]'}`}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="gutter fixed inset-0 z-40 flex flex-col justify-between bg-card pb-8 pt-28 lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: easeInOut }}
          >
            <nav aria-label="Mobile">
              <motion.ul
                className="flex flex-col gap-1"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
              >
                {navLinks.map((link, i) => (
                  <li key={link.href} className="overflow-hidden">
                    <motion.a
                      href={hrefFor(link.href)}
                      onClick={(e) => go(e, link.href)}
                      autoFocus={i === 0}
                      className="block font-display text-[clamp(2.75rem,12vw,5rem)] font-bold leading-[1.05] tracking-tight"
                      variants={{
                        hidden: { y: '110%', transition: { duration: 0.4, ease: easeInOut } },
                        show: { y: '0%', transition: { duration: 0.6, ease: easeExpo } },
                      }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </motion.ul>
            </nav>

            <motion.div
              className="flex flex-col gap-4 border-t border-line pt-6 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.5, ease: easeExpo } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <a href={`mailto:${site.email}`} className="text-lg font-semibold">
                {site.email}
              </a>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-ink">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
