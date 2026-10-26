# Mingu Native

React Native core UI for iOS and Android. The `@mingu/interaction-ui/native` entry uses Native views and controls; it imports no web UI, CSS, canvas or DOM. Existing web entry points remain compatible. `SelectField` is an alias of Native `Select`.

## Install

Use a verified commit SHA:

```sh
npm install 'git+https://github.com/Linternas/ui.git#<commit-sha>'
# Expo: choose native module versions that match your application's Expo SDK.
npx expo install react-native-safe-area-context @react-native-community/datetimepicker @react-native-community/slider
```

A bare React Native app installs those three dependencies with its package manager, then runs the app's usual CocoaPods/autolinking and native rebuild steps. These modules are optional peers for web consumers and required for Native consumers. The Native entry has a React Native peer range of >=0.83 and React >=19; choose the React version required by your app's React Native release. The current automated runtime/type baseline is React Native 0.88.0, React 19.3.1, safe-area-context 5.10.1, datetimepicker 9.2.2 and slider 5.2.2. Other SDK combinations require their own app validation.

Do not import CSS or the package's web root in a Native screen. Import every component from the explicit Native entry:

```tsx
import { useState } from 'react';
import {
  NativeProvider, Screen, Heading, TextField, Button,
} from '@mingu/interaction-ui/native';

export default function App() {
  const [name, setName] = useState('');
  return (
    <NativeProvider theme="system" accent="neutral">
      <Screen>
        <Heading>새 프로젝트</Heading>
        <TextField label="이름" value={name} onChangeText={setName} />
        <Button disabled={!name.trim()} onPress={() => console.log(name)}>
          시작하기
        </Button>
      </Screen>
    </NativeProvider>
  );
}
```

[examples/native](./examples/native/README.md) is a runnable Expo app with a complete, interactive Native showcase. It includes theme switching, forms, choices, date/time controls, tabs, local notifications and all overlay variants. It has no API, account or storage dependencies. The Native inventory was added on 2026-10-26 UTC; its New badges expire after 30 days. The Web catalog has installation and inventory documentation at `/native`; it does not substitute a browser rendering for a Native device preview.

## Preview on your phone

The preview targets **Expo SDK 57**. Use an Expo Go build that supports SDK 57 on your iOS or Android phone, then run the standalone example:

```sh
git clone https://github.com/Linternas/ui.git
cd ui/examples/native
npm ci
npm start
```

Use Node 22. No root `npm install` is needed for this example. Scan the terminal QR code with the iPhone camera or Expo Go on Android. Keep the computer and phone on the same Wi-Fi. If Expo Go requests account authentication on iOS, sign in to the same Expo account in the CLI and Expo Go. The app includes light/dark switching and interactive input, selection, navigation, state and overlay examples; all data stays local to the preview.

