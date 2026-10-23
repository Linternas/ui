import { useState, useEffect, useRef } from "react";
import {
  playgroundExperiments,
  type UiCatalogEntry,
} from "@mingu/interaction-ui/catalog";
import {
  Button,
  Dialog,
  EmptyState,
  SegmentedControl,
} from "@mingu/interaction-ui/system";
import Link from "./routing";
import DemoPreview from "./DemoPreview";
import SystemComponentDemo from "./SystemComponentDemo";
import type { ComponentId } from "./catalog";
import type { SystemComponentId } from "@mingu/interaction-ui/system";
import "./newest-preview.css";
const scenes = new Set<string>(playgroundExperiments.map((item) => item.id));
const workspaces = new Set([
  "page-transition",
  "sortable-grid",
  "sticky-scroll-story",
  "scroll-stack",
  "footer-reveal",
  "scroll-expand-media",
  "coverflow-carousel",
  "color-picker",
  "bezier-editor",
  "slash-command-editor",
  "chart-range-navigator",
  "live-code-sandbox",
  "calendar-board",
  "gantt-timeline",
  "kanban-board",
  "image-cropper",
  "prompt-composer",
  "tool-execution-panel",
  "plan-review",
  "approval-card",
  "artifact-panel",
  "voice-input",
  "streaming-terminal",
  "animated-filter-bar",
  "resizable-panels",
]);
function Preview({
  entry,
  compact = false,
}: {
  entry: UiCatalogEntry;
  compact?: boolean;
}) {
  return entry.kind === "interaction" ? (
    <DemoPreview id={entry.id as ComponentId} compact={compact} />
  ) : (
    <SystemComponentDemo id={entry.id as SystemComponentId} />
  );
}
// Keep the complete inventory discoverable without mounting every live demo at once.
// Once visited, preserve its state; canvas components already pause outside the viewport.
function DeferredPreview({ entry }: { entry: UiCatalogEntry }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    if (typeof IntersectionObserver === "undefined") {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((record) => record.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [ready]);
  return (
    <div
      ref={root}
      className="ui-newest-demo"
      data-preview-ready={ready}
      onFocusCapture={() => setReady(true)}
    >
      {ready ? (
        <Preview entry={entry} compact />
      ) : (
        <div className="ui-newest-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
export default function NewestPreview({
  entries,
  label = "Newest",
  filterable = true,
}: {
  entries: readonly UiCatalogEntry[];
  label?: string;
  filterable?: boolean;
}) {
  const [expanded, setExpanded] = useState<UiCatalogEntry | null>(null);
  const [category, setCategory] = useState("all");
  const browse = useRef<HTMLDivElement>(null),
    navigating = useRef(false);
  const isLarge = (entry: UiCatalogEntry) =>
    scenes.has(entry.id) || workspaces.has(entry.id);
  const largeCount = entries.filter(isLarge).length;
  const filtered = entries.filter(
    (entry) =>
      category === "all" ||
      (category === "interactive" ? isLarge(entry) : !isLarge(entry)),
  );
  useEffect(() => {
    if (!navigating.current) return;
    navigating.current = false;
    browse.current?.scrollIntoView({ block: "start", behavior: "instant" });
    browse.current?.focus({ preventScroll: true });
  }, [category]);

  if (!entries.length)
    return (
      <EmptyState
        title="All caught up"
        description="새 컴포넌트가 추가되면 이곳에서 30일 동안 먼저 볼 수 있습니다."
        action={<Link href="/">전체 카탈로그 보기 →</Link>}
      />
    );
  const experiment = playgroundExperiments.find(
    (item) => item.id === expanded?.id,
  );
  const renderCard = (entry: UiCatalogEntry) => {
    const kind = scenes.has(entry.id)
      ? "scene"
      : workspaces.has(entry.id)
        ? "workspace"
        : "component";
    return (
      <article
        key={entry.id}
        className="ui-newest-card"
        data-preview-kind={kind}
        data-preview-id={entry.id}
      >
        <header>
          <Link href={`/${entry.id}`}>
            {entry.name}
            <span aria-hidden="true">↗</span>
          </Link>
          {entry.addedAt && (
            <time dateTime={entry.addedAt}>
              {entry.addedAt.replace(/-/g, ".")}
            </time>
          )}
        </header>
        <DeferredPreview entry={entry} />
        <footer>
          <p>{entry.description}</p>
          <div className="ui-newest-actions">
            <Button
              size="sm"
              variant="secondary"
              aria-label={`${entry.name} 크게 보기`}
              onClick={() => setExpanded(entry)}
            >
              크게 보기 <span aria-hidden="true">↗</span>
            </Button>
            <Link href={`/${entry.id}`}>컴포넌트·코드 →</Link>
          </div>
        </footer>
      </article>
    );
  };
  const groups = [
    {
      id: "interactive",
      title: "인터랙션",
      items: filtered.filter(isLarge),
    },
    {
      id: "components",
      title: "컴포넌트",
      items: filtered.filter((entry) => !isLarge(entry)),
    },
  ].filter(
    (group) =>
      group.items.length && (category === "all" || category === group.id),
  );
  return (
    <>
      <div
        className="ui-newest-intro"
        ref={browse}
        tabIndex={-1}
        role="region"
        aria-label={`${label} results`}
      >
        <p>핵심 동작을 가볍게 둘러보고, 크게 열어 전체 설정을 조절해 보세요.</p>
        <span role="status">{filtered.length} items</span>
      </div>
      {filterable && (
        <div className="ui-newest-filter">
          <SegmentedControl
            label="Newest category"
            value={category}
            onValueChange={(value) => {
              navigating.current = true;
              setCategory(value);
            }}
            options={[
              { value: "all", label: `전체 ${entries.length}` },
              { value: "interactive", label: `인터랙션 ${largeCount}` },
              {
                value: "components",
                label: `컴포넌트 ${entries.length - largeCount}`,
              },
            ]}
          />
        </div>
      )}
      {groups.map((group) => (
        <section
          key={group.id}
          className="ui-newest-section"
          aria-label={group.title}
        >
          <header className="ui-newest-section-heading">
            <h2>{group.title}</h2>
            <span>{group.items.length}</span>
          </header>
          <div className="ui-newest-grid">{group.items.map(renderCard)}</div>
        </section>
      ))}

      <Dialog
        open={!!expanded}
        onOpenChange={(open) => {
          if (!open) setExpanded(null);
        }}
        title={expanded?.name ?? "Preview"}
        description={expanded?.description}
        closeLabel="미리보기 닫기"
        className="ui-newest-expanded"
      >
        {expanded && (
          <>
            <div className="ui-newest-expanded-preview" key={expanded.id}>
              <Preview entry={expanded} />
            </div>
            <div className="ui-newest-expanded-links">
              <Link href={`/${expanded.id}`} onClick={() => setExpanded(null)}>
                컴포넌트·코드 →
              </Link>
              {experiment && (
                <Link href={experiment.path} onClick={() => setExpanded(null)}>
                  Playground에서 열기 ↗
                </Link>
              )}
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
