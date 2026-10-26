# Native planning controls — 2026-10-26

## Scope and baseline

The consumer request referenced `cc6426868e3aa4a68d8b89e70d56c63a475302c2`. Before this work, `83fea64` had already corrected IconButton clipping, some keyboard/safe-area layout and datetimepicker v9 callbacks. This release builds on those changes; it does not claim they were all still absent.

Implemented in the library: **P0 and P1**. The source of the consuming `alba-calendar/native` app and its installed pin were not modified. The library example adds a Planning tab with real controls and an app-owned dirty/busy modal demonstration. P2 DurationField, TimeRangeField and FormStepper remain follow-up work after P0/P1 consumer adoption, as requested. Drag/snap behavior remains deferred.

## Implementation map

| Requirement              | Result                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IconButton / CloseButton | Separate visual slot and minimum 44pt target, no flex compression; font-independent View icons. Dialog, BottomSheet and Select share CloseButton through the same modal surface.                                                                                                                           |
| Long forms               | Fixed, separately bounded scrolling footer; content/large/fullscreen sizing; maxHeight; request-only close reasons; dirty/busy state remains app-owned. A long header has a bounded independent scroll area. Existing safe area, keyboard avoidance, accessibility isolation and return-focus APIs remain. |
| Nullable dates           | Compatible Date callback plus nullable overload; placeholder, clear, locale/format callback and Intl format. Opening/canceling never commits today's temporary seed.                                                                                                                                       |
| MoneyField               | Raw string edits, grouping only on blur, optional decimals/sign button/unit, range errors without clamping. Native text selection is not controlled by the library.                                                                                                                                        |
| MonthPicker              | Explicit year/month, adjacent-month commits, draft panel, bounds and cancellation.                                                                                                                                                                                                                         |
| DateRangePicker          | Inclusive civil-date endpoints, partial/empty/same-day ranges, reverse tap ordering and canceled drafts.                                                                                                                                                                                                   |
| Calendar                 | Civil-date identity, leap-year/month arithmetic, month/today navigation, selected/disabled states, event overflow/custom rendering and date accessibility labels. Small cells keep 44pt targets using horizontal scrolling when needed.                                                                    |
| WeekdayPicker            | Multiple selection and external presets, disabled-day preservation, Sunday-first value contract, reorderable labels and wrapping targets.                                                                                                                                                                  |
| Large-font observation   | The existing Checkbox glyph clipped at enlarged text. Its decorative check/mixed marks now use View geometry; the actual label continues to scale.                                                                                                                                                         |

