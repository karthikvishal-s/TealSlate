import { useId, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

/**
 * Text set on a circle that spins slowly and speeds up with scroll velocity
 * (same ticker approach as Marquee). Children render in the centre.
 */
export default function CircularText({ text, className = '', children }) {
  const root = useRef(null);
  const ring = useRef(null);
  const id = useId().replace(/:/g, '');

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let angle = 0;
      let boost = 0;
      let dir = 1;
      const setRotate = gsap.quickSetter(ring.current, 'rotate', 'deg');

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          dir = self.direction;
          boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 120, 14));
        },
      });

      const tick = (_t, deltaMs) => {
        if (!st.isActive) return;
        const dt = deltaMs / 1000;
        boost *= Math.pow(0.05, dt);
        angle += (12 + boost * 12) * dir * dt; // degrees per second
        setRotate(angle);
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`relative grid place-items-center overflow-hidden rounded-full ${className}`}>
      <svg ref={ring} viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <path id={`circle-${id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current font-display text-[14px] font-semibold uppercase">
          {/* textLength = circumference (2πr), so the text always closes the loop exactly */}
          <textPath href={`#circle-${id}`} textLength="490" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="sr-only">{text}</span>
      {children}
    </div>
  );
}
