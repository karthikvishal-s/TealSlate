/**
 * Rolling-digit number. Each digit is a vertical strip of 0–9 cells clipped to a
 * single cell, so animating it is transform-only (no per-frame text writes).
 *
 * Renders at its final value. To animate, tween every `[data-odo-strip]` from
 * yPercent 0 to its `data-to` (see Stats.jsx). Digits further right spin through
 * extra loops, so the number settles left to right like a mechanical counter.
 */
export default function Odometer({ value, className = '' }) {
  const digits = String(value).split('');

  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      {digits.map((digit, i) => {
        const loops = Math.min(i, 2);
        const cells = (loops + 1) * 10;
        const to = (-(loops * 10 + Number(digit)) / cells) * 100;
        return (
          <span key={i} aria-hidden="true" className="inline-block h-[1em] overflow-hidden">
            <span data-odo-strip data-to={to} className="flex flex-col" style={{ transform: `translateY(${to}%)` }}>
              {Array.from({ length: cells }, (_, c) => (
                <span key={c} className="block h-[1em] leading-none">
                  {c % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
