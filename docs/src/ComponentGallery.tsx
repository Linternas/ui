import { Icon as VectorIcon } from "../../src/icons";
import { useState, useEffect, useRef } from "react";
import {
  playgroundExperiments,
  uiGroups,
  type UiCatalogEntry,
} from "@mingu/interaction-ui/catalog";
import {
  Button,
  Dialog,
  EmptyState,
  SelectField,
  TextField,
  Tabs,
} from "@mingu/interaction-ui/system";
import { CodeBlock } from "@mingu/interaction-ui";
import Link, { catalogHref } from "./routing";
import DemoPreview from "./DemoPreview";
import PreviewLayout from "./PreviewLayout";
import SystemComponentDemo from "./SystemComponentDemo";
import type { ComponentId } from "./catalog";
import type { SystemComponentId } from "@mingu/interaction-ui/system";
import "./newest-preview.css";
import { useNewestEntries } from "./useNewestEntries";
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
  return (
    <PreviewLayout id={entry.id}>
      {entry.kind === "interaction" ? (
        <DemoPreview id={entry.id as ComponentId} compact={compact} />
      ) : (
        <SystemComponentDemo id={entry.id as SystemComponentId} />
      )}
    </PreviewLayout>
  );
}
// Only mount nearby demos. Keep visited state; canvas components pause offscreen.
function DeferredPreview({ entry }: { entry: UiCatalogEntry }) {
  const root = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false),
    [scrollable, setScrollable] = useState(false);
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
      { rootMargin: "400px 0px" },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (!ready || !root.current || !content.current) return;
    const update = () =>
      setScrollable(
        root.current!.scrollHeight > root.current!.clientHeight + 1,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root.current);
    observer.observe(content.current);
    return () => observer.disconnect();
  }, [ready]);
  return (
    <div
      ref={root}
      className="ui-newest-demo"
      data-preview-ready={ready}
      data-scrollable={scrollable || undefined}
      role="region"
      aria-label={`${entry.name} 미리보기`}
      tabIndex={scrollable ? 0 : undefined}
      onFocusCapture={() => setReady(true)}
    >
      <div ref={content} className="ui-gallery-demo-content">
        {ready ? (
          <Preview entry={entry} compact />
        ) : (
          <div className="ui-newest-placeholder" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
function usage(entry: UiCatalogEntry) {
  const imports = Array.from(
    new Set(
      Array.from(
        entry.code.matchAll(/<([A-Z][A-Za-z0-9]*)/g),
        (match) => match[1],
      ),
    ),
  ).join(", ");
  return `import { ${imports} } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\nimport '@mingu/interaction-ui/styles.css';\n\n${entry.code}`;
}
export default function ComponentGallery({
  entries,
  label = "Components",
  filterable = true,
}: {
  entries: readonly UiCatalogEntry[];
  label?: string;
  filterable?: boolean;
}) {
  const newIds = new Set(useNewestEntries().map((entry) => entry.id));
  const [expanded, setExpanded] = useState<UiCatalogEntry | null>(null),
    [tab, setTab] = useState("preview");
  const [category, setCategory] = useState("all"),
    [query, setQuery] = useState("");
  const filtered = entries.filter(
    (entry) =>
      (category === "all" || entry.group === category) &&
      `${entry.name} ${entry.description} ${entry.tags?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const experiment = playgroundExperiments.find(
    (item) => item.id === expanded?.id,
  );
  const expand = (entry: UiCatalogEntry) => {
    setTab("preview");
    setExpanded(entry);
  };
  if (!entries.length)
    return (
      <EmptyState
        title="표시할 컴포넌트가 없습니다"
        description="전체 카탈로그에서 컴포넌트를 찾아보세요."
        action={
          <Link href="/all">
            전체 카탈로그 보기 <VectorIcon name="arrow-right" size="1em" />
          </Link>
        }
      />
    );
  return (
    <>
      {filterable && (
        <div className="ui-gallery-tools">
          <TextField
            type="search"
            label="컴포넌트 검색"
            placeholder="이름, 설명, 키워드…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SelectField
            label="컴포넌트 카테고리"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">전체 카테고리</option>
            {uiGroups
              .filter((group) => entries.some((entry) => entry.group === group))
              .map((group) => (
                <option value={group} key={group}>
                  {group}
                </option>
              ))}
          </SelectField>
          <span role="status">
            {filtered.length} / {entries.length}
          </span>
        </div>
      )}
      {!filtered.length ? (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 카테고리로 찾아보세요."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              필터 초기화
            </Button>
          }
        />
      ) : (
        <div
          className="ui-newest-grid ui-gallery-grid"
          role="region"
          aria-label={`${label} results`}
        >
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="ui-newest-card"
              data-preview-id={entry.id}
              data-preview-kind={
                scenes.has(entry.id)
                  ? "scene"
                  : workspaces.has(entry.id)
                    ? "workspace"
                    : "component"
              }
            >
              <DeferredPreview entry={entry} />
              <footer>
                <header>
                  <button
                    type="button"
                    className="ui-gallery-title"
                    aria-label={`${entry.name} 크게 보기`}
                    onClick={() => expand(entry)}
                  >
                    <span className="ui-gallery-title-row">
                      <strong>{entry.name}</strong>
                      {newIds.has(entry.id) && (
                        <span className="ui-new-badge">New</span>
                      )}
                    </span>
                    <span>
                      {entry.group} ·{" "}
                      {entry.kind === "core" ? "Core" : "Interaction"}
                    </span>
                  </button>
                </header>
                <Link
                  className="ui-gallery-code-link"
                  href={catalogHref(entry.id)}
                  aria-label={`${entry.name} 코드 보기`}
                  title="컴포넌트·코드"
                >
                  <span aria-hidden="true">
                    <VectorIcon name="external" size="1em" />
                  </span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
      )}
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
            <Tabs
              label="컴포넌트 상세"
              value={tab}
              onValueChange={setTab}
              items={[
                {
                  value: "preview",
                  label: "미리보기",
                  content:
                    tab === "preview" ? (
                      <div
                        className="ui-newest-expanded-preview"
                        key={expanded.id}
                      >
                        <Preview entry={expanded} />
                      </div>
                    ) : null,
                },
                {
                  value: "code",
                  label: "코드",
                  content:
                    tab === "code" ? (
                      <CodeBlock
                        code={usage(expanded)}
                        language="tsx"
                        filename={`${expanded.id}.tsx`}
                      />
                    ) : null,
                },
              ]}
            />
            <div className="ui-newest-expanded-links">
              <Link
                href={catalogHref(expanded.id)}
                onClick={() => setExpanded(null)}
              >
                컴포넌트·코드 <VectorIcon name="arrow-right" size="1em" />
              </Link>
              {experiment && (
                <Link href={experiment.path} onClick={() => setExpanded(null)}>
                  Playground에서 열기 <VectorIcon name="external" size="1em" />
                </Link>
              )}
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
