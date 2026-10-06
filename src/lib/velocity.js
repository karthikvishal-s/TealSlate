// Scroll-speed bus: one smoothed velocity value drives a subtle "stretch" on registered
// wrappers (photos lean and elongate a touch while you scroll fast, then settle).
// Only elements currently on screen are written to, and nothing is written at rest.
import { useEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK } from './gsap';

const SKEW = 1.2; // deg at full speed
const STRETCH = 0.035; // extra scaleY at full speed
const FULL_SPEED = 3000; // px/s that counts as "full speed"

const state = { v: 0 };
const visible = new Set();
const setters = new Map();
let io;
let started = false;
let resting = true;

function apply() {
  const v = state.v;
  if (Math.abs(v) < 0.01) {
    if (resting) return;
    resting = true;
    visible.forEach((el) => setters.get(el)?.(0));
    return;
  }
  resting = false;
  visible.forEach((el) => setters.get(el)?.(v));
}

function start() {
  if (started) return;
  started = true;
  const to = gsap.quickTo(state, 'v', { duration: 0.4, ease: 'power3', onUpdate: apply });
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => to(gsap.utils.clamp(-1, 1, self.getVelocity() / FULL_SPEED)),
  });
  // getVelocity stops updating once scrolling ends, so settle explicitly.
  ScrollTrigger.addEventListener('scrollEnd', () => to(0));
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) visible.add(e.target);
      else {
        visible.delete(e.target);
        setters.get(e.target)?.(0);
      }
    });
  });
}

function register(el) {
  start();
  gsap.set(el, { transformOrigin: '50% 0%' });
  const skew = gsap.quickSetter(el, 'skewY', 'deg');
  const scaleY = gsap.quickSetter(el, 'scaleY');
  setters.set(el, (v) => {
    skew(v * SKEW);
    scaleY(1 + Math.abs(v) * STRETCH);
  });
  io.observe(el);
}

function unregister(el) {
  io?.unobserve(el);
  visible.delete(el);
  setters.delete(el);
  gsap.set(el, { clearProps: 'transform' });
}

/** Imperative form for lists: registers each element and returns a cleanup. */
export function stretch(elements) {
  if (!window.matchMedia(MOTION_OK).matches) return () => {};
  const els = [...elements].filter(Boolean);
  els.forEach(register);
  return () => els.forEach(unregister);
}

/**
 * Registers `ref.current` for the scroll stretch (motion-safe screens only).
 * Put it on a wrapper that nothing else transforms.
 */
export function useScrollStretch(ref, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !window.matchMedia(MOTION_OK).matches) return undefined;
    register(el);
    return () => unregister(el);
  }, [ref, enabled]);
}
