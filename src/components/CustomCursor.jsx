import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';

const INTERACTIVE = '[data-cursor], a, button, [role="button"], select, label, input, textarea';

export default function CustomCursor() {
  const touch = useIsTouchDevice();
  return touch ? null : <Cursor />;
}

/**
 * Dot follows the pointer 1:1; the ring lerps behind it.
 * Position is written straight to the DOM every frame (no React re-renders).
 * State (link / view / drag / text) is read from hovered elements via event delegation:
 *   data-cursor="view" | "drag"   data-cursor-label="Open" (optional custom label)
 */
function Cursor() {
  const root = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const bubble = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('has-custom-cursor');

    const mouse = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let visible = false;

    const setState = (state) => {
      if (root.current.dataset.state !== state) root.current.dataset.state = state;
    };

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        lag.x = mouse.x;
        lag.y = mouse.y;
        root.current.dataset.hidden = 'false';
      }
      dot.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    };

    const onOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE);
      if (!el) return setState('default');
      const mode = el.dataset.cursor;
      if (mode) {
        label.current.textContent = el.dataset.cursorLabel || (mode === 'drag' ? 'Drag' : 'View');
        setState(mode);
      } else if (el.matches('input, textarea')) {
        setState('text');
      } else {
        setState('link');
      }
    };

    const onLeave = () => {
      visible = false;
      root.current.dataset.hidden = 'true';
    };

    // Frame-rate independent lerp so the ring feels identical at 60Hz and 120Hz.
    const tick = () => {
      const k = 1 - Math.pow(1 - 0.18, gsap.ticker.deltaRatio());
      lag.x += (mouse.x - lag.x) * k;
      lag.y += (mouse.y - lag.y) * k;
      const t = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      ring.current.style.transform = t;
      bubble.current.style.transform = t;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    html.addEventListener('mouseleave', onLeave);
    gsap.ticker.add(tick);

    return () => {
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      html.removeEventListener('mouseleave', onLeave);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-state="default"
      data-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300"
    >
      <div ref={ring} className="fixed left-0 top-0 will-change-transform">
        <div className="cursor-ring-inner size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/40" />
      </div>
      <div ref={dot} className="fixed left-0 top-0 will-change-transform">
        <div className="cursor-dot-inner size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </div>
      <div ref={bubble} className="fixed left-0 top-0 will-change-transform">
        <div className="cursor-label-inner grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-teal text-xs font-semibold uppercase tracking-[0.2em] text-paper shadow-lg shadow-teal/20">
          <span ref={label}>View</span>
        </div>
      </div>
    </div>
  );
}
