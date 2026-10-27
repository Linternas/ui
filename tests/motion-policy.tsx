import { useState } from "react";
import {
  DesignSystemProvider,
  InteractionProvider,
  useMotionSettings,
  type MotionPreference,
  Button,
  TextField,
  Skeleton,
  FocusDock,
  MatrixOrb,
  SortableList,
} from "../src";

function Probe({ name }: { name: string }) {
  const settings = useMotionSettings();
  return (
    <section data-testid={name}>
      <output>
        {settings.motion}:{String(settings.reducedMotion)}
      </output>
      <Skeleton style={{ width: 80, height: 20 }} />
    </section>
  );
}
export default function MotionPolicyFixture() {
  const [notes, setNotes] = useState([
    { id: "a", label: "Alpha note" },
    { id: "b", label: "Beta note" },
  ]);
  const [mode, setMode] = useState<MotionPreference>("system");
  return (
    <main style={{ maxWidth: 700, margin: 20 }}>
      <label>
        Motion policy{" "}
        <select
          aria-label="Motion policy"
          value={mode}
          onChange={(e) => setMode(e.target.value as MotionPreference)}
        >
          <option>system</option>
          <option>full</option>
          <option>reduced</option>
        </select>
      </label>
      <DesignSystemProvider motion={mode} theme="light" data-testid="outer">
        <TextField label="Retained draft" />
        <Button interaction="ripple">Ripple action</Button>
        <Probe name="outer-probe" />
        <FocusDock
          label="Policy dock"
          items={[
            { id: "one", label: "One", icon: "1" },
            { id: "two", label: "Two", icon: "2" },
          ]}
        />
        <SortableList label="Policy notes" items={notes} onReorder={setNotes} />
        <div data-testid="canvas">
          <MatrixOrb size={100} state="thinking" />
        </div>
        <DesignSystemProvider data-testid="inherited">
          <Probe name="inherited-probe" />
        </DesignSystemProvider>
        <DesignSystemProvider motion="reduced" data-testid="nested-reduced">
          <Probe name="reduced-probe" />
          <DesignSystemProvider motion="full">
            <Probe name="full-in-reduced" />
          </DesignSystemProvider>
        </DesignSystemProvider>
        <DesignSystemProvider motion="full">
          <Probe name="full-probe" />
          <DesignSystemProvider motion="system">
            <Probe name="system-in-full" />
          </DesignSystemProvider>
        </DesignSystemProvider>
      </DesignSystemProvider>
      <InteractionProvider motion={mode}>
        <Probe name="standalone-probe" />
      </InteractionProvider>
    </main>
  );
}
