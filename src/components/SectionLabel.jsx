/** Small label above a section heading. Used sparingly (Hero, About, Work, Contact only). */
export default function SectionLabel({ children, className = '', ...rest }) {
  return (
    <p {...rest} className={`text-xs font-medium uppercase tracking-[0.28em] text-muted ${className}`}>
      {children}
    </p>
  );
}
