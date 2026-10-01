import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { springSnap } from '../lib/motion';
import { testimonials } from '../data/testimonials';
import SectionLabel from '../components/SectionLabel';
import SplitTextReveal from '../components/SplitTextReveal';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function Testimonials() {
  const viewport = useRef(null);
  const track = useRef(null);
  const x = useMotionValue(0);
  const progress = useMotionValue(0);
  const [bounds, setBounds] = useState({ min: 0, step: 1 });
  const [index, setIndex] = useState(0);
  const count = testimonials.length;

  // Measure drag limits and the card "step" (card width + gap); re-measure on resize.
  useEffect(() => {
    const measure = () => {
      const card = track.current.firstElementChild;
      const gap = parseFloat(getComputedStyle(track.current).columnGap) || 0;
      const min = Math.min(0, viewport.current.offsetWidth - track.current.offsetWidth);
      setBounds({ min, step: card.offsetWidth + gap });
      if (x.get() < min) x.set(min);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [x]);

  useMotionValueEvent(x, 'change', (v) => {
    setIndex(clamp(Math.round(-v / bounds.step), 0, count - 1));
    progress.set(bounds.min ? v / bounds.min : 0);
  });

  const goTo = (i) => {
    const target = clamp(-clamp(i, 0, count - 1) * bounds.step, bounds.min, 0);
    animate(x, target, springSnap);
  };

  const atStart = index === 0;
  const atEnd = x.get() <= bounds.min + 1 || index === count - 1;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <section aria-labelledby="testimonials-title" className="overflow-hidden py-28 md:py-40">
      <div className="gutter mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="(05)">Kind words</SectionLabel>
          <SplitTextReveal id="testimonials-title" className="mt-6 font-display text-display font-bold">
            Clients who <span className="text-teal">stay</span>
          </SplitTextReveal>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={atStart}
            aria-label="Previous testimonial"
            className="grid size-14 place-items-center rounded-full border border-line transition-colors duration-500 hover:border-teal hover:bg-teal hover:text-paper disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={atEnd}
            aria-label="Next testimonial"
            className="grid size-14 place-items-center rounded-full border border-line transition-colors duration-500 hover:border-teal hover:bg-teal hover:text-paper disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials. Use left and right arrow keys to navigate."
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-cursor="drag"
        className="overflow-hidden"
      >
        <motion.ul
          ref={track}
          drag="x"
          dragConstraints={{ left: bounds.min, right: 0 }}
          dragElastic={0.12}
          // Snap momentum to the nearest card.
          dragTransition={{
            power: 0.35,
            timeConstant: 260,
            modifyTarget: (t) => clamp(Math.round(t / bounds.step) * bounds.step, bounds.min, 0),
          }}
          style={{ x }}
          className="gutter flex w-max select-none gap-5 md:gap-8"
        >
          {testimonials.map((t, i) => (
            <li
              key={t.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="flex min-h-[24rem] w-[min(86vw,34rem)] shrink-0 flex-col justify-between rounded-3xl border border-line bg-card p-7 md:min-h-[28rem] md:p-12"
            >
              <Quote aria-hidden="true" className="size-10 fill-teal/20 text-teal" />
              <blockquote className="mt-8 font-display text-xl font-medium leading-snug tracking-tight md:text-[1.7rem]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="mt-10 flex items-center gap-4 border-t border-line pt-6">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-teal/15 font-display text-sm font-bold text-teal"
                >
                  {t.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <span>
                  <cite className="block font-semibold not-italic">{t.name}</cite>
                  <span className="text-sm text-muted">
                    {t.role}, {t.company}
                  </span>
                </span>
              </footer>
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="gutter mt-10 flex items-center gap-6">
        <span className="font-display text-sm font-bold tabular-nums">
          {String(index + 1).padStart(2, '0')} <span className="text-muted">/ {String(count).padStart(2, '0')}</span>
        </span>
        <div aria-hidden="true" className="h-px flex-1 bg-line">
          <motion.div className="h-px origin-left bg-teal" style={{ scaleX: progress }} />
        </div>
      </div>
    </section>
  );
}
