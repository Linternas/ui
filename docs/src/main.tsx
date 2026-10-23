import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import ExperimentalPlayground from "./ExperimentalPlayground";
import { uiCatalog, playgroundExperiments } from "../../src/system/ui-catalog";
import UiCatalog from "./UiCatalog";
import { usePathname } from "./routing";
import "../../system.css";
import "../../styles.css";
import "./site.css";
function App() {
  const path = usePathname();
  const previous = useRef(path);
  const id =
    path === "/"
      ? "foundations"
      : decodeURIComponent(path.replace(/^\//, "").replace(/\/$/, ""));
  const experiment =
    path.replace(/\/$/, "") === "/playground"
      ? playgroundExperiments[0]
      : playgroundExperiments.find((e) => e.path === path.replace(/\/$/, ""));
  const item = uiCatalog.find((item) => item.id === id);
  useEffect(() => {
    document.title = experiment
      ? `${experiment.name} — Playground — Mingu UI`
      : item
        ? `${item.name} — Mingu UI`
        : "Page not found — Mingu UI";
    if (previous.current !== path) {
      window.scrollTo(0, 0);
      const heading = document.querySelector("h1");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      previous.current = path;
    }
  }, [path, item, experiment]);
  return experiment ? (
    <ExperimentalPlayground id={experiment.id} />
  ) : item ? (
    <UiCatalog selected={item.id} />
  ) : (
    <main className="docs-not-found">
      <h1>Page not found</h1>
      <a href="/">Back to Mingu UI</a>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
