// Shared Motion presets so interaction animation feels consistent site-wide.
export const easeExpo = [0.16, 1, 0.3, 1];
export const easeInOut = [0.87, 0, 0.13, 1];

export const springMagnetic = { stiffness: 180, damping: 16, mass: 0.25 };
export const springFollow = { stiffness: 220, damping: 26, mass: 0.6 };
export const springSnap = { type: 'spring', stiffness: 260, damping: 32 };
