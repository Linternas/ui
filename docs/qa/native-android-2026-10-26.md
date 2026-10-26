# Native Android UI verification — 2026-10-26

The Expo example was opened in a running Android emulator, inspected through unmodified screenshots, and operated with real taps, text entry, scrolling and slider drags. This is targeted visual and interaction verification, not a claim that every Native component and state has passed device testing.

## Environment

- Android 15, ARM64 emulator, 1080 × 1920 pixels, portrait.
- Expo Go 57.0.9; example Expo SDK 57, React Native 0.86.3.
- Light and dark Mingu themes; Android software keyboard and three-button system navigation.
- No emulator wipe, font scaling, rotation or system theme changes.

## Defects corrected

Screenshots below are raw emulator captures. The floating gear at the upper right is Expo Go's tools overlay. Android's system navigation strip and native date/time dialogs retain host styling.

| Observation                                                                                                      | Correction                                                                                                                                                                                        | Evidence                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A lower input was covered by the keyboard.                                                                       | Android keyboard avoidance; the example hides its bottom navigation while typing and restores it after dismissal. The focused field is visible; the error beneath it can be reached by scrolling. | [Before](./native-android-2026-10-26/lower-keyboard-settled-before.png) · [After, scrolled to error](./native-android-2026-10-26/keyboard-error-visible-after.png) |
| Select search and its options were covered by the keyboard.                                                      | Apply keyboard avoidance to modal surfaces and omit the bottom screen inset while the keyboard is visible.                                                                                        | [Before](./native-android-2026-10-26/select-search-keyboard-before.png) · [After](./native-android-2026-10-26/select-search-after.png)                             |
| The modal close glyph was clipped, and centered dialogs inherited unnecessary bottom inset.                      | Remove IconButton's forced aspect ratio and vertical padding; apply screen-bottom inset only to bottom sheets.                                                                                    | [Before](./native-android-2026-10-26/dialog-dark-before.png) · [After](./native-android-2026-10-26/dialog-after.png)                                               |
| Dark status-bar text was unreadable and Switch used the Android default blue thumb.                              | Set the example status-bar text from its theme and use semantic Switch thumb colors on Android.                                                                                                   | [Dark display after](./native-android-2026-10-26/final-dark-after.png)                                                                                             |
| Action feedback was below the long scrolling body.                                                               | Place the example Toast above the fixed navigation so the result is immediately visible.                                                                                                          | [Actual button feedback](./native-android-2026-10-26/feedback-after.png)                                                                                           |
| Stepper controls were narrower than 44 logical points; bottom-sheet actions were too close to system navigation. | Use IconButton for stepper controls; give bottom sheets content padding plus their safe inset.                                                                                                    | [Stepper and picker](./native-android-2026-10-26/final-date-committed.png) · [Bottom sheet](./native-android-2026-10-26/final-bottom-sheet.png)                    |
| Date/time selection raised the datetimepicker v9 deprecated callback warning over the app.                       | Use v9 value/dismiss callbacks while retaining the v8 peer callback path.                                                                                                                         | [Date changed to October 27 without warning](./native-android-2026-10-26/final-date-committed.png)                                                                 |

## Actions checked in the emulator

- Components / Inputs / More switch actual content. Header and bottom navigation remain fixed during body scrolling; the navigation hides for typing and returns afterward.
- Enter text into the lower validation input, scroll to its error, and dismiss the keyboard.
- Open Select, focus search, type `team`, and select Team; both the displayed workspace and its corresponding radio selection update.
- Drag the intensity slider from 35 to 77; increase quantity from 1 to 2. Final stepper bounds measure at least 44 logical points on this emulator.
- Open the native calendar and commit October 27, 2026. Open the time picker and cancel; 9:30 AM is retained. The final run uses the v9 callbacks.
- Open a dialog, type into its field with the keyboard visible, and activate Save. Open/close a bottom sheet and confirmation dialog.
- Open ActionSheet, tap a disabled item (sheet remains), then activate Duplicate sample (sheet closes and feedback appears).
- Switch internal Tabs to Details and expand the accordion; corresponding content appears.
- Inspect dark skeletons, avatar, badges, progress, navigation, text contrast and modal close glyphs. Activate a primary button and dismiss the resulting Toast.

## Automated checks

Run from the repository root:

```sh
npm run typecheck
npm run test:native
npm run build
```

Passed: Native 20 tests across two suites, strict Web and Native consumer declaration checks (the complete example compiles without DOM libraries), token consistency, package type checks and catalog build. The added checks cover keyboard/footer behavior, listener cleanup, visible feedback placement and datetimepicker v8 compatibility; current v9 date behavior remains covered.

Run from `examples/native`:

```sh
npm run typecheck
npx expo install --check
CI=1 npm run export:check
```

Passed: example types, Expo dependency alignment, Android and iOS Metro exports. An iOS export is a bundling check, not iPhone UI verification.

## Remaining scope

No iPhone or iOS simulator visual verification was performed. Landscape, larger system font settings, TalkBack/VoiceOver and every state of all 48 Native inventory entries remain outside this pass. Expo Go's tools bubble may cover the example AppBar's trailing action; explicit demo buttons were used to check the same overlays. Host system navigation and native date/time dialog colors were not customized.

To repeat the visual pass, run the Expo example on an Android emulator, open each of its three bottom tabs, then repeat the actions above with both Mingu themes. For iPhone readiness, repeat keyboard, safe-area, picker and modal checks on iOS hardware or a simulator.
