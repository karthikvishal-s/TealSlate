import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { easeExpo, easeInOut } from '../lib/motion';
import { useLenis } from '../hooks/useLenis';
import { navLinks, site, socials } from '../data/site';
import MagneticButton from './MagneticButton';
import RollingText from './RollingText';

export default function Navbar({ ready }) {
  const header = useRef(null);
  const inner = useRef(null);
  const menuButton = useRef(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;
  const { lenis, scrollTo } = useLenis();

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

  // Hide on scroll down, reveal on scroll up.
  useGSAP(
    () => {
      let hidden = false;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          header.current.dataset.scrolled = String(y > 40);
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
    e.preventDefault();
    if (open) {
      setOpen(false);
      // Wait for the overlay to start closing and the scroll lock to lift.
      setTimeout(() => scrollTo(href), 350);
    } else {
      scrollTo(href);
    }
  };

  return (
    <>
      <header
        ref={header}
        data-scrolled="false"
        className="group/header fixed inset-x-0 top-0 z-50 transition-colors duration-300 data-[scrolled=true]:bg-paper/95 data-[scrolled=true]:shadow-[0_1px_0_rgb(20_33_31/0.08)]"
      >
        <div ref={inner} className="gutter flex h-20 items-center justify-between gap-6 md:h-24">
          <a
            href="#top"
            onClick={(e) => go(e, 0)}
            className="font-display text-xl font-bold tracking-tight md:text-2xl"
            aria-label={`${site.name}, back to top`}
          >
            Teal<span className="text-teal">Slate</span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={(e) => go(e, link.href)} className="group py-2">
                    <RollingText>{link.label}</RollingText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <MagneticButton
              href="#contact"
              onClick={(e) => go(e, '#contact')}
              icon={ArrowUpRight}
              className="!h-12 max-sm:hidden"
            >
              Let&apos;s Talk
            </MagneticButton>

            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative grid size-12 place-items-center rounded-full border border-line lg:hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-expo ${open ? 'rotate-45' : '-translate-y-[4px]'}`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-expo ${open ? '-rotate-45' : 'translate-y-[4px]'}`}
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
                      href={link.href}
                      onClick={(e) => go(e, link.href)}
                      autoFocus={i === 0}
                      className="flex items-baseline gap-4 font-display text-[clamp(2.75rem,12vw,5rem)] font-bold leading-[1.05] tracking-tight"
                      variants={{
                        hidden: { y: '110%', transition: { duration: 0.4, ease: easeInOut } },
                        show: { y: '0%', transition: { duration: 0.6, ease: easeExpo } },
                      }}
                    >
                      <span className="text-sm font-medium text-teal">0{i + 1}</span>
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
