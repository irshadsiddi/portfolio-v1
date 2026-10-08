import { recognitionItems } from "@/constants/lab";
import { SectionTitle } from "./section-title";
export function RecognitionSection() {
  return (
    <section
      id="recognition"
      data-reveal
      className="content-section page-width ui-editorial-section"
    >
      <SectionTitle>Recognition</SectionTitle>
      <div className="recognition-list ui-recognition-list">
        {recognitionItems.map((item) => (
          <p key={item.label}>
            <span>{item.label}</span>
            {item.value}
          </p>
        ))}
      </div>
    </section>
  );
}
