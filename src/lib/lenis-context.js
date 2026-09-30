import { createContext } from 'react';

export const LenisContext = createContext({
  lenis: null,
  scrollTo: () => {},
});
