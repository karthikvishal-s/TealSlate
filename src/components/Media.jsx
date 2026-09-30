/**
 * Image with a gradient placeholder fallback.
 * Pass `image` (imported asset or /public path) to show a real image; otherwise
 * `gradient` renders a colourful animated placeholder.
 */
export default function Media({ image, gradient, alt = '', label, className = '' }) {
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`size-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : 'true'}
      className={`relative size-full overflow-hidden ${className}`}
      style={{ background: gradient }}
    >
      {/* Slow rotating light sweep so placeholders feel alive */}
      <div
        aria-hidden="true"
        className="hue-drift absolute -inset-1/2 opacity-50 mix-blend-soft-light"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0 25%, rgba(255,255,255,0.55) 35%, transparent 50% 75%, rgba(255,255,255,0.35) 85%, transparent 100%)',
        }}
      />
      {label && (
        <span className="absolute bottom-4 left-4 font-display text-lg font-bold tracking-tight text-white/90 mix-blend-overlay md:text-2xl">
          {label}
        </span>
      )}
    </div>
  );
}
