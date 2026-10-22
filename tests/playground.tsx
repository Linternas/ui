import { useState } from "react";
import {
  DesignSystemProvider,
  Button,
  HoverGallery,
  TextReveal,
  CursorTrail,
  AvatarCluster,
  HoldToConfirm,
  NumberScrubber,
} from "../src";
import PlaygroundPreview from "../docs/src/PlaygroundPreview";
export default function PlaygroundFixture() {
  const [count, setCount] = useState(0),
    [attempt, setAttempt] = useState(0),
    [disabled, setDisabled] = useState(false),
    [submitted, setSubmitted] = useState("");
  const [controlled, setControlled] = useState(4);
  const images = [
    {
      id: "day",
      title: "Day",
      src: "/ui-lab/landscape.svg",
      alt: "Day mountains",
    },
    {
      id: "disabled",
      title: "Unavailable",
      src: "/ui-lab/landscape.svg",
      alt: "Unavailable mountains",
      disabled: true,
    },
    {
      id: "night",
      title: "Night",
      src: "/ui-lab/landscape-night.svg",
      alt: "Night mountains",
    },
  ];
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 24 }}
    >
      <main style={{ maxWidth: 640, display: "grid", gap: 48 }}>
        <section data-testid="gallery">
          <HoverGallery items={images} label="Views" />
          <HoverGallery items={[]} label="Empty gallery" />
        </section>
        <section data-testid="reveal">
          <PlaygroundPreview id="text-reveal" />
        </section>
        <section data-testid="trail">
          <CursorTrail images={images} label="Trail">
            <h2>Inspiration</h2>
          </CursorTrail>
        </section>
        <section data-testid="avatars">
          <AvatarCluster
            label="Team"
            people={[
              {
                id: "min",
                name: "Min",
                role: "Designer",
                bio: "Thoughtful interfaces",
                href: "#profile",
              },
              { id: "ari", name: "Ari" },
              { id: "disabled", name: "Unavailable", disabled: true },
            ]}
          />
        </section>
        <section data-testid="hold">
          <HoldToConfirm
            label="Hold to save"
            duration={600}
            disabled={disabled}
            onConfirm={async () => {
              setAttempt((n) => n + 1);
              await new Promise((resolve) => setTimeout(resolve, 150));
              if (attempt === 0) throw Error("Try again");
              setCount((n) => n + 1);
            }}
          />
          <output aria-label="Completed">{count}</output>
          <output aria-label="Attempts">{attempt}</output>
          <Button onClick={() => setDisabled((d) => !d)}>
            Toggle disabled
          </Button>
        </section>
        <section data-testid="numbers">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(
                String(new FormData(event.currentTarget).get("amount")),
              );
            }}
          >
            <NumberScrubber
              label="Amount"
              name="amount"
              defaultValue={2.5}
              min={0}
              max={10}
              step={0.5}
              hint="Try dragging"
            />
            <NumberScrubber
              label="Controlled"
              name="controlled"
              value={controlled}
              onValueChange={setControlled}
              min={0}
              max={10}
            />
            <NumberScrubber label="Disabled" disabled defaultValue={3} />
            <Button type="submit">Submit</Button>
            <Button type="reset">Reset</Button>
            <Button onClick={() => setControlled(7)}>Set controlled</Button>
          </form>
          <output aria-label="Submitted">{submitted}</output>
        </section>
        <section style={{ height: 400 }}>
          <TextReveal text="Readable server copy." />
        </section>
        <div id="profile">Profile destination</div>
      </main>
    </DesignSystemProvider>
  );
}
