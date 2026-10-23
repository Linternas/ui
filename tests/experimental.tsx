import { useState } from "react";
import {
  DesignSystemProvider,
  ClothPlayground,
  FluidSandbox,
  OrbitComposer,
  ParticleText,
  SpatialBoard,
  SoundPad,
  Button,
  type SpatialNode,
  type SpatialEdge,
} from "../src";
export default function ExperimentalFixture() {
  const [torn, setTorn] = useState(0),
    [fluidCount, setFluidCount] = useState(180),
    [orbitPreset, setOrbitPreset] = useState("loom");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [shown, setShown] = useState(true),
    [nodes, setNodes] = useState<readonly SpatialNode[]>([
      { id: "a", title: "Alpha", x: 20, y: 30 },
      { id: "b", title: "Beta", x: 350, y: 80 },
    ]),
    [edges, setEdges] = useState<readonly SpatialEdge[]>([]),
    [notes, setNotes] = useState(0);
  return (
    <DesignSystemProvider
      theme={theme}
      accent="neutral"
      style={{ padding: 16 }}
    >
      <main style={{ maxWidth: 900, display: "grid", gap: 40 }}>
        <Button
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          Toggle scene theme
        </Button>
        <section data-testid="particle">
          <ParticleText />
        </section>
        <section data-testid="board">
          <SpatialBoard
            nodes={nodes}
            onNodesChange={setNodes}
            edges={edges}
            onEdgesChange={setEdges}
          />
          <output data-testid="board-data">
            {JSON.stringify({ nodes, edges })}
          </output>
        </section>
        <section data-testid="sound">
          <Button onClick={() => setShown(!shown)}>Toggle sound scene</Button>
          {shown && <SoundPad onNote={() => setNotes((n) => n + 1)} />}
          <output aria-label="Played notes">{notes}</output>
        </section>
        <section data-testid="cloth">
          <ClothPlayground onTear={setTorn} />
          <output aria-label="Torn threads">{torn}</output>
        </section>
        <section data-testid="fluid">
          <FluidSandbox onCountChange={setFluidCount} />
          <output aria-label="Fluid count">{fluidCount}</output>
        </section>
        <section data-testid="orbit">
          <OrbitComposer onPresetChange={setOrbitPreset} />
          <output aria-label="Selected orbit preset">{orbitPreset}</output>
        </section>
      </main>
    </DesignSystemProvider>
  );
}
