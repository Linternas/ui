# Kinetic and design lab (0.23)

Import components and helpers from `@mingu/interaction-ui`, load `system.css` and `styles.css` under `DesignSystemProvider`. Added 2026-10-23 UTC; New badges expire after 30 days. Common props: `label`, `disabled`, `className`, `style`. Controlled values remain caller-owned. Demos use the same public components.

Canvas scenes are bounded, pause outside the viewport or in a hidden document, cap device pixel ratio at 1.5 and backing dimensions at 2048×1200. Reduced motion draws static frames; explicit buttons still change the scene. Repeated animation never writes React state every frame. No external images, shaders, fonts, audio, device permissions or network services are needed.

## FlipCard

`front:ReactNode`, `back:ReactNode`, `flipped/defaultFlipped=false`, `onFlippedChange(boolean)`.

A native button flips the actual 3D card. The inactive face is inert and hidden from accessibility APIs; interactive children only receive focus on the active face. Escape returns to the front and focuses the toggle. Reduced motion switches faces without rotation. Supply content that fits the panel; the component is a presentation container, not a data security boundary.

## MazeRunner

`maze?:readonly string[]`, `seed=1`, `position/defaultPosition:{row,column}`, `onPositionChange(position)`, `onComplete()`.

`#` denotes a wall, S the start, G the goal; other characters are floor. Generated grids are deterministic and bounded to 5–21 odd rows/columns. `generateMaze(seed,width,height)` is a pure exported helper. Focus the board for arrow keys, use four direction buttons or click an adjacent floor cell. Walls reject moves, reaching the goal calls `onComplete`, and Reset restores the start. New maze generates a new seeded board when a custom maze is absent. Moves and notices describe actual state. Custom boards are capped at 21×21; callers should supply a connected start/goal. Keyboard handling is scoped to the focused board.

## ConfettiBurst

`count=72` (12–160 per burst), `burstKey?:string|number`, `onBurst()`, `colors?:readonly string[]`.

Click/tap the canvas or Launch confetti. Changing a defined `burstKey` launches another burst. At most 240 particles exist; gravity/spin and finite lifetimes animate the burst, then the loop stops. Clear removes particles. Reduced motion draws a static scatter. Colors accept six-digit HEX. No fullscreen overlay or pointer interception outside the canvas.

## VectorField

`value/defaultValue: readonly {id,x,y,strength}[]`, `onValueChange(FieldCharge[])`, plus `paused/defaultPaused`, `onPausedChange(boolean)`.

Place up to eight charges by clicking or Add center charge. Polarity switches the next charge; Clear removes charges. x/y are normalized 0–1 coordinates. Arrow direction/length respond to sampled forces on a bounded 24×14 field. Pointer hover temporarily probes the field. This is a visual approximation, not a scientific solver. Pause and reduced motion retain placement controls.

## ReactionDiffusion

`parameters/defaultParameters:{feed,kill}`, `onParametersChange(ReactionParameters)`, plus pause props.

80×54 chemical grid with bounded local reaction/diffusion steps. Initial/reset frames warm five seeds through 160 bounded steps so static previews already show a developing pattern. Feed is bounded .01–.08 and kill .03–.08. Click to seed a region, Seed center, Step pattern (20 steps), Reset pattern. Normal animation advances four steps roughly every 30ms; static/reduced mode advances only on explicit actions. Rendering interpolates the provider's surface/accent colors. This visual Gray–Scott-style model has no claim of scientific numerical accuracy.

## TerrainMesh

`amplitude/defaultAmplitude=.55`, `onAmplitudeChange(number)`, `seed=1`, plus pause props.

Projected 26×18 wireframe height field. Edit Height and View angle, hover to adjust the view, regenerate with New terrain, or advance one frame with Step terrain. Native ranges and manual buttons remain available under reduced motion. Height and geometry are bounded and deterministic for a seed/generation.

## PendulumWave

`count=12` (3–24), `gravity/defaultGravity=1`, `onGravityChange(number)`, `onPluck(index)`, plus pause props.

Analytic pendulum phases form a moving wave. Click the nearest bob or Pluck middle to offset a phase, adjust gravity, Synchronize, or Step wave. No audio is produced. This is a visual motion model, not an engineering simulator. Reduced motion keeps the composed state and manual actions.

## ClipPathEditor

`value/defaultValue: readonly {x,y}[]`, `onValueChange(ClipPoint[])`.

3–12 percentage anchors. Drag an SVG handle, use its arrow keys, or edit native X/Y ranges. Touch dragging is limited to anchor handles; the rest of the surface retains vertical scrolling. Add/Remove retain polygon bounds. `clipPathCss(points)` returns a validated `polygon(...)`, clamps finite points to 0–100 and returns `none` below three points. Actual artwork uses the current CSS clip-path. Copy clip path uses the shared CopyButton and reports clipboard success/failure.

## ContrastChecker

`value/defaultValue:{foreground,background}`, `onValueChange(ContrastColors)`, `sample?`.

Native six-digit HEX color inputs update an actual text sample, contrast ratio and Swap colors. `contrastRatio(foreground,background)` implements sRGB linearization and relative luminance as defined by [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). Comparison uses the unrounded ratio: normal AA 4.5:1, large AA 3:1, normal AAA 7:1. Output rounds only for display. This checks two opaque colors; full page accessibility, font size, transparency and images require separate review. Invalid HEX input falls back to a neutral color.

## ShadowEditor

`value/defaultValue: readonly ShadowLayer[]`, `onValueChange(ShadowLayer[])`. Layer shape: `{id,x,y,blur,spread,color,opacity,inset?}`.

Select a layer, edit native distance/blur/spread/opacity/color inputs, add up to four layers or remove all, and try Soft/Hard/Float presets. Actual box-shadow and Copy shadow CSS reflect the current state. `shadowCss(layers)` is a pure helper with bounded values, six-digit HEX conversion to rgba and optional inset support. Zero layers returns `none`. No arbitrary CSS strings are evaluated.
