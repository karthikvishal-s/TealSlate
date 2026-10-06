import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { springSnappy } from '../lib/motion';
import { useLenis } from '../hooks/useLenis';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { process } from '../data/process';
import SplitTextReveal from '../components/SplitTextReveal';
import DevelopImage from '../components/DevelopImage';

/**
 * The process as a trail map. A winding route crosses faint contour lines; scrolling draws
 * the route and walks a marker along it, and each stop lights up as the marker reaches it.
 *
 * Landscape screens 1024px+: the section pins; one card (bottom-left) shows the latest
 * stop, and hovering a stop previews it instantly. Clicking a stop scrolls to it. The route
 * and contours drift apart with the pointer, so the map reads as layered terrain.
 * Phones and portrait tablets: the steps flow as a normal column and the route winds down a
 * rail beside them, drawn from the cards' measured positions (so it never overlaps the text,
 * whatever the copy length). No pin; the marker follows the reading line.
 *
 * Life on the map: each stop has a location print that pops in and develops when the marker
 * arrives, the next stop pulses like a beacon, the marker points the way it's heading, and
 * the terrain drifts slowly (loops only run while the section is on screen).
 *
 * Everything that runs per frame is a transform or the route's dash offset; React only
 * re-renders when a stop is reached (4 times per pass).
 */

// The landscape map (viewBox units). Phones and portrait tablets use the measured rail.
const MAP = {
  w: 1200,
  h: 520,
  route: 'M 70 140 C 150 140, 190 270, 300 260 S 400 160, 470 175 S 560 330, 650 380 S 800 450, 860 360 S 940 150, 1030 150 S 1160 230, 1140 330',
  stops: [0.03, 0.33, 0.64, 0.97],
  // Where each stop's print sits relative to its pin (viewBox units), and its tilt.
  prints: [
    { dx: 30, dy: -112, rot: -5 },
    { dx: -10, dy: -118, rot: 4 },
    { dx: -5, dy: -175, rot: -4 },
    { dx: -96, dy: 118, rot: 5 },
  ],
  contours: [
    { cx: 250, cy: 400, r: [[210, 95], [150, 66], [90, 38]], rot: -8 },
    { cx: 900, cy: 230, r: [[250, 125], [180, 88], [110, 52], [45, 20]], rot: 12 },
  ],
};
const HOLD = 0.12; // extra pinned scroll after the last stop, so its card can be read
// The map needs width and a landscape frame; everything else gets the rail.
const MAP_QUERY = '(min-width: 1024px) and (min-aspect-ratio: 5/4)';
const RAIL_W = 80; // px
const RAIL_X = [24, 56]; // pins alternate between these, so the route winds

/** The rail route: down through each pin (alternating sides), trailing off below the last. */
function railPath(pins, height) {
  const [first] = pins;
  let d = `M ${first.x} 0 L ${first.x} ${first.y}`;
  for (let i = 1; i < pins.length; i++) {
    const a = pins[i - 1];
    const b = pins[i];
    const dy = b.y - a.y;
    d += ` C ${a.x} ${a.y + dy / 2}, ${b.x} ${b.y - dy / 2}, ${b.x} ${b.y}`;
  }
  const last = pins[pins.length - 1];
  const dy = height - last.y;
  d += ` C ${last.x} ${last.y + dy / 2}, ${RAIL_W / 2} ${height - dy / 2}, ${RAIL_W / 2} ${height}`;
  return d;
}

/** Fraction of the route's length where it reaches height `y` (the rail only ever runs downward). */
function fractionAtY(path, y) {
  const total = path.getTotalLength();
  let lo = 0;
  let hi = total;
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }
  return hi / total;
}
const pad = (i) => String(i + 1).padStart(2, '0');

/** Stop positions along the route, as % of the map (the route is static, so measure once). */
function useStopPoints(route, map) {
  const [points, setPoints] = useState(null);
  useLayoutEffect(() => {
    const path = route.current;
    if (!path || !map) return;
    const len = path.getTotalLength();
    setPoints(
      map.stops.map((t) => {
        const pt = path.getPointAtLength(len * t);
        return { x: (pt.x / map.w) * 100, y: (pt.y / map.h) * 100 };
      }),
    );
  }, [route, map]);
  return points;
}

