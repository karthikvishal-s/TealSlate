/** Small eyebrow label used above section headings. */
export default function SectionLabel({ index, children, className = '' }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-muted ${className}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-light" />
      {index && <span className="text-teal-light">{index}</span>}
      <span>{children}</span>
    </p>
  );
}
