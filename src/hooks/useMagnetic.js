import { useRef } from 'react';
import { useSpring } from 'motion/react';
import { springMagnetic } from '../lib/motion';
import { useIsTouchDevice } from './useIsTouchDevice';
import { useReducedMotion } from './useReducedMotion';

/**
 * Spring-driven magnetic pull toward the pointer.
 * Returns Motion values to bind to `style={{ x, y }}` plus pointer handlers.
 */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const x = useSpring(0, springMagnetic);
  const y = useSpring(0, springMagnetic);
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const disabled = touch || reduced;

  const onPointerMove = (e) => {
    if (disabled || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // Subtract the current offset so we measure from the element's resting center
    // (otherwise the element chases its own transformed rect and jitters).
    const cx = r.left - x.get() + r.width / 2;
    const cy = r.top - y.get() + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, x, y, handlers: { onPointerMove, onPointerLeave } };
}
