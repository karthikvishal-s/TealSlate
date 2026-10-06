import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { animate } from 'motion/react';
import { ScrollTrigger } from '../lib/gsap';
import { easeInOut } from '../lib/motion';
import { useLenis } from '../hooks/useLenis';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { site } from '../data/site';
import { LogoMark } from './Logo';

/**
 * Page-to-page navigation as a film cut: an ink curtain rises over the page, the route
 * swaps underneath (already at the top, or at the requested section), and the curtain
 * lifts away. No long scroll down the page to get somewhere.
 *
 * `usePageNav()` gives every link one `go(target)`:
 *   '/contact'  another page → curtain transition
 *   '#work'     a section of the home page → smooth scroll if already home, else cut to it
 *   0           top of the home page
 */

const NavContext = createContext({ go: () => {}, hrefFor: (t) => t });

const LABELS = { '/contact': "Let's talk", '/': site.name };
const HIDDEN = 'inset(100% 0% 0% 0%)';
const SHOWN = 'inset(0% 0% 0% 0%)';
const GONE = 'inset(0% 0% 100% 0%)';

const parse = (target) => {
  if (typeof target === 'number') return { path: '/', hash: '' };
  if (target.startsWith('#')) return { path: '/', hash: target };
  const [path, hash = ''] = target.split('#');
  return { path: path || '/', hash: hash ? `#${hash}` : '' };
};

export function usePageNav() {
  return useContext(NavContext);
}

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate();
  const { pathname, hash: locationHash } = useLocation();
  const { lenis, scrollTo } = useLenis();
  const reduced = useReducedMotion();
  const curtain = useRef(null);
  const busy = useRef(false);
  const [label, setLabel] = useState('');

  // Land on the new page instantly: the top, or the requested section.
  const jump = useCallback(
    (hash) => {
      const el = hash ? document.querySelector(hash) : null;
      // Lenis caches the page height; re-measure first or it clamps to the old page's end.
      lenis?.resize();
      if (lenis) lenis.scrollTo(el ?? 0, { immediate: true, force: true });
      else if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
      ScrollTrigger.update();
    },
    [lenis],
  );

  // After a page change, focus the main region so screen readers start from the new page
  // (it is focusable via tabIndex -1 and never shows a ring).
  const focusMain = () => document.getElementById('main')?.focus({ preventScroll: true });

  // A freshly mounted page's ScrollTriggers refresh during their first frames and can put
  // the scroll back where it was cached (the old page). Re-assert the landing until it holds.
  const settle = useCallback(
    async (hash) => {
      const targetY = () => {
        const el = hash ? document.querySelector(hash) : null;
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      };
      let steady = 0;
      for (let i = 0; i < 40 && steady < 4; i++) {
        if (Math.abs(window.scrollY - targetY()) > 2) {
          jump(hash);
          steady = 0;
        } else steady += 1;
        await new Promise((r) => requestAnimationFrame(r));
      }
    },
    [jump],
  );

  const go = useCallback(
    async (target) => {
      const { path, hash } = parse(target);
      // Same page: the normal smooth scroll.
      if (path === pathname) {
        scrollTo(hash || 0);
        return;
      }
      if (busy.current) return;
      busy.current = true;
      const el = curtain.current;
      setLabel(LABELS[path] ?? site.name);
      lenis?.stop();

      if (!reduced) {
        el.style.visibility = 'visible';
        await animate(el, { clipPath: [HIDDEN, SHOWN] }, { duration: 0.55, ease: easeInOut });
      }

      // Commit the new route synchronously (its effects included), then let it lay out.
      flushSync(() => navigate(path));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      ScrollTrigger.refresh();
      await settle(hash);
      focusMain();
      lenis?.start();

      if (!reduced) {
        await animate(el, { clipPath: [SHOWN, GONE] }, { duration: 0.65, ease: easeInOut });
        el.style.visibility = 'hidden';
      }
      busy.current = false;
    },
    [pathname, scrollTo, lenis, reduced, navigate, settle],
  );

  // Back/forward buttons change the route without go(): re-measure and land cleanly too.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (busy.current) return;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      settle(locationHash).then(focusMain);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Real hrefs for each target, so middle-click / copy link still work.
  const hrefFor = useCallback((target) => {
    const { path, hash } = parse(target);
    return `${path}${hash}`;
  }, []);

  const value = useMemo(() => ({ go, hrefFor }), [go, hrefFor]);

  return (
    <NavContext.Provider value={value}>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="fixed inset-0 z-[95] grid place-items-center bg-ink text-paper"
        style={{ clipPath: HIDDEN, visibility: 'hidden' }}
      >
        <div className="flex flex-col items-center gap-5">
          <LogoMark className="h-10 w-auto text-teal-bright" />
          <p className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-none tracking-tight">{label}</p>
        </div>
      </div>
    </NavContext.Provider>
  );
}
