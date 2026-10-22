import {
  ImageLens,
  DirectionalCard,
  LoopingTicker,
  RotatingText,
  Text,
} from "@mingu/interaction-ui";
export default function StudioPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  switch (id) {
    case "image-lens":
      return (
        <div className="ui-everyday-stack">
          <ImageLens
            src="/ui-lab/landscape.svg"
            alt="Layered mountain shapes at sunset"
            zoom={2.5}
          />
          <Text muted size="sm">
            Look a little closer. Hover, or open the lens.
          </Text>
        </div>
      );
    case "directional-card":
      return (
        <div className="ui-studio-card">
          <DirectionalCard
            href="/image-lightbox"
            title="A different perspective."
            description="Come in from any direction."
            image={{
              src: "/ui-lab/landscape-night.svg",
              alt: "Mountains after hours",
            }}
          />
        </div>
      );
    case "looping-ticker":
      return (
        <div className="ui-everyday-stack">
          <span className="ui-gesture-eyebrow">THINGS WE BUILD WITH</span>
          <LoopingTicker
            label="Creative toolkit"
            speed={compact ? 26 : 36}
            items={[
              {
                id: "react",
                content: (
                  <span className="ui-ticker-chip">
                    <i aria-hidden="true">◉</i>React
                  </span>
                ),
              },
              {
                id: "type",
                content: (
                  <span className="ui-ticker-chip">
                    <i aria-hidden="true">TS</i>TypeScript
                  </span>
                ),
              },
              {
                id: "motion",
                content: (
                  <span className="ui-ticker-chip">
                    <i aria-hidden="true">≈</i>Motion
                  </span>
                ),
              },
              {
                id: "design",
                content: (
                  <span className="ui-ticker-chip">
                    <i aria-hidden="true">◇</i>Good design
                  </span>
                ),
              },
              {
                id: "details",
                content: (
                  <span className="ui-ticker-chip">
                    <i aria-hidden="true">+</i>Small details
                  </span>
                ),
              },
            ]}
          />
        </div>
      );
    case "rotating-text":
      return (
        <div className="ui-rotating-demo">
          <span className="ui-gesture-eyebrow">A FEW THINGS TO BUILD FOR</span>
          <div className="ui-rotating-title">
            Build for
            <br />
            <RotatingText
              words={["people.", "clarity.", "tomorrow."]}
              label="Build for people, clarity and tomorrow."
              interval={2400}
            />
          </div>
          <Text muted size="sm">
            Same intention. A new expression.
          </Text>
        </div>
      );
    default:
      return null;
  }
}
