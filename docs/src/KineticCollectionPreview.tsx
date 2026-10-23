import {
  FlipCard,
  MazeRunner,
  ConfettiBurst,
  VectorField,
  ReactionDiffusion,
  TerrainMesh,
  PendulumWave,
  ClipPathEditor,
  ContrastChecker,
  ShadowEditor,
} from "../../src/collections/kinetic";
import { CopyButton } from "../../src/system/micro-interactions";
export default function KineticCollectionPreview({ id }: { id: string }) {
  let content;
  switch (id) {
    case "flip-card":
      content = (
        <FlipCard
          front={
            <>
              <span className="mingu-workflow-note">A SMALL DISCOVERY</span>
              <h2>
                Another side
                <br />
                to every idea.
              </h2>
              <p>Turn a little curiosity into something.</p>
            </>
          }
          back={
            <>
              <span className="mingu-workflow-note">KEEP EXPLORING</span>
              <h2>Stay curious.</h2>
              <p>There is always a little more to discover.</p>
              <CopyButton text="Stay curious." label="Keep the thought" />
            </>
          }
        />
      );
      break;
    case "maze-runner":
      content = <MazeRunner seed={3} />;
      break;
    case "confetti-burst":
      content = <ConfettiBurst burstKey={1} />;
      break;
    case "vector-field":
      content = <VectorField />;
      break;
    case "reaction-diffusion":
      content = <ReactionDiffusion />;
      break;
    case "terrain-mesh":
      content = <TerrainMesh seed={3} />;
      break;
    case "pendulum-wave":
      content = <PendulumWave />;
      break;
    case "clip-path-editor":
      content = <ClipPathEditor />;
      break;
    case "contrast-checker":
      content = <ContrastChecker />;
      break;
    case "shadow-editor":
      content = <ShadowEditor label="A little depth" />;
      break;
    default:
      return null;
  }
  return <div className="mingu-lab-demo">{content}</div>;
}
