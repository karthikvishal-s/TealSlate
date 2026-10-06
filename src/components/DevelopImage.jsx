import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * A photo that "develops": an undeveloped copy (soft focus, teal duotone) sits on top
 * of the sharp image and fades away.
 *
 * The undeveloped copy is baked once per photo: drawn onto a 32px canvas, tinted to a
 * teal duotone in JS, and used as a tiny image that the browser stretches smoothly (the
 * stretch *is* the blur). No CSS filters or blend modes, so it costs nothing per frame;
 * only its opacity ever animates.
 *
 * - mode="scroll": develops as its frame scrolls from the bottom of the viewport to 45%.
 * - mode="state":  follows `developed` (`inDuration` ms in, default 600; 250ms back).
 * - mode="manual": no transition; the caller drives `[data-develop-veil]` opacity itself
 *                  (e.g. scrubbed per frame by scroll).
 *
 * `className` sizes/positions the root; parallax and other transforms belong on the root
 * so the sharp photo and its undeveloped copy always move together.
 */

const BAKE_WIDTH = 32;
// Duotone ends: deep teal shadows to soft teal highlights.
const DARK = [9, 38, 35];
const LIGHT = [104, 190, 178];
const baked = new Map(); // src -> Promise<dataURL>

function bake(src) {
  if (!baked.has(src)) {
    baked.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          const w = BAKE_WIDTH;
          const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h);
          const px = data.data;
          for (let i = 0; i < px.length; i += 4) {
            // Luminance with a little extra contrast, mapped onto the duotone.
            const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
            const t = Math.min(1, Math.max(0, (l - 0.5) * 1.25 + 0.5));
            px[i] = DARK[0] + (LIGHT[0] - DARK[0]) * t;
            px[i + 1] = DARK[1] + (LIGHT[1] - DARK[1]) * t;
            px[i + 2] = DARK[2] + (LIGHT[2] - DARK[2]) * t;
          }
          ctx.putImageData(data, 0, 0);
          resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = src;
      }),
    );
  }
  return baked.get(src);
}

export default function DevelopImage({
  src,
  alt = '',
  mode = 'state',
  developed = true,
  inDuration = 600,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  ...rest
}) {
  const root = useRef(null);
  const veil = useRef(null);
  const reduced = useReducedMotion();
  const [veilSrc, setVeilSrc] = useState(null);

  useEffect(() => {
    if (reduced || !src) return undefined;
    let live = true;
    bake(src)
      .then((url) => live && setVeilSrc(url))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [src, reduced]);

  useGSAP(
    () => {
      if (mode !== 'scroll' || !veil.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          veil.current,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current.parentElement, start: 'top bottom', end: 'top 45%', scrub: true },
          },
        );
      });
    },
    { scope: root, dependencies: [mode, reduced] },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`} {...rest}>
      <img src={src} alt={alt} loading={loading} decoding="async" className={`size-full object-cover ${imgClassName}`} />
      {!reduced && (
        <div
          ref={veil}
          data-develop-veil
          aria-hidden="true"
          // Solid deep teal until the baked copy is ready, so it never flashes the sharp photo.
          className="pointer-events-none absolute inset-0 overflow-hidden bg-[rgb(9_38_35)] ease-expo"
          style={
            mode === 'state'
              ? {
                  opacity: developed ? 0 : 1,
                  transitionProperty: 'opacity',
                  transitionDuration: developed ? `${inDuration}ms` : '250ms',
                }
              : undefined
          }
        >
          {veilSrc && <img src={veilSrc} alt="" className={`size-full object-cover ${imgClassName}`} />}
        </div>
      )}
    </div>
  );
}
