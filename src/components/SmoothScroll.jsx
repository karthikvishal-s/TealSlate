import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { LenisContext } from '../lib/lenis-context';
import { useReducedMotion } from '../hooks/useReducedMotion';

const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function SmoothScroll({ children }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (reduced) return undefined;

    const instance = new Lenis({ lerp: 0.085, smoothWheel: true });

    // Keep ScrollTrigger in lockstep with Lenis' virtual scroll position,
    // and let GSAP's ticker own the RAF loop so both update in the same frame.
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  const value = useMemo(() => {
    const scrollTo = (target, options = {}) => {
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.6, easing: expoOut, ...options });
        return;
      }
      if (typeof target === 'number') {
        window.scrollTo({ top: target });
        return;
      }
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      el?.scrollIntoView();
    };
    return { lenis, scrollTo };
  }, [lenis]);

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
