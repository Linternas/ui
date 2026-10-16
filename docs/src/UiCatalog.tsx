"use client";
import { useEffect, useRef, useState } from "react";
import Link from "./routing";
import {
  DesignSystemProvider,
  Input,
  Select,
  Heading,
  Text,
  Badge,
  type Theme,
} from "@mingu/interaction-ui/system";
import { useRouter } from "./routing";
import { uiCatalog, uiGroups, uiFamilies } from "@mingu/interaction-ui/catalog";
import { type SystemComponentId } from "@mingu/interaction-ui/system";
import { type ComponentId } from "./catalog";
import DemoPreview from "./DemoPreview";
import FoundationPreview, { PatternPreview } from "./FoundationPreview";
import { CodeBlock } from "@mingu/interaction-ui";
import SystemComponentDemo from "./SystemComponentDemo";
import "./system-catalog.css";
import "./interaction-previews.css";
export default function UiCatalog({
  selected = "foundations",
}: {
  selected?: string;
}) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>("system");
  const router = useRouter();
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    const container = sidebar.current;
    const active = container?.querySelector<HTMLElement>(
      'a[aria-current="page"]',
    );
    if (!container || !active) return;
    const bounds = container.getBoundingClientRect(),
      link = active.getBoundingClientRect();
    if (link.top < bounds.top + 16)
      container.scrollTop += link.top - bounds.top - 16;
    else if (link.bottom > bounds.bottom - 16)
      container.scrollTop += link.bottom - bounds.bottom + 16;
  }, [selected]);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mingu-ui-theme");
      if (saved === "light" || saved === "dark" || saved === "system")
        setTheme(saved);
    } catch {}
  }, []);
  const changeTheme = (next: Theme) => {
    setTheme(next);
    try {
      sessionStorage.setItem("mingu-ui-theme", next);
    } catch {}
  };
  const item = uiCatalog.find((item) => item.id === selected)!;
  const filtered = uiCatalog.filter((entry) =>
    `${entry.name} ${entry.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const imports = Array.from(
    new Set(
      Array.from(
        item.code.matchAll(/<([A-Z][A-Za-z0-9]*)/g),
        (match) => match[1],
      ),
    ),
  ).join(", ");
  const family = uiFamilies.find((ids) => ids.includes(selected));
  const related = family
    ? uiCatalog.filter((entry) => family.includes(entry.id))
    : [];
  const code =
    item.kind === "foundation" || item.kind === "pattern"
      ? item.code
      : `import { ${imports} } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\nimport '@mingu/interaction-ui/styles.css';\n\n${item.code}`;
  return (
    <DesignSystemProvider
      theme={theme}
      className="system-catalog"
      data-catalog-count={
        uiCatalog.filter(
          (entry) => entry.kind === "core" || entry.kind === "interaction",
        ).length
      }
    >
      <header className="system-catalog-header">
        <Link href="/lab/ui">
          Mingu UI <span>/ Design system</span>
        </Link>
        <div>
          <a className="ui-github-link" href="https://github.com/Linternas/ui" target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <Badge>
            {
              uiCatalog.filter(
                (entry) =>
                  entry.kind === "core" || entry.kind === "interaction",
              ).length
            }{" "}
            components
          </Badge>
          <Select
            value={theme}
            aria-label="Component theme"
            onChange={(e) => changeTheme(e.target.value as Theme)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </div>
      </header>
      <div className="system-catalog-layout">
        <aside ref={sidebar} className="system-catalog-sidebar">
          <Input
            type="search"
            aria-label="Find a component"
            placeholder="Find a component…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <nav aria-label="Design system components">
            {!filtered.length && <p role="status">No matching components</p>}
            {uiGroups
              .filter((group) =>
                filtered.some((entry) => entry.group === group),
              )
              .map((group) => (
                <section key={group}>
                  <h2>{group}</h2>
                  {filtered
                    .filter((entry) => entry.group === group)
                    .map((entry) => (
                      <Link
                        key={entry.id}
                        href={`/lab/ui/${entry.id}`}
                        aria-current={
                          entry.id === selected ? "page" : undefined
                        }
                      >
                        {entry.name}
                      </Link>
                    ))}
                </section>
              ))}
          </nav>
        </aside>
        <main className="system-catalog-main">
          <div className="system-catalog-mobile">
            <Select
              aria-label="Select a component"
              value={selected}
              onChange={(e) => {
                router.push(`/lab/ui/${e.target.value}`);
              }}
            >
              {uiGroups.map((group) => (
                <optgroup label={group} key={group}>
                  {uiCatalog
                    .filter((entry) => entry.group === group)
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          </div>
          <div className="system-catalog-title">
            <span>{item.group}</span>
            <Heading level={1}>{item.name}</Heading>
            <Text muted>{item.description}</Text>
          </div>
          {related.length > 1 && (
            <nav className="ui-family" aria-label="Related components">
              {related.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/lab/ui/${entry.id}`}
                  aria-current={entry.id === selected ? "page" : undefined}
                >
                  {entry.name}
                </Link>
              ))}
            </nav>
          )}
          <section
            className="system-catalog-preview"
            aria-label={`${item.name} preview`}
          >
            <div className="system-preview-label">PREVIEW / STATES</div>
            {item.kind === "foundation" ? (
              <FoundationPreview />
            ) : item.kind === "pattern" ? (
              <PatternPreview />
            ) : item.kind === "interaction" ? (
              <div className="studio-demo" key={selected}>
                <DemoPreview id={selected as ComponentId} />
              </div>
            ) : (
              <SystemComponentDemo
                key={selected}
                id={selected as SystemComponentId}
              />
            )}
          </section>
          <section id="usage" className="system-catalog-usage">
            <Heading level={2} size="lg">
              Usage
            </Heading>
            <CodeBlock
              filename={`${selected}.tsx`}
              language="tsx"
              code={code}
            />
          </section>
          <footer>
            <Link href="/lab/ui">← Mingu UI</Link>
            <a
              href="https://github.com/Linternas/ui/blob/main/DESIGN_SYSTEM.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              API & usage guide ↗
            </a>
          </footer>
        </main>
      </div>
    </DesignSystemProvider>
  );
}
