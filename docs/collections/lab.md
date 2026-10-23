# Interactive lab

```tsx
import {
  StickerPeel,
  ElasticMesh,
  ImageParticleMorph,
  DitherReveal,
  FluidGlassLens,
  Lanyard,
  DomeGallery,
  FoldablePaper,
  WebcamPixelGrid,
  ImageRelighting,
} from "@mingu/interaction-ui";
import "@mingu/interaction-ui/system.css";
import "@mingu/interaction-ui/styles.css";
```

Every component accepts `label`, `className`, `style`. Their own controls are part of the reusable implementation. Demos and `/playground/<id>` use that implementation. Pointer surfaces preserve page scrolling on touch until **Touch interaction** is selected; sticker handles support direct touch. Native sliders/buttons provide keyboard alternatives. Animated canvases pause outside the viewport, in hidden tabs, under reduced motion, or with Pause. Static image tools redraw only on input. Canvas DPR and particle/sample counts are bounded. Render inside a `DesignSystemProvider` for scoped light/dark tokens.

| Component            | Props and behavior                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StickerPeel`        | `text?`, `image?`, `peel?`, `defaultPeel=.12`, `onPeelChange?(number)`. Controlled/uncontrolled amount 0–1. A clipped sticker and its reflected back fold along a diagonal. The top grip moves it within the surface; arrow keys move 12px. Corner arrows change peel by .05. Reset restores default peel and position. Optional image is a normal image URL.                                                                                      |
| `ElasticMesh`        | `text='SOFT'`. Editable text up to 14 characters, sampled into at most 2,600 small cells. Drag to deform a 2D letter mesh; spring recovery, force control, center stretch and reset. This is a planar mesh study, not a volumetric text engine.                                                                                                                                                                                                    |
| `ImageParticleMorph` | `src?`, `alt?`, `amount?`, `defaultAmount=0`, `onAmountChange?(number)`, `autoRotate=false`. Amount is clamped to 0–1; controlled values remain caller-owned. Reset emits/restores defaultAmount. Optional slow rotation stops during dragging, Pause, reduced motion, hidden tabs and offscreen. Image-colored particles interpolate between their image coordinates and a projected 3D sphere, with depth sorting and a sphere-only depth shade; the flat image retains its sampled colors. Globe amount/rotation sliders, drag rotation, image/globe toggle. No source uses an original generated poster.                                                                                                                                                                                                  |
| `DitherReveal`       | `src?`, `alt?`. Luminance controls halftone dot size. Brushing uncovers color, Recover dots controls time-based restoration; Reveal image is the keyboard alternative. Pause/reduced motion preserve manually revealed cells.                                                                                                                                                                                                                      |
| `FluidGlassLens`     | `src?`, `alt?`. A curved sampling field bends the supplied image. Radius, strength and X/Y are editable. It refracts this image canvas, not arbitrary DOM content underneath.                                                                                                                                                                                                                                                                      |
| `Lanyard`            | `name='Mingu'`, `subtitle='DESIGN ENGINEER'`. Spring/gravity badge and rope rendered in 2D; name editor, flip, swing, pause, reset. Drag the badge or use its arrow keys. Reduced motion preserves manual placement.                                                                                                                                                                                                                               |
| `DomeGallery`        | required `items: readonly {id,src,alt,title?}[]`, `onSelect?(item)`. Up to 24 uniquely identified images in a projected curved gallery, drag/slider rotation, accessible selection buttons, modal inspection. Callback fires when Open selected work is used. Empty/loading/failure states included.                                                                                                                                               |
| `FoldablePaper`      | `text?`, `fold?`, `defaultFold=0`, `onFoldChange?(number)`. Editable text (600 chars), fold 0–1 and crease .25–.75. Textured paper segments project around a crease with a plain reverse surface. Drag horizontally or use controls; reset restores text/default fold/crease.                                                                                                                                                                      |
| `WebcamPixelGrid`    | `onCameraStateChange?('idle'\|'requesting'\|'live'\|'error')`. Start camera explicitly requests **video only**, in a secure context. Local frames become a 12–64 column grid; mirror/pause/sample controls. Stop, hidden document, offscreen, or unmount stop tracks. Late permission responses are cancelled and tracks stopped. No recording/upload/backend. Sample does not request permission. Denial/unsupported/playback errors are visible. |
| `ImageRelighting`    | `src?`, `depthSrc?`, `alt?`. Supplied grayscale depth or image-luminance relief yields local surface normals and diffuse lighting. X/Y/intensity controls or pointer movement move the light. Brightness-derived relief is an artistic approximation, not recovered geometry. Depth and image should share framing.                                                                                                                                |

Image sampling tools require same-origin or CORS-enabled sources. Loading/security errors are shown instead of an unreadable canvas. Sample rasters have a longest side of 256px. Rendering/interaction stays client-side; server render does not access browser globals. Application asset ownership, image descriptions and persistence remain the consumer's responsibility.

## Embedding the particle morph

The landing uses the same public component. External controls can own the image/sphere state while its rotation, Pause and keyboard sliders remain available.

```tsx
const [amount, setAmount] = useState(1);

<ImageParticleMorph
  src="/poster.svg"
  alt="My interactive artwork"
  amount={amount}
  onAmountChange={setAmount}
  autoRotate
/>
```

Omit `amount` for internal state; `defaultAmount` sets its initial value and reset target. Without an `onAmountChange` handler a controlled amount remains fixed. Auto rotation is opt-in and uses the existing bounded canvas scheduler.
