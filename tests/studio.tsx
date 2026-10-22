import { useState } from "react";
import {
  DesignSystemProvider,
  ImageLens,
  DirectionalCard,
  LoopingTicker,
  RotatingText,
  AiStatus,
  Button,
  type AiState,
} from "../src";
export default function StudioFixture() {
  const [state, setState] = useState<AiState>("thinking");
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 24 }}
    >
      <main style={{ maxWidth: 640, display: "grid", gap: 44 }}>
        <section data-testid="status">
          <AiStatus
            state={state}
            detail={state === "researching" ? "3 sources" : undefined}
            timer
          />
          <div>
            {(
              [
                "thinking",
                "researching",
                "analyzing",
                "writing",
                "done",
                "error",
              ] as const
            ).map((value) => (
              <Button
                key={value}
                variant="ghost"
                onClick={() => setState(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </section>
        <section data-testid="long-status" style={{ maxWidth: 180 }}>
          <AiStatus
            state="thinking"
            label="긴 상태 설명이 여러 줄로 표시되는 작업입니다"
            detail="Additional information"
            timer
          />
        </section>
        <section data-testid="lens">
          <ImageLens
            src="/ui-lab/landscape.svg"
            alt="Mountain details"
            zoom={2.5}
          />
        </section>
        <section data-testid="direction" style={{ padding: 24 }}>
          <DirectionalCard
            href="#destination"
            title="Explore project"
            description="Always available"
            image={{
              src: "/ui-lab/landscape-night.svg",
              alt: "Mountains at night",
            }}
          />
        </section>
        <section data-testid="ticker">
          <LoopingTicker
            label="Tools"
            speed={60}
            items={[
              { id: "react", content: <a href="#react">React</a> },
              { id: "type", content: <a href="#typescript">TypeScript</a> },
              { id: "motion", content: "Motion" },
            ]}
          />
        </section>
        <section data-testid="rotation">
          <RotatingText
            words={["people.", "clarity.", "tomorrow."]}
            label="Build for people, clarity and tomorrow"
            interval={800}
          />
        </section>
        <div id="destination">Project destination</div>
      </main>
    </DesignSystemProvider>
  );
}
