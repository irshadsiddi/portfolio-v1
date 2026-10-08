export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-heading self-start">
      <h2 className="ui-section-heading">{children}</h2>
    </div>
  );
}
