import { useState, useEffect, useRef } from "react";
import { DesignSystemProvider, Select } from "@mingu/interaction-ui";
import {
  playgroundExperiments,
  type PlaygroundExperimentId,
} from "../../src/system/ui-catalog";
import { Experiment } from "./ExperimentalPreview";
import Link, { catalogHref } from "./routing";
import "./experimental-playground.css";
export default function ExperimentalPlayground({
  id,
}: {
  id: PlaygroundExperimentId;
}) {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    navigation.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [id]);
  const entry = playgroundExperiments.find((e) => e.id === id)!;
  return (
    <DesignSystemProvider
      theme={theme}
      accent="neutral"
      className="experimental-playground"
    >
      <header className="experiment-header">
        <Link href="/">
          Mingu UI <span>/ Playground</span>
        </Link>
        <div>
          <a
            href="https://github.com/Linternas/ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <Select
            value={theme}
            aria-label="Playground theme"
            onChange={(e) => setTheme(e.currentTarget.value as typeof theme)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </div>
      </header>
      <main>
        <div className="experiment-intro">
          <div>
            <p className="experiment-eyebrow">
              AN INTERACTIVE FIELD TRIP / {entry.number}
            </p>
            <h1>{entry.description}</h1>
          </div>
          <p>{entry.hint}</p>
        </div>
        <nav
          ref={navigation}
          aria-label="Experiments"
          className="experiment-nav"
        >
          {playgroundExperiments.map((e) => (
            <Link
              key={e.id}
              href={e.path}
              aria-current={e.id === id ? "page" : undefined}
            >
              <span>{e.number}</span>
              {e.name}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
        <section key={id} className="experiment-scene" aria-label={entry.name}>
          <Experiment id={id} />
        </section>
        <footer className="experiment-footer">
          <span>Make something happen.</span>
          <Link href={catalogHref(id)}>
            Component & API <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </main>
    </DesignSystemProvider>
  );
}