function Contours({ map }) {
  return (
    <div className="contour-drift absolute inset-0">
      <svg viewBox={`0 0 ${map.w} ${map.h}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {map.contours.map((hill) =>
          hill.r.map(([rx, ry]) => (
            <ellipse
              key={`${hill.cx}-${rx}`}
              cx={hill.cx}
              cy={hill.cy}
              rx={rx}
              ry={ry}
              transform={`rotate(${hill.rot} ${hill.cx} ${hill.cy})`}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="1.25"
            />
          )),
        )}
      </svg>
    </div>
  );
}

function Route({ map, routeRef, trailRef, markerRef }) {
  return (
    <svg viewBox={`0 0 ${map.w} ${map.h}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
      {/* The planned route, dotted */}
      <path d={map.route} fill="none" stroke="var(--color-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 11" />
      {/* The travelled route, drawn by scroll: a soft wide trail under a crisp line */}
      <path ref={trailRef} d={map.route} fill="none" stroke="var(--color-teal)" strokeOpacity="0.15" strokeWidth="12" strokeLinecap="round" />
      <path ref={routeRef} d={map.route} fill="none" stroke="var(--color-teal)" strokeWidth="4" strokeLinecap="round" />
      {/* Marker: the pointer turns with the route (autoRotate). The clear outer ring keeps the
          bounding box centred on the dot, so alignOrigin stays exact. */}
      <g ref={markerRef}>
        <circle r="18" fill="none" />
        <circle r="13" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" />
        <circle r="5.5" fill="var(--color-teal)" />
        <path d="M 15 -5 L 22 0 L 15 5 Z" fill="var(--color-ink)" />
      </g>
    </svg>
  );
}

/** A location print pinned near a stop: pops in and develops when the marker arrives. */
function Print({ step, pt, offset, map, reached }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: `${pt.x + (offset.dx / map.w) * 100}%`, top: `${pt.y + (offset.dy / map.h) * 100}%` }}
    >
      <div
        className="w-[min(9rem,11vw)] rounded-md bg-paper p-1.5 pb-5 shadow-[0_18px_40px_-18px_rgb(20_33_31/0.45)] transition-[transform,opacity] duration-[450ms] ease-expo"
        style={{
          opacity: reached ? 1 : 0,
          transform: `translate(-50%, -50%) rotate(${reached ? offset.rot : offset.rot * -2}deg) scale(${reached ? 1 : 0.6})`,
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink">
          <DevelopImage src={step.image} mode="state" developed={reached} className="absolute inset-0" />
        </div>
      </div>
    </div>
  );
}

function StopPin({ index, step, onEnter, onLeave, onPick }) {
  return (
    <button
      type="button"
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter(index)}
      onPointerLeave={onLeave}
      onFocus={() => onEnter(index)}
      onBlur={onLeave}
      onClick={() => onPick(index)}
      aria-label={`Step ${index + 1}: ${step.title}, ${step.duration}`}
      className="group/pin relative grid size-11 place-items-center rounded-full"
    >
      <span aria-hidden="true" className="stop-ping absolute inset-0 rounded-full border-2 border-teal opacity-0" />
      <span aria-hidden="true" className="stop-beacon absolute inset-0 rounded-full bg-teal/25 opacity-0" />
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-full border-2 border-ink bg-paper font-display text-sm font-bold transition-[transform,background-color,border-color,color] duration-150 ease-expo group-hover/pin:scale-110 group-focus-visible/pin:scale-110 group-[.is-reached]:border-teal group-[.is-reached]:bg-teal group-[.is-reached]:text-paper"
      >
        {pad(index)}
      </span>
    </button>
  );
}

