import { motion, useTransform } from 'motion/react';
import { useMagnetic } from '../hooks/useMagnetic';

const VARIANTS = {
  primary: {
    base: 'bg-teal text-paper',
    fill: 'bg-ink',
  },
  outline: {
    base: 'border border-line text-ink hover:text-paper',
    fill: 'bg-teal',
  },
  'outline-dark': {
    base: 'border border-paper/20 text-paper hover:text-ink',
    fill: 'bg-teal-bright',
  },
  light: {
    base: 'bg-ink text-paper',
    fill: 'bg-teal',
  },
  // For dark surfaces: a paper pill that fills with bright teal on hover.
  paper: {
    base: 'bg-paper text-ink',
    fill: 'bg-teal-bright',
  },
};

const SIZES = {
  md: 'h-14 px-7 text-sm',
  lg: 'h-16 px-9 text-base',
  circle: 'size-20 md:size-24 text-sm',
};

/**
 * Pill button with magnetic pull, an inner label that moves further than the shell
 * (parallax depth), and a circular fill that rises on hover.
 * Renders an <a> when `href` is set, otherwise a <button>.
 */
export default function MagneticButton({
  href,
  variant = 'primary',
  size = 'md',
  strength = 0.4,
  icon: Icon,
  className = '',
  children,
  ...rest
}) {
  const { ref, x, y, handlers } = useMagnetic(strength);
  const innerX = useTransform(x, (v) => v * 0.45);
  const innerY = useTransform(y, (v) => v * 0.45);
  const Comp = href ? motion.a : motion.button;
  const v = VARIANTS[variant];

  return (
    <Comp
      ref={ref}
      href={href}
      type={href ? undefined : rest.type ?? 'button'}
      style={{ x, y }}
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-tight transition-colors duration-300 ease-expo disabled:pointer-events-none disabled:opacity-60 ${v.base} ${SIZES[size]} ${className}`}
      {...handlers}
      {...rest}
    >
      {/* Oversized circle that slides up to fill the pill on hover */}
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-full -z-10 aspect-square w-[150%] -translate-x-1/2 rounded-full transition-transform duration-500 ease-expo group-hover:-translate-y-[75%] ${v.fill}`}
      />
      <motion.span style={{ x: innerX, y: innerY }} className="relative flex items-center gap-2.5">
        {children}
        {Icon && (
          <Icon
            aria-hidden="true"
            className="size-[1.1em] transition-transform duration-300 ease-expo group-hover:rotate-45"
            strokeWidth={2}
          />
        )}
      </motion.span>
    </Comp>
  );
}
