import { useEffect, useState } from "react";
import {
  DesignSystemProvider,
  Heading,
  Text,
  Card,
  Stack,
  Badge,
  Select,
  type Theme,
} from "../../src/system";
import { CodeBlock } from "../../src/CodeBlock";
import {
  nativeGroups,
  nativeQuickStart,
  nativeReleaseIsNew,
} from "../../packages/native/catalog";
import Link from "./routing";
import "./native-page.css";
export default function NativePage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mingu-ui-theme");
      if (saved === "light" || saved === "dark" || saved === "system")
        setTheme(saved);
    } catch {}
  }, []);
  return (
    <DesignSystemProvider
      theme={theme}
      accent="neutral"
      className="native-docs"
    >
      <header>
        <Link href="/">Mingu UI</Link>
        <nav aria-label="Native documentation">
          <Link href="/all">Web components</Link>
          <Link href="/native" aria-current="page">
            Native
          </Link>
          <a
            href="https://github.com/Linternas/ui/blob/main/NATIVE.md"
            target="_blank"
            rel="noreferrer"
          >
            API ↗
          </a>
          <Select
            aria-label="Native docs theme"
            value={theme}
            onChange={(e) => {
              const next = e.target.value as Theme;
              setTheme(next);
              try {
                sessionStorage.setItem("mingu-ui-theme", next);
              } catch {}
            }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </nav>
      </header>
      <main>
        <section className="native-docs-intro">
          <Badge tone="accent">REACT NATIVE</Badge>
          <Heading level={1}>Made for touch.</Heading>
          <Text>
            같은 디자인 언어로 만드는 iOS·Android 앱. 공통 토큰을 바탕으로
            Native 입력·선택·모달과 모바일 기본 UI를 제공합니다.
          </Text>
          <Stack direction="row">
            <a href="https://github.com/Linternas/ui/blob/main/examples/native/App.tsx">
              모바일 예제 App.tsx ↗
            </a>
            <a href="https://github.com/Linternas/ui/blob/main/NATIVE.md">
              설치 · 전체 API ↗
            </a>
          </Stack>
        </section>
        <section aria-labelledby="native-setup">
          <Heading level={2} id="native-setup">
            Start with the essentials.
          </Heading>
          <Text>
            Expo에서는 앱 SDK에 맞는 Native 의존성을 설치합니다. 기존 웹
            import와 CSS는 모바일 진입점에 필요하지 않습니다.
          </Text>
          <CodeBlock
            language="bash"
            code={`npm install 'git+https://github.com/Linternas/ui.git#<commit-sha>'
npx expo install react-native-safe-area-context @react-native-community/datetimepicker @react-native-community/slider`}
            filename="terminal"
          />
          <CodeBlock
            language="tsx"
            code={nativeQuickStart}
            filename="App.tsx"
          />
        </section>
        <section aria-labelledby="native-inventory">
          <Heading level={2} id="native-inventory">
            The core toolkit.
          </Heading>
          <div className="native-docs-grid">
            {nativeGroups.map((group) => (
              <Card key={group.name}>
                <Heading level={3}>{group.name}</Heading>
                <Text muted>{group.description}</Text>
                <ul>
                  {group.components.map((component) => (
                    <li key={component}>
                      <code>{component}</code>
                      {nativeReleaseIsNew(now) && (
                        <span className="ui-new-badge">New</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
        <Card>
          <Heading level={3}>모바일에서 확인하기</Heading>
          <Text>
            연결된 App.tsx는 실제 Native 컴포넌트로 만든 조작형 예제입니다.
            날짜·시간·슬라이더의 OS UI, 키보드와 VoiceOver·TalkBack 동작은
            앱에서 확인할 수 있습니다.
          </Text>
        </Card>
      </main>
    </DesignSystemProvider>
  );
}
