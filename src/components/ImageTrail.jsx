import { useEffect, useImperativeHandle, useRef } from 'react';
import { animate } from 'motion/react';
import { easeExpo, easeInOut } from '../lib/motion';

/**
 * Pointer-driven image trail. Every `threshold` px of pointer travel, the next
 * image in a small pool glides from the previous cursor point to the current one,
 * pops in with a slight tilt, then shrinks away. Pooling keeps the DOM tiny.
 *
 * Listens on `targetRef` (the section) so it works under content layered on top.
 * While images are showing, `is-trailing` is set on the target so content above can
 * react (the hero uses it for a soft legibility halo on its text).
 *
 * `ref` exposes `setEnabled(bool)` to pause the trail (the hero turns it off mid-dive).
 */
export default function ImageTrail({ images, targetRef, threshold = 90, ref }) {
  const layer = useRef(null);
  const api = useRef({ enabled: true });

  useImperativeHandle(
    ref,
    () => ({
      setEnabled: (on) => {
        api.current.enabled = on;
      },
    }),
    [],
  );

  useEffect(() => {
    const target = targetRef.current;
    const nodes = [...layer.current.children];
    let last = null;
    let index = 0;
    let z = 1;
    let trailing = false;
    let idle;
    // Touch the DOM only when the state flips; clear it shortly before the last image is gone.
    const setTrailing = (on) => {
      if (on === trailing) return;
      trailing = on;
      target.classList.toggle('is-trailing', on);
    };

    // Glide the next pooled image from one point to another, pop it in, then let it shrink away.
    const fling = (from, to) => {
      const el = nodes[index % nodes.length];
      index += 1;
      el.style.zIndex = String((z += 1));
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const tilt = (Math.random() - 0.5) * 16;

      // One call with per-value timing: a separate fade-out call would cancel the fade-in.
      animate(
        el,
        {
          x: [from.x - w / 2, to.x - w / 2],
          y: [from.y - h / 2, to.y - h / 2],
          rotate: [tilt * 2, tilt],
          scale: [0.55, 1, 1, 0.3],
          opacity: [0, 1, 1, 0],
        },
        {
          duration: 0.9,
          ease: easeExpo,
          scale: { duration: 1.7, times: [0, 0.3, 0.5, 1], ease: [easeExpo, 'linear', easeInOut] },
          opacity: { duration: 1.7, times: [0, 0.2, 0.5, 1], ease: [easeExpo, 'linear', easeInOut] },
        },
      );

      setTrailing(true);
      clearTimeout(idle);
      idle = setTimeout(() => setTrailing(false), 1300);
    };

    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || !api.current.enabled) {
        last = null;
        return;
      }
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!last) {
        last = { x, y };
        return;
      }
      if (Math.hypot(x - last.x, y - last.y) < threshold) return;
      fling(last, { x, y });
      last = { x, y };
    };

    const onLeave = () => {
      last = null;
    };

    target.addEventListener('pointermove', onMove, { passive: true });
    target.addEventListener('pointerleave', onLeave);
    return () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      clearTimeout(idle);
      target.classList.remove('is-trailing');
    };
  }, [targetRef, threshold]);

  return (
    // `isolate` makes this layer its own stacking context, so the ever-rising z-index of
    // the images stays inside it and the trail never climbs above the hero content.
    <div ref={layer} aria-hidden="true" className="pointer-events-none absolute inset-0 isolate overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          decoding="async"
          className="absolute left-0 top-0 w-[clamp(9rem,14vw,15rem)] rounded-2xl object-cover opacity-0 shadow-[0_24px_60px_-20px_rgb(20_33_31/0.45)]"
        />
      ))}
    </div>
  );
}
