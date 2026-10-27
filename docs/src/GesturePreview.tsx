import { Icon as VectorIcon } from "../../src/icons";
import { useState } from "react";
import {
  RadialMenu,
  PreviewLink,
  MorphingSearch,
  ElasticSlider,
  Text,
} from "@mingu/interaction-ui";
const projects = [
  {
    name: "Quiet landscapes",
    category: "Photography",
    src: "/ui-lab/landscape.svg",
    href: "/image-compare",
  },
  {
    name: "After hours",
    category: "Color study",
    src: "/ui-lab/landscape-night.svg",
    href: "/preview-link",
  },
  {
    name: "Objects in motion",
    category: "Interaction",
    src: "/ui-lab/landscape.svg",
    href: "/swipe-deck",
  },
];
function ActionIcon({ index }: { index: number }) {
  const paths = [
    "M12 5v14M5 12h14",
    "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01",
    "M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-2 2M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l2-2",
    "M3 7h7l2-3h9v16H3z",
    "M12 3l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1z",
    "M12 3v12M7 8l5-5 5 5M4 14v7h16v-7",
  ];
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index]} />
    </svg>
  );
}
export default function GesturePreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [action, setAction] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [intensity, setIntensity] = useState(60);
  switch (id) {
    case "radial-menu":
      return (
        <div className="ui-gesture-stage ui-radial-demo">
          <RadialMenu
            label="Create something"
            onSelect={setAction}
            items={[
              "Note",
              "Image",
              "Link",
              "Folder",
              "Favorite",
              "Upload",
            ].map((label, index) => ({
              id: label,
              label,
              icon: <ActionIcon index={index} />,
            }))}
          />
          <Text size="sm" muted>
            {action ? `${action} selected` : "Press + to unfold."}
          </Text>
        </div>
      );
    case "preview-link":
      return (
        <div className="ui-gesture-stage ui-preview-demo">
          <span className="ui-gesture-eyebrow">A CLOSER LOOK</span>
          {projects.slice(0, compact ? 2 : 3).map((project, i) => (
            <div className="ui-preview-row" key={project.name}>
              <span className="ui-preview-number">0{i + 1}</span>
              <PreviewLink
                href={project.href}
                preview={{
                  src: project.src,
                  title: project.name,
                  description: project.category,
                }}
              >
                {project.name}
                <span aria-hidden="true">
                  <VectorIcon name="external" size="1em" />
                </span>
              </PreviewLink>
            </div>
          ))}
          <Text muted size="sm">
            Hover or focus a link to peek inside.
          </Text>
        </div>
      );
    case "morphing-search": {
      const matches = projects.filter((p) =>
        `${p.name} ${p.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      );
      return (
        <div className="ui-gesture-stage ui-search-demo">
          <div className="ui-search-heading">
            <span className="ui-gesture-eyebrow">YOUR COLLECTION</span>
            <span>{projects.length.toString().padStart(2, "0")}</span>
          </div>
          <div className="ui-search-control">
            <MorphingSearch
              label="Search collection"
              placeholder="Try photography…"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setSearched(false);
              }}
              onSearch={() => setSearched(true)}
            />
          </div>
          <ul className="ui-search-results">
            {matches.map((project) => (
              <li key={project.name}>
                <span className="ui-search-dot" aria-hidden="true" />
                <span>
                  {project.name}
                  <small>{project.category}</small>
                </span>
                <span aria-hidden="true">
                  <VectorIcon name="external" size="1em" />
                </span>
              </li>
            ))}
          </ul>
          <p className="ui-search-feedback" role="status">
            {matches.length === 0
              ? "No matches. Try another word."
              : searched
                ? `${matches.length} result${matches.length === 1 ? "" : "s"} found.`
                : query.trim()
                  ? `${matches.length} matching project${matches.length === 1 ? "" : "s"}.`
                  : "Open search to find something."}
          </p>
        </div>
      );
    }
    case "elastic-slider":
      return (
        <div className="ui-gesture-stage ui-elastic-demo">
          <div className="ui-elastic-wave" aria-hidden="true">
            {Array.from({ length: 33 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${6 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3)) * intensity}px`,
                  opacity: 0.25 + intensity / 135,
                }}
              />
            ))}
          </div>
          <ElasticSlider
            label="Intensity"
            value={intensity}
            onValueChange={setIntensity}
            formatValue={(value) => `${value}%`}
          />
          <Text muted size="sm">
            Pull the line. Let it settle.
          </Text>
        </div>
      );
    default:
      return null;
  }
}