[API and migration contracts](../../NATIVE.md#calendar-ranges-and-amount-editing-026).

## Actual Android verification

Android 15 ARM64 emulator, Expo Go 57.0.9, example Expo SDK 57 / RN 0.86.3. Default 1080 × 1920 pixels at density 420 (about 411pt wide), plus a temporary 840 × 1920 configuration (320pt wide) with `font_scale=1.5`. The size and font settings were restored to physical 1080 × 1920 / font scale 1.0 after each run, including a failed attempt. Configuration changes restart the example and reset local state; the showcase was reopened before capturing the narrow results.

All evidence below is an unmodified Android screenshot, not a browser simulation:

| Real interaction or inspection                                                                                                                                                     | Evidence                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial nullable date is Not entered; amount is grouped.                                                                                                                           | [Planning](./native-planning-2026-10-26/p1-planning-dark.png)                                                                                            |
| Choose November in the month panel and Apply; selected month updates.                                                                                                              | [Month committed](./native-planning-2026-10-26/p1-month-applied.png)                                                                                |
| Tap October 28 then October 26; range is ordered and Apply shows October 26–28.                                                                                                    | [Range draft](./native-planning-2026-10-26/p1-range-reversed.png) · [Committed range and weekdays](./native-planning-2026-10-26/p1-weekdays.png)    |
| Focus the third input in a long form and enter Android-QA; Save remains above the software keyboard.                                                                               | [Keyboard and fixed footer](./native-planning-2026-10-26/p1-long-typed.png)                                                                         |
| Request Close, then press Android Back; the form stays open and receives the reason.                                                                                               | [Hardware back veto](./native-planning-2026-10-26/p1-hardware-veto.png)                                                                             |
| Focus amount 10320, move the native cursor to its middle and insert 9; 109320 appears. Leave/reopen the tab: 109,320 is displayed.                                                 | [Native middle edit](./native-planning-2026-10-26/p1-money-middle.png) · [Grouped value retained](./native-planning-2026-10-26/p1-null-cleared.png) |
| Open an empty date, Cancel, reopen and explicitly select October 27, then Clear. Empty state returns.                                                                              | [Cleared date](./native-planning-2026-10-26/p1-null-cleared.png)                                                                                    |
| At 320pt/font scale 1.5, event overflow is +2, weekdays wrap and weekday preset changes checked state. Calendar permits horizontal scrolling below its minimum seven-column width. | [Calendar](./native-planning-2026-10-26/p1-narrow-calendar.png) · [Weekday preset](./native-planning-2026-10-26/p1-narrow-weekdays.png)             |
| At 320pt/font scale 1.5, the long header wraps, the close icon stays intact and the fixed action remains reachable. Checkbox's corrected mark is intact.                           | [Long form](./native-planning-2026-10-26/p1-narrow-large-sheet-fixed.png)                                                                           |

[Full-screen form](./native-planning-2026-10-26/p1-fullscreen-final.png) and [dark month panel](./native-planning-2026-10-26/p1-month-dark.png) were also opened and inspected. The existing searchable [Select sheet](./native-planning-2026-10-26/p1-select-final.png) was reopened with its disabled option and the shared CloseButton visible.

The floating gear is Expo Go's tools overlay, which can cover the AppBar trailing action. The example's explicit buttons were used. System date dialogs and Android navigation chrome keep host styling.

## Automated verification

Passed from the repository root:

```sh
npm run typecheck
npm run test:native
npm run typecheck:docs
npm run build
PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/native-docs.spec.ts
```

- 31 Native tests across three suites. New coverage includes geometry close behavior, close reason veto/disabled routes, body/footer separation, null/clear/cancel DatePicker, string money edits and range errors, leap years/year boundaries, calendar selection/disabled/overflow, month cancellation and year transition, reverse/same-day/partial date ranges and disabled weekday presets.
- Strict Web and Native declaration consumers compile; the full Expo example compiles without DOM libraries. No web/CSS dependencies enter the Native graph. Existing datetimepicker v8 callback compatibility and v9 behavior remain covered.
- Three Native documentation browser tests pass at desktop and 320px, including inventory separation from 200 Web entries, New expiry, theme and overflow.

Passed from `examples/native`:

```sh
npm run typecheck
npx expo install --check
CI=1 npm run export:check
```

Expo's dependency check used its local SDK bundled-module map because network validation was unavailable; no dependency versions changed in this release. Both Android and iOS Metro exports passed. iOS export is not iPhone visual verification.

## Limits and next adoption checks

No iPhone/iOS simulator, TalkBack/VoiceOver, landscape, every font scale, every width from 320–430pt, or every state of all Native entries was tested. Narrow calendar layout uses horizontal scrolling and does not promise all seven 44pt columns fit inside a padded 320pt container. Extremely small custom maxHeight values require consumer testing. Native focus restoration remains to be tested with assistive technology.

No Granite/Toss runtime was installed or validated. The [official Apps in Toss guide](https://developers-apps-in-toss.toss.im/ai-vibe-coding/tutorials/react-native) restricts native-module libraries to host-supported modules and requires Granite 1.x. This release adds no package/native module; the aggregate Native entry's existing peers still require compatibility checks. Expo success does not establish Toss support.

For the consumer: pin this release's actual commit, replace Amount/Weekdays/DateField wrappers with explicit empty-value contracts, wire footer/dirty/busy behavior, adapt civil dates at the app boundary, and repeat its real editor workflows. Domain validation, storage, wage calculations and successful saving remain the app's responsibility. iPhone confirmation should be recorded separately by the user.
