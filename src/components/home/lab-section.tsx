import { labItems } from "@/constants/lab";
import { SectionTitle } from "./section-title";
import { ArrowUpRight } from "lucide-react";
export function LabSection() {
  return (
    <section id="writing" data-reveal className="content-section page-width ui-editorial-section">
      <SectionTitle>Community &amp; Coding</SectionTitle>
      <ul className="lab-feed m-0 min-w-0 list-none border-t border-solid border-border p-0">
        {labItems.map((item) => (
          <li key={item.title}>
            <a href={item.href} target="_blank" rel="noreferrer" className="lab-row ui-lab-row">
              <span className={`lab-kind ui-lab-kind lab-${item.kind.toLowerCase()}`}>
                {item.kind}
              </span>
              <span className={`lab-body ui-lab-body`}>
                <b>{item.title}</b>
                <small>{item.note}</small>
              </span>
              <span className="lab-date ui-lab-date">{item.date}</span>
              <ArrowUpRight size={14} className="lab-arrow ui-lab-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
