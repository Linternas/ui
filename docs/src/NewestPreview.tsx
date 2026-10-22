import type { UiCatalogEntry } from "@mingu/interaction-ui/catalog";
import { EmptyState } from "@mingu/interaction-ui/system";
import Link from "./routing";
import DemoPreview from "./DemoPreview";
import SystemComponentDemo from "./SystemComponentDemo";
import type { ComponentId } from "./catalog";
import type { SystemComponentId } from "@mingu/interaction-ui/system";

export default function NewestPreview({
  entries,
}: {
  entries: readonly UiCatalogEntry[];
}) {
  if (!entries.length)
    return (
      <EmptyState
        title="All caught up"
        description="새 컴포넌트가 추가되면 이곳에서 30일 동안 먼저 볼 수 있습니다."
        action={<Link href="/">전체 카탈로그 보기 →</Link>}
      />
    );
  return (
    <div className="ui-newest-grid">
      {entries.map((entry) => (
        <article key={entry.id} className="ui-newest-card">
          <header>
            <Link href={`/${entry.id}`}>
              {entry.name} <span aria-hidden="true">↗</span>
            </Link>
            <time dateTime={entry.addedAt}>
              {entry.addedAt?.replace(/-/g, ".")}
            </time>
          </header>
          <div className="ui-newest-demo">
            {entry.kind === "interaction" ? (
              <DemoPreview id={entry.id as ComponentId} compact />
            ) : (
              <SystemComponentDemo id={entry.id as SystemComponentId} />
            )}
          </div>
          <footer>
            <p>{entry.description}</p>
            <Link href={`/${entry.id}`}>Preview & code →</Link>
          </footer>
        </article>
      ))}
    </div>
  );
}
