import { useState } from "react";
import {
  DesignSystemProvider,
  TextField,
  TextareaField,
  SelectField,
  Button,
  Switch,
  Alert,
  Stack,
  Heading,
  Text,
  SegmentedControl,
  type Theme,
} from "@mingu/interaction-ui/system";
import { CodeBlock } from "@mingu/interaction-ui";

type Size = "sm" | "md" | "lg";
type State = "default" | "invalid" | "disabled" | "readonly";

export default function ControlWorkbench({ theme }: { theme: Theme }) {
  const [size, setSize] = useState<Size>("md");
  const [state, setState] = useState<State>("default");
  const [accent, setAccent] = useState<"neutral" | "brand">("neutral");
  const [confirmed, setConfirmed] = useState(false);
  const [visibility, setVisibility] = useState("private");
  const invalid = state === "invalid",
    disabled = state === "disabled",
    readOnly = state === "readonly";
  const fieldState = invalid
    ? '\n  error="이름을 다시 확인해주세요."'
    : disabled
      ? " disabled"
      : readOnly
        ? " readOnly"
        : "";
  const code = `import { DesignSystemProvider, TextField, Button } from '@mingu/interaction-ui/system';
import '@mingu/interaction-ui/system.css';

<DesignSystemProvider theme="${theme}" accent="${accent}">
  <TextField label="워크스페이스" controlSize="${size}"
    defaultValue="mingu" trailing=".mingu.xyz"
    hint="영문 소문자와 숫자로 입력하세요."${fieldState} />
  <Button size="${size}"${disabled ? " disabled" : ""}>계속하기</Button>
</DesignSystemProvider>`;
  return (
    <Stack gap={8}>
      <Text muted size="sm">
        크기와 상태를 바꾸면 실제 컴포넌트와 사용 코드가 함께 바뀝니다.
      </Text>
      <div className="ui-control-toolbar">
        <SelectField
          label="크기"
          value={size}
          controlSize="sm"
          onChange={(e) => setSize(e.target.value as Size)}
        >
          <option value="sm">Small · 36px</option>
          <option value="md">Medium · 44px</option>
          <option value="lg">Large · 48px</option>
        </SelectField>
        <SelectField
          label="입력 상태"
          value={state}
          controlSize="sm"
          onChange={(e) => setState(e.target.value as State)}
        >
          <option value="default">Default</option>
          <option value="invalid">Invalid</option>
          <option value="disabled">Disabled</option>
          <option value="readonly">Read only</option>
        </SelectField>
        <SegmentedControl
          label="강조색"
          value={accent}
          onValueChange={(value) => setAccent(value as "neutral" | "brand")}
          options={[
            { value: "neutral", label: "Neutral" },
            { value: "brand", label: "Brand" },
          ]}
        />
      </div>
      <DesignSystemProvider
        theme={theme}
        accent={accent}
        className="ui-control-canvas"
      >
        <div className="ui-control-live" aria-label="Live controls">
          <TextField
            label="워크스페이스"
            controlSize={size}
            defaultValue="mingu"
            trailing=".mingu.xyz"
            disabled={disabled}
            readOnly={readOnly}
            error={invalid ? "이름을 다시 확인해주세요." : undefined}
            hint="영문 소문자와 숫자로 입력하세요."
          />
          <div className="ui-control-actions">
            <Button size={size} disabled={disabled}>
              계속하기
            </Button>
            <Button size={size} variant="secondary" disabled={disabled}>
              취소
            </Button>
          </div>
        </div>
      </DesignSystemProvider>
      <CodeBlock filename="controls.tsx" language="tsx" code={code} />
      <section className="ui-control-section" aria-label="Field states">
        <Heading level={2} size="lg">
          Field states
        </Heading>
        <Text muted size="sm">
          오류·읽기 전용·비활성 상태는 같은 규격 안에서 구분합니다.
        </Text>
        <div className="ui-control-states">
          <TextField
            label="Default"
            placeholder="프로젝트 이름"
            controlSize={size}
            hint="짧고 명확한 이름을 사용하세요."
          />
          <TextField
            label="Invalid"
            defaultValue="my project!"
            controlSize={size}
            error="공백과 특수문자는 사용할 수 없어요."
          />
          <TextField
            label="Read only"
            defaultValue="mingu-ui"
            controlSize={size}
            readOnly
            hint="선택하고 복사할 수 있어요."
          />
          <TextField
            label="Disabled"
            defaultValue="mingu-ui"
            controlSize={size}
            disabled
            hint="현재 변경할 수 없어요."
          />
        </div>
      </section>
      <section className="ui-control-section" aria-label="Form composition">
        <Heading level={2} size="lg">
          한 화면에서 사용하기
        </Heading>
        <Text muted size="sm">
          레이블, 도움말, 입력 높이와 액션을 실제 폼에서 확인합니다.
        </Text>
        <form
          className="ui-control-form"
          onChange={() => setConfirmed(false)}
          onSubmit={(event) => {
            event.preventDefault();
            setConfirmed(true);
          }}
        >
          <TextField
            label="프로젝트 이름"
            name="project"
            defaultValue="My website"
            required
            controlSize={size}
            hint="사이트에 표시할 이름입니다."
          />
          <SelectField
            label="공개 범위"
            name="visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            controlSize={size}
            hint={
              visibility === "private"
                ? "초대받은 사람만 볼 수 있습니다."
                : "링크가 있는 누구나 볼 수 있습니다."
            }
          >
            <option value="private">비공개</option>
            <option value="public">공개</option>
          </SelectField>
          <TextareaField
            label="프로젝트 설명"
            name="description"
            rows={3}
            maxLength={200}
            controlSize={size}
            placeholder="어떤 프로젝트인가요?"
            hint="최대 200자까지 입력할 수 있어요."
          />
          <Switch name="updates" defaultChecked>
            업데이트 알림 받기
          </Switch>
          <div className="ui-control-actions">
            <Button
              type="submit"
              size={size}
              status={confirmed ? "success" : "idle"}
            >
              {confirmed ? "입력 확인됨" : "입력 확인"}
            </Button>
            <Text muted size="sm">
              이 미리보기는 서버에 저장하지 않습니다.
            </Text>
          </div>
          {confirmed && (
            <Alert tone="success" role="status">
              필수 입력과 브라우저 유효성 검사를 통과했습니다.
            </Alert>
          )}
        </form>
      </section>
    </Stack>
  );
}
