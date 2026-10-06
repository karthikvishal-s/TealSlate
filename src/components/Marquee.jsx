import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

/**
 * Infinite marquee whose speed and direction react to scroll velocity.
 * Children are rendered twice; the track loops between 0% and -50%.
 *
 * @param {number} duration  seconds for one full loop at rest
 * @param {1|-1}   direction 1 = leftward, -1 = rightward
 * @param {boolean} pauseOnHover ease to a stop while a mouse is over it (and back up on leave)
 */
export default function Marquee({ children, duration = 30, direction = 1, pauseOnHover = false, className = '' }) {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const setX = gsap.quickSetter(track.current, 'xPercent');
      const wrap = gsap.utils.wrap(-50, 0);
      const baseSpeed = 50 / duration; // xPercent per second
      let pos = 0;
      let scrollDir = 1;
      let boost = 0;
      let hover = 1;
      let hoverTarget = 1;
      const onEnter = (e) => e.pointerType === 'mouse' && (hoverTarget = 0);
      const onLeave = () => (hoverTarget = 1);
      if (pauseOnHover) {
        root.current.addEventListener('pointerenter', onEnter);
        root.current.addEventListener('pointerleave', onLeave);
      }

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          // Scrolling up flips the marquee; fast flicks temporarily speed it up.
          scrollDir = self.direction;
          boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 250, 8));
        },
      });

      // A constant-velocity ticker loop (a marquee must not ease), with the
      // velocity boost decaying smoothly back to the resting speed.
      const tick = (_time, deltaMs) => {
        if (!st.isActive) return;
        const dt = deltaMs / 1000;
        boost *= Math.pow(0.04, dt);
        // Exponential approach: ~0.6s to stop, a touch longer to get going again.
        hover += (hoverTarget - hover) * (1 - Math.pow(hoverTarget ? 0.02 : 0.005, dt));
        pos = wrap(pos - baseSpeed * (1 + boost) * hover * direction * scrollDir * dt);
        setX(pos);
      };
      gsap.ticker.add(tick);

      const el = root.current;
      return () => {
        gsap.ticker.remove(tick);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
