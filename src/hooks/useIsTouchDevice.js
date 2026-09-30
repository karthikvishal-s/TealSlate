import { useMediaQuery } from './useMediaQuery';

/** True for touch-first devices (no hover or a coarse pointer). */
export function useIsTouchDevice() {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}
