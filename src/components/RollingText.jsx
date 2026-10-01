/**
 * Text that rolls up to a duplicate copy on hover (pure CSS transform).
 * Parent needs the `group` class.
 */
export default function RollingText({ children, className = '', accent = 'text-teal' }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <span className="inline-block transition-transform duration-400 ease-expo group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-0 top-full inline-block ${accent} transition-transform duration-400 ease-expo group-hover:-translate-y-full`}
      >
        {children}
      </span>
    </span>
  );
}
