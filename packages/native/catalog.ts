/** Documentation inventory only. No React Native runtime imports in web Docs. */
export const nativeGroups = [
  {
    name: "Foundation",
    components: [
      "NativeProvider",
      "DesignSystemProvider",
      "Screen",
      "Stack",
      "Card",
      "Text",
      "Heading",
      "Divider",
      "Spacer",
    ],
    description: "테마, 안전 영역, 키보드 회피, 기본 레이아웃과 타이포그래피",
  },
  {
    name: "Actions",
    components: ["Button", "IconButton", "LinkButton"],
    description: "44pt 이상 터치 영역, 로딩·비활성 상태, Native press 이벤트",
  },
  {
    name: "Forms",
    components: [
      "Input",
      "Field",
      "TextField",
      "TextareaField",
      "PasswordField",
      "SearchField",
      "NumberField",
      "OtpInput",
      "Checkbox",
      "Switch",
      "RadioGroup",
      "SegmentedControl",
      "Select",
      "NumberStepper",
      "Slider",
      "DatePicker",
      "TimePicker",
    ],
    description: "라벨·힌트·오류, 제어 상태, 실제 Native 입력과 날짜·시간 선택",
  },
  {
    name: "Display",
    components: ["Avatar", "Badge", "Chip", "ListItem", "Accordion"],
    description: "프로필 fallback, 상태 태그, 목록과 접기",
  },
  {
    name: "Feedback",
    components: [
      "Spinner",
      "Skeleton",
      "Progress",
      "Alert",
      "EmptyState",
      "ErrorState",
      "Toast",
    ],
    description: "로딩·진행률·오류·빈 상태와 앱이 수명을 정하는 알림",
  },
  {
    name: "Navigation",
    components: ["AppBar", "Tabs", "BottomNavigation"],
    description: "선택 상태·화면 내용 연결, 앱이 관리하는 라우팅",
  },
  {
    name: "Overlays",
    components: ["Dialog", "AlertDialog", "BottomSheet", "ActionSheet"],
    description: "Native Modal, 뒤로 가기, 키보드 회피와 하단 안전 영역",
  },
] as const;
export const nativeAddedAt = "2026-10-26";
export const nativeQuickStart = `import { useState } from 'react';
import { NativeProvider, Screen, Heading, TextField, Button } from '@mingu/interaction-ui/native';

export default function App() {
  const [name, setName] = useState('');
  return (
    <NativeProvider theme="system" accent="neutral">
      <Screen>
        <Heading>새 프로젝트</Heading>
        <TextField label="이름" value={name} onChangeText={setName} />
        <Button disabled={!name.trim()} onPress={() => console.log(name)}>시작하기</Button>
      </Screen>
    </NativeProvider>
  );
}`;

export const nativeCatalog = nativeGroups.flatMap((group) =>
  group.components.map((name) => ({
    id: `native-${name}`,
    name,
    group: group.name,
    addedAt: nativeAddedAt,
  })),
);
export function nativeReleaseIsNew(now = Date.now()) {
  const start = Date.parse(`${nativeAddedAt}T00:00:00Z`);
  return Number.isFinite(now) && now >= start && now < start + 30 * 86400000;
}
