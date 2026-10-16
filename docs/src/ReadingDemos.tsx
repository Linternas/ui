"use client";
import { useRef } from "react";
import {
  RailToc,
  ScrollProgress,
  type ReadingSection,
} from "@mingu/interaction-ui";
const sections: ReadingSection[] = [
  { id: "preview-intro", label: "A place to begin" },
  { id: "preview-rhythm", label: "Finding a rhythm", depth: 1 },
  { id: "preview-detail", label: "Small details", depth: 1 },
  { id: "preview-end", label: "Room to finish" },
];
export default function ReadingDemos({ kind }: { kind: "rail" | "progress" }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`studio-reading studio-reading-${kind}`}>
      <div
        ref={ref}
        className="studio-reader"
        tabIndex={0}
        role="region"
        aria-label="Scrollable reading preview"
      >
        {sections.map((section, index) => (
          <section key={section.id} id={section.id}>
            <small>0{index + 1} / FIELD NOTES</small>
            <h3>{section.label}</h3>
            <p>
              좋은 인터페이스는 읽기를 방해하지 않습니다. 지금 어디쯤 읽고
              있는지, 다음에는 무엇이 나오는지 조용히 알려줍니다.
            </p>
            <p>
              천천히 스크롤하거나 목차의 제목을 눌러 보세요. 작은 도구들이 읽는
              시간을 조금 더 편안하게 만듭니다.
            </p>
          </section>
        ))}
      </div>
      {kind === "rail" ? (
        <aside>
          <RailToc sections={sections} containerRef={ref} offset={24} />
        </aside>
      ) : (
        <div className="studio-reading-dock">
          <ScrollProgress sections={sections} containerRef={ref} offset={24} />
        </div>
      )}
    </div>
  );
}
