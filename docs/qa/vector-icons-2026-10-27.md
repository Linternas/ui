# Vector icon verification — 2026-10-27

Version 0.26.1 replaces font glyphs used as control icons across the Web library, Native library and shipped previews. Actual user emoji reactions, numeric multiplication signs and playback units remain text.

## Implementation

- Web: original SVG paths in `src/icons.tsx`, also re-exported by the existing `src/shared.tsx` utility. Decorative icons are hidden from accessibility; controls retain their own names, state and keyboard behavior.
- Native: the existing `Icon` renders View lines and borders, now including check, plus, minus and sign. Select, Checkbox, Chip, AppBar, Accordion and numeric controls reuse it. No icon font or new native module is required.
- Model selection checks are 18px, dialog close marks 20px, and completed Stepper marks 16px inside square 24px badges. Mobile column layout preserves badge width independently of flex basis.
- CSS-generated tool disclosure glyphs are replaced by SVG; canvas decoration uses strokes. A source guard rejects control glyphs in JSX and CSS content.

## Automated verification

- `npm run typecheck`: Web/Native types, generated declarations and strict consumer fixtures passed, including the complete Native example without DOM libraries.
- `npm run typecheck:docs`, `npm run build`: passed.
- `npm run test:native`: 31 tests across three suites passed.
- `npm run test:ssr`: all 80 public collection exports rendered without browser globals.
- Browser inventory: 282 tests covered. The full run passed 280; the two new icon-size tests initially used the wrong close-button name. After using its actual accessible name, `Close dialog`, the affected vector/AI/lab/workflow suites passed all 45 tests. Following the final tool-disclosure replacement, vector/AI passed all 19 tests again.
- The browser checks exercise selection, completion, clipboard, disabled/controlled states, focus, keyboard, touch and narrow layouts. The new checks assert minimum icon sizes, square mobile badges and absence of horizontal overflow.
- `examples/native`: typecheck and Android/iOS Metro exports passed. Export success verifies bundling.

## Screens inspected and operated

Web: local production build in Chrome at 1440px and 390px, light/dark themes. Opened model selection, ran the local parser to success and completed the first Stepper stage. No page errors occurred in these captures.

| State                                   | Capture                                                      |
| --------------------------------------- | ------------------------------------------------------------ |
| Desktop selected model and dialog close | [1440px, light](./vector-icons-2026-10-27/web-model.png)     |
| Mobile selected model                   | [390px, dark](./vector-icons-2026-10-27/mobile-model.png)    |
| Parser success and SVG disclosure | [1440px, dark](./vector-icons-2026-10-27/web-tool-success.png) |
| Sticker vector decoration | [1000px, light](./vector-icons-2026-10-27/web-sticker.png) |
| Mobile completed Stepper                | [390px, light](./vector-icons-2026-10-27/mobile-stepper.png) |

Android: Android 15 ARM64 emulator, Expo Go 57.0.9, SDK 57 / RN 0.86.3. Existing display override 540 × 960px at density 210 (about 411pt wide) was preserved. Inspected the eight-icon row, activated its check action and dismissed the resulting Toast. Selected Team, then Personal, and reopened Select to confirm the corresponding vector check. Large-font captures use system font scale 1.5; original scale 1.0 was restored afterward. Both Mingu themes were inspected. Captures are raw emulator screenshots; the floating tools bubble belongs to Expo Go.

| State                           | Capture                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Icon row and Chip removal       | [Normal font](./vector-icons-2026-10-27/icons.png)                                                          |
| Select after changing its value | [Personal selected](./vector-icons-2026-10-27/selected-personal.png)                                        |
| Font scale 1.5                  | [Light](./vector-icons-2026-10-27/large-icons.png) · [Dark](./vector-icons-2026-10-27/large-dark-icons.png) |

## Verification boundary

This pass covers the listed screens and interactions. iPhone visual rendering, VoiceOver/TalkBack and the Apps-in-Toss runtime remain unverified. Native geometry preserves existing host dependencies; this change does not certify their host compatibility.
