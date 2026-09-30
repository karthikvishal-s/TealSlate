import { useContext } from 'react';
import { LenisContext } from '../lib/lenis-context';

/**
 * Access the Lenis instance and a `scrollTo` helper that falls back to
 * native scrolling when Lenis is disabled (prefers-reduced-motion).
 */
export function useLenis() {
  return useContext(LenisContext);
}
