// Single place where GSAP + plugins are registered. Always import GSAP from here.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// House easing: fast start, long luxurious settle.
gsap.defaults({ ease: 'expo.out', duration: 1.2 });

// Lenis drives scrolling from gsap.ticker, so never let GSAP "catch up" after a hitch.
gsap.ticker.lagSmoothing(0);

// Avoid refresh jank when mobile browser chrome shows/hides.
ScrollTrigger.config({ ignoreMobileResize: true });

export const EASE = {
  out: 'expo.out',
  power: 'power4.out',
  inOut: 'power4.inOut',
};

export const REDUCED = '(prefers-reduced-motion: reduce)';
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const DESKTOP = '(min-width: 1024px)';

export { gsap, ScrollTrigger, SplitText, useGSAP };
