import DocsRoot from "../docs/src/Root";
import MotionPolicyFixture from "./motion-policy";
import WorkflowFixture from "./workflow";
import CreativeFixture from "./creative";
import DocsApp from "../docs/src/App";
import MorphConsumer from "./morph-consumer";
import UiCatalog from "../docs/src/UiCatalog";
import AllPreview from "../docs/src/AllPreview";
import ComponentGallery from "../docs/src/ComponentGallery";
import { getNewestEntries, uiCatalog } from "../src/system/ui-catalog";
import CollectionPreview from "../docs/src/CollectionPreview";
import { DesignSystemProvider } from "../src/system/base";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { CodeBlock, RailToc, ScrollProgress } from "../src";
import ExperimentalFixture from "./experimental";
import RefinementFixture from "./refinement";
import MobileFixture from "./mobile";
import PlaygroundFixture from "./playground";
import StudioFixture from "./studio";
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
  new URLSearchParams(location.search).has("catalog-motion") ? (
    <DocsRoot />
  ) : location.pathname === "/native" ||
    location.pathname === "/docs" ||
    location.pathname.startsWith("/docs/") ||
    new URLSearchParams(location.search).has("landing") ? (
    <DocsApp />
  ) : new URLSearchParams(location.search).has("motion-policy") ? (
    <MotionPolicyFixture />
  ) : new URLSearchParams(location.search).has("workflow-form") ? (
    <WorkflowFixture />
  ) : new URLSearchParams(location.search).has("creative-form") ? (
    <CreativeFixture />
  ) : new URLSearchParams(location.search).has("morph-consumer") ? (
    <MorphConsumer />
  ) : new URLSearchParams(location.search).has("catalog-shell") ? (
    <UiCatalog
      selected={new URLSearchParams(location.search).get("selected") || "all"}
    />
  ) : new URLSearchParams(location.search).has("all-gallery") ? (
    <DesignSystemProvider
      theme={
        new URLSearchParams(location.search).get("theme") === "dark"
          ? "dark"
          : "light"
      }
      accent="neutral"
    >
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
        <AllPreview />
      </main>
    </DesignSystemProvider>
  ) : new URLSearchParams(location.search).has("component-gallery") ? (
    <DesignSystemProvider
      theme={
        new URLSearchParams(location.search).get("theme") === "dark"
          ? "dark"
          : "light"
      }
      accent="neutral"
    >
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
        <ComponentGallery
          entries={(new URLSearchParams(location.search).has("ids")
            ? uiCatalog.filter(
                (entry) =>
                  entry.kind === "core" || entry.kind === "interaction",
              )
            : getNewestEntries(uiCatalog, Date.parse("2026-10-23T12:00:00Z"))
          ).filter(
            (entry) =>
              !new URLSearchParams(location.search).get("ids") ||
              new URLSearchParams(location.search)
                .get("ids")!
                .split(",")
                .includes(entry.id),
          )}
        />
      </main>
    </DesignSystemProvider>
  ) : new URLSearchParams(location.search).has("collection") ? (
    <DesignSystemProvider
      theme={
        new URLSearchParams(location.search).get("theme") === "dark"
          ? "dark"
          : "light"
      }
      accent="neutral"
    >
      <main style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
        <CollectionPreview
          id={new URLSearchParams(location.search).get("id") || "sticker-peel"}
        />
      </main>
    </DesignSystemProvider>
  ) : location.search.includes("experimental") ? (
    <ExperimentalFixture />
  ) : location.search.includes("refinement") ? (
    <RefinementFixture />
  ) : location.search.includes("mobile") ? (
    <MobileFixture />
  ) : location.search.includes("playground") ? (
    <PlaygroundFixture />
  ) : location.search.includes("studio") ? (
    <StudioFixture />
  ) : location.search.includes("everyday") ? (
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
