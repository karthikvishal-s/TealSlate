import { motion } from 'motion/react';
import { useMagnetic } from '../hooks/useMagnetic';

/** Generic magnetic wrapper: children drift toward the cursor and spring back on leave. */
export default function Magnetic({ as = 'div', strength = 0.3, className = '', style, children, ...rest }) {
  const { ref, x, y, handlers } = useMagnetic(strength);
  const Comp = motion[as];

  return (
    <Comp ref={ref} className={className} style={{ ...style, x, y }} {...handlers} {...rest}>
      {children}
    </Comp>
  );
}