For network restrictions, try `npm start -- --tunnel` (Expo may ask to install its tunnel helper). `npm run ios` and `npm run android` target a locally configured simulator/emulator. `/native` on the website is documentation; the QR opens the actual React Native app. See the [example README](./examples/native/README.md) and [Expo development instructions](https://docs.expo.dev/get-started/start-developing/).

The example owns its Expo SDK 57-compatible dependency versions and lockfile (React 19.2.3 / React Native 0.86.3), independently of the root library test baseline. Metro reads this repository's Native source directly and resolves runtime dependencies from the example, so Web development's React version is not mixed into the app. `npm run typecheck` and `npm run export:check` inside the example validate types and both platform bundles; these checks do not verify device rendering or OS behavior.

If Expo Go reports `Project is incompatible with this version of Expo Go`, compare the supported SDK shown on the device with the example's SDK 57. Wi-Fi connectivity does not resolve a native runtime mismatch. Align the dependency set, reinstall and restart Metro with `npm start -- --clear`; do not override `sdkVersion` to disguise the mismatch. See [Expo's version mismatch guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

## Shared design and structure

- `packages/tokens/src/index.ts`: platform-neutral colors, spacing, radii, typography and motion values. `@mingu/interaction-ui/tokens` exports `tokens`, `getColors` and token types without a React dependency.
- `scripts/sync-tokens.mjs`: writes shared values into the existing `tokens.css`. `npm run tokens:check` rejects drift. Web-only responsive typography, CSS media rules, aliases and shadows stay in CSS. Native dimensions use logical points; web spacing/type use rem at a 16px base.
- `packages/native/src/`: Native implementation, public props and hooks. It does not re-export the web library.
- `packages/native/catalog.ts`: runtime-free documentation inventory. Native additions do not inflate the web component count.
- Root package exports keep Git dependency/submodule installation usable without a second registry package. The source directories can be extracted later; their implementation is independent of the Web catalog.

## Theme, layout and typography

| Component | Props and behavior |
| --- | --- |
| `NativeProvider` | Convenience root: SafeAreaProvider + DesignSystemProvider. `theme="system"\|"light"\|"dark"`, `accent="brand"\|"neutral"`, `colors?:Partial<ColorTokens>`, `reducedMotion?:boolean`. Mount once above app navigation. |
| `DesignSystemProvider` | Same theme props; no wrapper View or extra safe-area provider. Use when the app already owns SafeAreaProvider. Nested themes remain scoped. OS color scheme and reduced-motion changes are observed and listeners are cleaned up. |
| `useTheme` | Returns `{colors,mode,reducedMotion}`. Throws outside a provider. No storage or global theme mutation. |
| `Screen` | `scroll=true`, `safeEdges=[top,bottom,left,right]`, `keyboardAvoiding=true`, `keyboardVerticalOffset=0`, `padding="4"`, native ScrollView props. `refreshing/onRefresh` control pull-to-refresh. iOS uses keyboard padding; Android keeps the app's window/keyboard configuration. `scroll=false` uses a flex View. Native scroll content props only apply to scroll mode. |
| `Stack` | Native View props, `direction=row\|column`, `gap` token key, `align=start\|center\|end\|stretch`, `justify=start\|center\|end\|between`, `wrap`. |
| `Card` | Native View props, `padding` token key; themed surface/border and rounded corners. |
| `Text` | Native Text props/ref, `size=xs\|sm\|md\|lg\|xl\|2xl`, `tone=default\|muted\|accent\|danger\|success\|warning`, `weight=regular\|medium\|semibold\|bold`. Native font scaling remains enabled. |
| `Heading` | Text props, `level=1\|2\|3`, header accessibility role. Level chooses the default text size; Native is not an HTML heading hierarchy. |
| `Divider`, `Spacer` | Decorative View separator and token spacing. Spacer `size="4"`. |

Avoid double safe-area padding: place a standalone BottomNavigation outside a scrolling Screen or disable its `safeArea` when Screen already handles the bottom edge. Apps with React Navigation/Expo Router own actual navigation, status bars, route transitions and existing safe-area providers.

## Actions

`Button` accepts Native Pressable props and ref, `variant=primary|secondary|outline|ghost|danger`, `size=sm|md|lg`, `loading`, `icon`, `textStyle`. Touch height is at least 44 logical points even for `sm`; larger font content can grow it. `loading` exposes busy state and prevents duplicate presses. Native `onPress`, `onLongPress`, `accessibilityLabel`, `accessibilityHint`, `testID` and style callbacks are retained. Text children are wrapped in Native Text; custom ReactNode children must be valid Native content.

`IconButton` requires `label` and a Native icon/Text child. `LinkButton` uses link accessibility semantics and `onPress`; the consumer owns Linking/navigation and success/failure. No link or business mutation is executed automatically.

## Forms and choices

There is no HTML form or FormData on Native. The app owns validation, submitting, reset and persistence. `required` labels required fields and adds a spoken hint; it does not implement an application validation rule. `error` is visible and included in the input's accessibility hint. Native controls retain platform keyboard, autofill and selection behavior.

| Component | Props and behavior |
| --- | --- |
| `Input` | Native TextInput props/ref, `controlSize`, `invalid`, `editable`. Uses a 16pt input font, focused border and semantic colors. Pass native keyboard/autofill/contentType props appropriate to your app. |
| `Field` | `label`, `hint`, `error`, `required`, `children`, `style`: presentation wrapper for custom controls. |
| `TextField` | Input props + Field props; `containerStyle` styles the wrapper, `style` the TextInput. Label and description become accessibility label/hint. |
| `TextareaField` | TextField with multiline, top alignment and minimum height. |
| `PasswordField` | TextField with secure entry and explicit Show/Hide; `showLabel/hideLabel` are localizable. Native ref and input callbacks remain intact. |
| `SearchField`, `NumberField` | TextField presets for search/decimal keyboard. NumberField keeps string state; parsing, decimal separators and domain validation belong to the app. |
| `OtpInput` | TextField props, `value/defaultValue`, `onValueChange(string)`, `onComplete(code)`, `length=6` (4–10), `secure=false`. One real input preserves paste/autofill/caret. Non-digits are stripped; code is bounded to length. Completion is emitted once per complete code until edited shorter or changed. It does not verify a code with a server. |
| `Checkbox` | `label`, `checked/defaultChecked=false`, `onCheckedChange`, `indeterminate`, `disabled`, `hint`, `style`, `testID`. Native press target exposes checkbox checked/mixed state. |
| `Switch` | Native Switch props including controlled `value/onValueChange`, plus `label`, `hint`, `containerStyle`. Native switch rendering and accessibility are retained. |
| `RadioGroup` | `label`, `options`, `value/defaultValue`, `onValueChange`, `disabled`, `style`. Native press targets expose radio states. |
| `SegmentedControl` | Same choice API; wraps options on narrow screens/large text. Initial selection skips disabled options. |
| `Select` / `SelectField` | Same choice API + `placeholder`, `searchable`, `searchLabel`, `emptyLabel`, `closeLabel`, `hint/error/required`. Opens a Native bottom sheet, searches local options, exposes selected/disabled radio states and commits one value. FlatList virtualizes the result list; it is not nested inside another ScrollView. The alias has the same implementation. |
| `NumberStepper` | `label`, `value/defaultValue`, `onValueChange`, `min=0`, `max=100`, `step=1`, `disabled`, `decreaseLabel/increaseLabel`. Plus/minus controls clamp finite values to bounds. |
| `Slider` | `label`, `value/defaultValue`, `onValueChange`, `min=0`, `max=100`, `step=1`, `formatValue`, remaining Native slider props. Real iOS slider / Android SeekBar; accessible value and disabled behavior. Values are bounded, then committed by the caller when controlled. |
| `DatePicker`, `TimePicker` | `label`, `value/defaultValue:Date`, `onValueChange(Date)`, `minimumDate/maximumDate` (date only), `locale`, `disabled`, `hint/error`, `confirmLabel/cancelLabel`, `style`. Native date/time UI; iOS uses a draft with explicit Done/Cancel. Android commits only a set event and ignores dismissal. It does not convert timezones; valid Date values and ordered bounds are caller requirements. |

Choice options: `{value:string,label:string,description?:string,disabled?:boolean}` with unique values. Controlled components emit requested changes; the caller must update the value to accept them. Selection values should reference current options. A selected value is preserved when a disabled option remains selected. `Select` supports one open modal per instance; apps should avoid stacking independent overlays.

## Display and feedback

| Component | Props and behavior |
| --- | --- |
| `Avatar` | `name`, `source?:ImageSourcePropType`, `size=44` (24–120), `style`; initials fallback on missing/failed image, reset when source changes, accessible image name. |
| `Badge` | `children:string|number`, semantic `tone`, `style`. |
| `Chip` | `label`, `selected`, `onPress`, `onRemove`, `removeLabel`, `disabled`; separate selection/removal targets. Caller applies removal. |
| `ListItem` | `title`, `description`, `leading/trailing`, `onPress`, `disabled`, `style`, `accessibilityLabel`; static View or pressable row. |
| `Accordion` | `title`, `children`, `open/defaultOpen`, `onOpenChange`, `disabled`. Collapsed content is unmounted, removing it from accessibility/focus. Consumer owns any state that must survive collapse. |
| `Spinner` | `label`, `size`; Native ActivityIndicator with busy state. |
| `Skeleton` | `width`, `height`, `rounded`, View props/style; themed static placeholder, excluded from accessibility. Does not introduce a continuous animation. |
| `Progress` | `label`, `value=0`, `max=100`, `indeterminate=false`; bounded progress accessibility value, Native spinner when indeterminate. No fabricated progress or timer. |
| `Alert` | `title`, `description`, semantic `tone`, `action:ReactNode`, `onDismiss`, `dismissLabel`; polite live region. |
| `EmptyState`, `ErrorState` | EmptyState: `title`, `description`, `icon`, `action`. ErrorState: optional `title/description`, `onRetry`, `retryLabel`. Retry calls the app. |
| `Toast` | `messages:{id,title,description?,tone?,action?:{label,onPress}}[]`, `onDismiss(id)`, `dismissLabel`. Controlled inline host; caller determines lifetime, safe-area placement and actual undo state. No automatic dismissal of important content. |

## Navigation and overlays

`AppBar`: `title`, `subtitle`, `onBack`, `backLabel`, `leading/trailing`, `style`. Back is an explicit callback, not an embedded router.

`Tabs` / `BottomNavigation`: `label`, `items:{value,label,icon?,badge?,disabled?,content?}[]`, `value/defaultValue`, `onValueChange`, `disabled`, `style`. Tabs mounts only the selected content. BottomNavigation emits route/tab choice; the app owns actual screens. Its `safeArea=true` applies the bottom inset; use false inside an already padded Screen.

`Dialog` / `BottomSheet`: controlled `open/onOpenChange`, required `title`, optional `description`, `children`, `closeLabel`, `dismissible=true`, `returnFocusRef`, `style`, `testID`, `scrollable=true`. Both use React Native Modal, Android `onRequestClose`, iOS accessibility escape and a separate modal safe-area provider. Keyboard avoidance, bounded scrolling and modal accessibility isolation are applied. `scrollable=false` is for an embedded FlatList/ScrollView. Reduced motion removes the transition. `returnFocusRef` requests accessibility focus on a retained native trigger after closing; verify timing with VoiceOver/TalkBack in the consuming app. BottomSheet is a content sheet with explicit dismissal; it does not implement gesture detents or swipe physics.

`AlertDialog`: Dialog props + `onConfirm`, `confirmLabel`, `cancelLabel`, `loading`, `destructive`, `error`. Loading disables actions and dismissal. Caller performs the operation, reports actual errors and closes on success; the component never infers successful deletion.

`ActionSheet`: BottomSheet props + `items:{id,label,onPress,disabled?,destructive?,icon?}[]`. Dismisses before calling an enabled action; apps can then open another workflow. No OS action or external message is triggered implicitly.

## Verify and integrate

```sh
npm run tokens:check
npm run typecheck
npm run test:native
npm run build
```

The JavaScript tests use React Native's official Jest preset and React Native Testing Library. OS date/slider host boundaries and safe-area measurements are mocked in Node; this verifies component logic and composition, not native OS rendering. No iOS simulator is available in the implementation environment. Before shipping an app, run the included showcase on its actual iOS and Android targets, including device font scaling, keyboard, bottom inset, VoiceOver/TalkBack, back dismissal and date/time controls. No claim of device verification is made by the Node tests.

Official integration references: [React Native accessibility](https://reactnative.dev/docs/accessibility), [Modal](https://reactnative.dev/docs/modal), [Pressable](https://reactnative.dev/docs/pressable), [safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context), [datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker), [slider](https://github.com/callstack/react-native-slider), [Native testing](https://reactnative.dev/docs/testing-overview).
