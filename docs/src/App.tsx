import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
const ExperimentalPlayground = lazy(() => import("./ExperimentalPlayground"));
import { uiCatalog, playgroundExperiments } from "../../src/system/ui-catalog";
const UiCatalog = lazy(() => import("./UiCatalog"));
import LandingPage from "./LandingPage";
import { usePathname } from "./routing";
export default function App() {
  const path = usePathname();
  const previous = useRef(path);
  const route = path.replace(/\/$/, "") || "/";
  const inDocs = route === "/docs" || route.startsWith("/docs/");
  const id =
    route === "/docs" || route === "/"
      ? "foundations"
      : decodeURIComponent(route.replace(inDocs ? /^\/docs\// : /^\//, ""));
  const experiment =
    path.replace(/\/$/, "") === "/playground"
      ? playgroundExperiments[0]
      : playgroundExperiments.find((e) => e.path === path.replace(/\/$/, ""));
  const item = uiCatalog.find(
    (item) =>
      item.id === id && (!inDocs || !["all", "playground"].includes(id)),
  );
  useEffect(() => {
    document.title =
      path === "/"
        ? "Mingu UI — Built to feel right."
        : experiment
          ? `${experiment.name} — Playground — Mingu UI`
          : item
            ? `${item.name} — Mingu UI`
            : "Page not found — Mingu UI";
    if (previous.current !== path) {
      window.scrollTo(0, 0);
      const focusHeading = () => {
        const heading = Array.from(document.querySelectorAll("h1")).find(
          (element) => element.getClientRects().length > 0,
        );
        if (!heading) return false;
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        return true;
      };
      const observer = new MutationObserver(() => {
        if (focusHeading()) observer.disconnect();
      });
      if (!focusHeading())
        observer.observe(document.getElementById("root")!, {
          childList: true,
          subtree: true,
        });
      previous.current = path;
      return () => observer.disconnect();
    }
  }, [path, item, experiment]);
  return (
    <RouteBoundary key={path}>
      <Suspense
        fallback={
          <div className="docs-route-loading" role="status">
            화면을 불러오고 있어요…
          </div>
        }
      >
        {path === "/" ? (
          <LandingPage />
        ) : experiment ? (
          <ExperimentalPlayground id={experiment.id} />
        ) : item ? (
          <UiCatalog selected={item.id} />
        ) : (
          <main className="docs-not-found">
            <h1>Page not found</h1>
            <a href="/">Back to Mingu UI</a>
          </main>
        )}
      </Suspense>
    </RouteBoundary>
  );
}

class RouteBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="docs-route-loading" role="alert">
        <h1>화면을 불러오지 못했어요.</h1>
        <p>새로고침해서 다시 열어주세요.</p>
        <button type="button" onClick={() => location.reload()}>
          새로고침
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
