import { useState } from "react";
import {
  DesignSystemProvider,
  FocusDock,
  BottomSheet,
  Button,
  Progress,
} from "../src";
import DemoPreview from "../docs/src/DemoPreview";
import ProgressPreview from "../docs/src/ProgressPreview";
const ids = [
  "animated-filter-bar",
  "radial-menu",
  "expandable-card",
  "focus-dock",
  "bottom-sheet",
  "swipe-deck",
  "grid-reveal",
] as const;
export default function RefinementFixture() {
  const [open, setOpen] = useState(false),
    [long, setLong] = useState(false);
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 16 }}
    >
      <main style={{ maxWidth: 800, display: "grid", gap: 32 }}>
        {ids.map((id) => (
          <section data-testid={id} key={id}>
            <div className="studio-demo">
              <DemoPreview id={id} />
            </div>
          </section>
        ))}
        <section data-testid="many-dock">
          <FocusDock
            label="Many actions"
            items={Array.from({ length: 8 }, (_, i) => ({
              id: String(i),
              label: `Action ${i + 1}`,
              icon: "+",
            }))}
          />
        </section>
        <section data-testid="progress">
          <ProgressPreview />
          <Progress label="Native progress" value={25} animated={false} />
        </section>
        <section data-testid="sheet-dynamic">
          <Button onClick={() => setOpen(true)}>Open dynamic sheet</Button>
          <BottomSheet
            open={open}
            onOpenChange={setOpen}
            title="Adaptive sheet"
          >
            <Button onClick={() => setLong((n) => !n)}>Toggle details</Button>
            {long && <p style={{ height: 350 }}>Additional details</p>}
            <Button onClick={() => setOpen(false)}>Done</Button>
          </BottomSheet>
        </section>
      </main>
    </DesignSystemProvider>
  );
}
