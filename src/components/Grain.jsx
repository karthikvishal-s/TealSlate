/** Fixed film-grain overlay across the whole page. */
export default function Grain() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="grain" />
    </div>
  );
}