export default function Process() {
  const root = useRef(null);
  const route = useRef(null);
  const trail = useRef(null);
  const marker = useRef(null);
  const stage = useRef(null);
  const trigger = useRef(null);
  const reachedRef = useRef(0);
  const stopsRef = useRef(MAP.stops);
  const desktop = useMediaQuery(MAP_QUERY);
  const reduced = useReducedMotion();
  const touch = useIsTouchDevice();
  const pinned = desktop && !reduced;
  const map = desktop ? MAP : null;
  const points = useStopPoints(route, map);
  const [rail, setRail] = useState(null);
  const { scrollTo } = useLenis();
  const [current, setCurrent] = useState(0);
  const [reached, setReached] = useState(0);
  const [preview, setPreview] = useState(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Desktop: fit the map into the space under the header, keeping its proportions.
  useLayoutEffect(() => {
    if (!desktop) return undefined;
    const el = stage.current;
    const fit = () => {
      const s = Math.min(el.clientWidth / map.w, el.clientHeight / map.h);
      setBox({ w: Math.floor(map.w * s), h: Math.floor(map.h * s) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktop, map]);

  // Rail: pins sit beside each card's title; the route is rebuilt whenever the cards reflow.
  useLayoutEffect(() => {
    if (desktop) return undefined;
    const el = stage.current;
    const measure = () => {
      const cards = [...el.querySelectorAll('[data-rail-card]')];
      if (!cards.length) return;
      const pins = cards.map((c, i) => ({ x: RAIL_X[i % 2], y: c.offsetTop + 22 }));
      const h = el.offsetHeight;
      const d = railPath(pins, h);
      setRail((prev) => (prev?.d === d ? prev : { d, h, pins }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktop]);

  // Pointer parallax: route layer toward the pointer, contours away from it.
  const nx = useSpring(0, springSnappy);
  const ny = useSpring(0, springSnappy);
  const routeX = useSpring(0, springSnappy);
  const routeY = useSpring(0, springSnappy);
  const onPointerMove = (e) => {
    if (!desktop || touch || reduced || e.pointerType !== 'mouse') return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    routeX.set(x * 20);
    routeY.set(y * 20);
    nx.set(x * -44);
    ny.set(y * -44);
  };

  // Update reached stops and the card only when the count changes (never per frame).
  const reach = (fraction) => {
    const count = stopsRef.current.filter((t) => fraction >= t - 0.005).length;
    if (count === reachedRef.current) return;
    reachedRef.current = count;
    setReached(count);
    setCurrent(Math.max(0, count - 1));
  };

  useGSAP(
    () => {
      // Loops (beacon, terrain drift) only run while the map is on screen.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        toggleClass: { targets: root.current, className: 'is-live' },
      });

      const path = route.current;
      if (!path || (!desktop && !rail)) return undefined;
      // Where each stop sits along the route (fixed on the map, measured on the rail).
      stopsRef.current = desktop ? MAP.stops : rail.pins.map((pin) => fractionAtY(path, pin.y));
      const len = path.getTotalLength();
      const paths = [path, trail.current];
      paths.forEach((p) => {
        p.style.strokeDasharray = `${len}`;
      });
      reachedRef.current = 0;

      if (reduced) {
        // Whole route drawn, marker at the end, every stop reached.
        paths.forEach((p) => {
          p.style.strokeDashoffset = '0';
        });
        gsap.set(marker.current, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 1, end: 1 } });
        reach(1);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: pinned
          ? { trigger: root.current, start: 'top top', end: '+=220%', pin: true, scrub: true, anticipatePin: 1 }
          : { trigger: stage.current, start: 'top 70%', end: 'bottom 70%', scrub: true },
      });
      tl.fromTo(paths, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1 }, 0).to(
        marker.current,
        { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 1 },
        0,
      );
      if (pinned) tl.to({}, { duration: HOLD });
      tl.eventCallback('onUpdate', () => reach(Math.min(1, tl.time())));
      trigger.current = tl.scrollTrigger;
      reach(0);
      return () => {
        trigger.current = null;
      };
    },
    { scope: root, dependencies: [desktop, reduced, rail?.d] },
  );

  // Click a stop: on the map, scroll to the moment the marker reaches it; on the rail, glide
  // its card up to the reading line.
  const pick = (i) => {
    if (!desktop) {
      const card = stage.current?.querySelectorAll('[data-rail-card]')[i];
      if (card) scrollTo(card, { offset: -window.innerHeight * 0.3 });
      return;
    }
    const st = trigger.current;
    if (!pinned || !st) {
      setCurrent(i);
      return;
    }
    const at = map.stops[i] / (1 + HOLD);
    scrollTo(st.start + (st.end - st.start) * at + 2);
  };

  const shown = preview ?? current;
  const step = process[shown];

  const stops = points?.map((pt, i) => (
    <div
      key={process[i].title}
      data-stop
      className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 ${i < reached ? 'is-reached' : ''} ${i === reached ? 'is-next' : ''}`}
      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
    >
      <StopPin index={i} step={process[i]} onEnter={setPreview} onLeave={() => setPreview(null)} onPick={pick} />
      {desktop && (
        // Label beside the pin (to the left for the last stop, which sits at the right edge)
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap transition-opacity duration-150 ${
            pt.x > 85 ? 'right-full mr-3 text-right' : 'left-full ml-3'
          } ${shown === i ? 'opacity-100' : 'opacity-60 group-[.is-reached]:opacity-90'}`}
        >
          <span className="block font-display text-base font-bold leading-tight">{process[i].title}</span>
          <span className="block text-xs text-muted">{process[i].duration}</span>
        </span>
      )}
    </div>
  ));

  const prints =
    desktop &&
    points?.map((pt, i) => (
      <Print key={process[i].title} step={process[i]} pt={pt} offset={map.prints[i]} map={map} reached={i < reached} />
    ));

  return (
    <section
      id="process"
      ref={root}
      aria-labelledby="process-title"
      onPointerMove={onPointerMove}
      className={`relative ${pinned ? 'flex h-svh flex-col pb-10 pt-28' : 'py-28 md:py-40'}`}
    >
      <header className="gutter">
        <SplitTextReveal id="process-title" className="font-display text-display font-bold">
          From first call to <span className="text-teal">full launch</span>
        </SplitTextReveal>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          A clear, collaborative process with no black boxes. You always know what&apos;s happening, what&apos;s next,
          and why.
        </p>
      </header>

      {desktop ? (
        <div className={`gutter min-h-0 ${pinned ? 'mt-6 flex-1' : 'mt-12 h-[min(36rem,70svh)]'}`}>
          <div ref={stage} className="relative size-full">
            <div className="relative mx-auto" style={{ width: box.w, height: box.h }}>
              <motion.div className="absolute inset-0" style={{ x: nx, y: ny }}>
                <Contours map={map} />
              </motion.div>
              <motion.div className="absolute inset-0" style={{ x: routeX, y: routeY }}>
                {prints}
                <Route map={map} routeRef={route} trailRef={trail} markerRef={marker} />
                {stops}
              </motion.div>

              {/* The current (or hovered) step */}
              <div aria-live="polite" className="absolute bottom-0 left-0 w-[min(24rem,34%)]">
                <div key={shown} className="card-in rounded-3xl border border-line bg-card/90 p-6 xl:p-7">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    <span className="font-bold text-teal">{pad(shown)}</span>
                    <span className="mx-2" aria-hidden="true">/</span>
                    {step.duration}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted xl:text-base">{step.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="gutter mt-12 md:mt-16">
          <div ref={stage} className="relative mx-auto max-w-3xl">
            {/* The rail: route, trail and marker in px coordinates of the column */}
            <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={RAIL_W} height={rail?.h ?? 0}>
              <path d={rail?.d} fill="none" stroke="var(--color-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 11" />
              <path ref={trail} d={rail?.d} fill="none" stroke="var(--color-teal)" strokeOpacity="0.15" strokeWidth="12" strokeLinecap="round" />
              <path ref={route} d={rail?.d} fill="none" stroke="var(--color-teal)" strokeWidth="4" strokeLinecap="round" />
              <g ref={marker}>
                <circle r="18" fill="none" />
                <circle r="13" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" />
                <circle r="5.5" fill="var(--color-teal)" />
                <path d="M 15 -5 L 22 0 L 15 5 Z" fill="var(--color-ink)" />
              </g>
            </svg>
            {rail?.pins.map((pin, i) => (
              <div
                key={process[i].title}
                data-stop
                className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 ${i < reached ? 'is-reached' : ''} ${i === reached ? 'is-next' : ''}`}
                style={{ left: pin.x, top: pin.y }}
              >
                <StopPin index={i} step={process[i]} onEnter={() => {}} onLeave={() => {}} onPick={pick} />
              </div>
            ))}

            <ol className="flex flex-col gap-14 pl-24 md:gap-20 md:pl-32">
              {process.map((s, i) => (
                <li
                  key={s.title}
                  data-rail-card
                  className={`transition-opacity duration-300 md:grid md:grid-cols-[minmax(0,17rem)_1fr] md:items-start md:gap-8 ${i < reached ? 'opacity-100' : 'opacity-45'}`}
                >
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-ink md:mb-0 md:aspect-[4/3]">
                    <DevelopImage src={s.image} mode="state" developed={i < reached} className="absolute inset-0" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      <span className="font-bold text-teal">{pad(i)}</span>
                      <span className="mx-2" aria-hidden="true">/</span>
                      {s.duration}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{s.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
