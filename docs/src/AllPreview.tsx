import { useState } from "react";
import {
  Badge,
  EmptyState,
  SegmentedControl,
  SelectField,
  TextField,
  Button,
} from "@mingu/interaction-ui/system";
import { uiCatalog, uiGroups } from "@mingu/interaction-ui/catalog";
import Link from "./routing";
import NewestPreview from "./NewestPreview";
import { useNewestEntries } from "./useNewestEntries";
import "./all-preview.css";

const components = uiCatalog.filter(
  (entry) => entry.kind === "core" || entry.kind === "interaction",
);

export default function AllPreview() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [view, setView] = useState("preview");
  const newest = new Set(useNewestEntries().map((entry) => entry.id));
  const search = query.trim().toLowerCase();
  const filtered = components.filter(
    (entry) =>
      (group === "all" || entry.group === group) &&
      `${entry.name} ${entry.description} ${entry.tags?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(search),
  );
  const groups = uiGroups
    .map((name) => ({
      name,
      entries: filtered.filter((entry) => entry.group === name),
    }))
    .filter((group) => group.entries.length);
  return (
    <div className="ui-all">
      <div className="ui-all-filters">
        <TextField
          type="search"
          label="컴포넌트 검색"
          placeholder="이름, 설명, 키워드…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField
          label="카테고리"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
        >
          <option value="all">전체 카테고리</option>
          {uiGroups
            .filter((name) => components.some((entry) => entry.group === name))
            .map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
        </SelectField>
      </div>
      <div className="ui-all-toolbar">
        <p role="status">
          {filtered.length} / {components.length} components
        </p>
        <SegmentedControl
          label="목록 표시 방식"
          value={view}
          onValueChange={setView}
          options={[
            { value: "list", label: "목록" },
            { value: "preview", label: "미리보기" },
          ]}
        />
      </div>
      {!filtered.length ? (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 카테고리로 찾아보세요."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setGroup("all");
              }}
            >
              필터 초기화
            </Button>
          }
        />
      ) : view === "preview" ? (
        <NewestPreview entries={filtered} label="All" filterable={false} />
      ) : (
        <div className="ui-all-groups">
          {groups.map((group) => (
            <section key={group.name} aria-label={group.name}>
              <h2>
                {group.name}
                <span>{group.entries.length}</span>
              </h2>
              <ul className="ui-all-list">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <Link href={`/${entry.id}`} aria-label={entry.name}>
                      <div className="ui-all-item-heading">
                        <strong>{entry.name}</strong>
                        {newest.has(entry.id) && (
                          <span className="ui-new-badge">New</span>
                        )}
                        <span className="ui-all-item-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                      <p>{entry.description}</p>
                      <Badge>
                        {entry.kind === "core" ? "Core" : "Interaction"}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
