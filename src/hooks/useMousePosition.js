import { useEffect } from 'react';
import { useMotionValue } from 'motion/react';

/**
 * Viewport pointer position as Motion values.
 * Motion values update without React re-renders, which matters at 60fps+.
 */
export function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [x, y]);

  return { x, y };
}
