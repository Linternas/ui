"use client";
import { useState } from "react";
import Link from "./routing";
import {
  Card,
  Grid,
  Stack,
  Heading,
  Text,
  Button,
  Badge,
  TextField,
  Switch,
  Alert,
  Separator,
  AnimatedCounter,
  NotificationBell,
} from "@mingu/interaction-ui";
export default function FoundationPreview() {
  return (
    <Stack gap={8}>
      <Text muted>
        차분한 기본 화면 위에 목적이 분명한 인터랙션을 조합합니다. 모든
        컴포넌트가 같은 토큰과 테마를 사용합니다.
      </Text>
      <div className="ui-token-grid">
        {[
          "bg",
          "surface",
          "raised",
          "text",
          "muted",
          "border",
          "accent",
          "success",
          "warning",
          "danger",
        ].map((role) => (
          <div key={role}>
            <span style={{ background: `var(--mingu-${role})` }} />
            <code>{role}</code>
          </div>
        ))}
      </div>
      <Grid min="13rem">
        <Card>
          <Stack>
            <Heading level={2} size="lg">
              Typography
            </Heading>
            <Heading level={3} size="xl">
              Aa 가나다
            </Heading>
            <Text>읽기 좋은 본문.</Text>
            <Text muted size="sm">
              명확한 정보 위계.
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack>
            <Heading level={2} size="lg">
              Spacing
            </Heading>
            {[1, 2, 3, 4, 6, 8, 12].map((space) => (
              <div className="ui-space-row" key={space}>
                <code>{space}</code>
                <span style={{ width: `var(--mingu-space-${space})` }} />
              </div>
            ))}
          </Stack>
        </Card>
        <Card>
          <Stack>
            <Heading level={2} size="lg">
              Shape & motion
            </Heading>
            <Stack direction="row">
              {["sm", "md", "lg"].map((radius) => (
                <div
                  key={radius}
                  className="ui-radius"
                  style={{ borderRadius: `var(--mingu-radius-${radius})` }}
                >
                  {radius}
                </div>
              ))}
            </Stack>
            <Text size="sm" muted>
              120 / 200ms · reduced motion
            </Text>
          </Stack>
        </Card>
      </Grid>
      <Stack direction="row" gap={3}>
        <Link
          className="mingu-button mingu-button-primary mingu-control-md"
          href="/lab/ui/button"
        >
          Button
        </Link>
        <Link
          className="mingu-button mingu-button-secondary mingu-control-md"
          href="/lab/ui/input"
        >
          Input
        </Link>
        <Link
          className="mingu-button mingu-button-secondary mingu-control-md"
          href="/lab/ui/patterns"
        >
          Product patterns →
        </Link>
      </Stack>
    </Stack>
  );
}
export function PatternPreview() {
  const [count, setCount] = useState(12),
    [unread, setUnread] = useState(3),
    [saved, setSaved] = useState(false);
  return (
    <Grid min="16rem">
      <Card>
        <Stack gap={6}>
          <Stack direction="row" align="center">
            <Badge tone="accent">WORKSPACE</Badge>
            <NotificationBell count={unread} onClick={() => setUnread(0)} />
          </Stack>
          <Heading level={2} size="lg">
            My next website
          </Heading>
          <Text muted size="sm">
            기본 카드와 액션에 상태 전환을 조합합니다.
          </Text>
          <div className="ui-pattern-counter">
            <AnimatedCounter value={count} />
            <Text muted size="sm">
              완료한 작업
            </Text>
          </div>
          <Button
            onClick={() => {
              setCount((value) => value + 1);
              setUnread((value) => value + 1);
            }}
          >
            작업 완료
          </Button>
        </Stack>
      </Card>
      <Card>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <Stack>
            <Heading level={2} size="lg">
              Project settings
            </Heading>
            <TextField
              label="프로젝트 이름"
              name="name"
              required
              defaultValue="My website"
            />
            <TextField
              label="이메일"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
            />
            <Switch defaultChecked>업데이트 알림</Switch>
            <Separator />
            <Button type="submit">설정 미리보기</Button>
            {saved && (
              <Alert tone="success" role="status" title="폼 확인 완료">
                입력한 설정이 유효합니다.
              </Alert>
            )}
          </Stack>
        </form>
      </Card>
    </Grid>
  );
}
