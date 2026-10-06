// Shared Motion presets so interaction animation feels consistent site-wide.
export const easeExpo = [0.16, 1, 0.3, 1];
export const easeInOut = [0.87, 0, 0.13, 1];

export const springMagnetic = { stiffness: 180, damping: 16, mass: 0.25 };
export const springFollow = { stiffness: 320, damping: 30, mass: 0.45 };
// Tight pointer follow: arrives almost immediately, no visible lag or overshoot.
export const springSnappy = { stiffness: 900, damping: 55, mass: 0.2 };
