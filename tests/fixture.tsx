import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { CodeBlock, RailToc, ScrollProgress } from "../src";
import EverydayFixture from "./everyday";
import GestureFixture from "./gestures";
import ExplorationFixture from "./explorations";
import ControlFixture from "./controls";
import MicroFixture from "./micro-interactions";
import ExpandedSystemFixture from "./system-expanded";
import SystemFixture from "./system";
import InteractionFixture from "./interactions";

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "detail", label: "Details", depth: 1 },
  { id: "finish", label: "Finish" },
];
function Fixture() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <main
      style={{ maxWidth: 600, margin: "30px auto", fontFamily: "system-ui" }}
    >
      <CodeBlock
        filename="safe.ts"
        language="typescript"
        code={
          'const source = "</code><img src=x onerror=alert(1)>";\n// second line\nconst value = 42;'
        }
        highlightLines={[3]}
      />
      <CodeBlock
        filename="unknown.txt"
        language="unsupported-language"
        code={"<script>globalThis.compromised = true</script>"}
      />
      <RailToc sections={sections} containerRef={ref} offset={20} />
      <div
        ref={ref}
        style={{ height: 240, overflow: "auto", border: "1px solid gray" }}
        tabIndex={0}
        aria-label="reading area"
      >
        {sections.map((section) => (
          <section
            id={section.id}
            key={section.id}
            style={{ minHeight: 300, padding: 20, boxSizing: "border-box" }}
          >
            <h2>{section.label}</h2>
            <p>Readable content.</p>
          </section>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: 250 }}>
        <ScrollProgress sections={sections} containerRef={ref} offset={20} />
      </div>
      <button type="button">Outside</button>
      <RailToc sections={[]} />
      <ScrollProgress sections={[]} />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  location.search.includes("everyday") ? (
    <EverydayFixture />
  ) : location.search.includes("gestures") ? (
    <GestureFixture />
  ) : location.search.includes("explorations") ? (
    <ExplorationFixture />
  ) : location.search.includes("controls") ? (
    <ControlFixture />
  ) : location.search.includes("micro") ? (
    <MicroFixture />
  ) : location.search.includes("expanded") ? (
    <ExpandedSystemFixture />
  ) : location.search.includes("system") ? (
    <SystemFixture />
  ) : location.search.includes("interactions") ? (
    <InteractionFixture />
  ) : (
    <Fixture />
  ),
);
