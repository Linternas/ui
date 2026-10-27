import { Icon as VectorIcon } from "../../src/icons";
import { useState } from "react";
import {
  Badge,
  Button,
  CodeBlock,
  DesignSystemProvider,
  FloatingField,
  FocusDock,
  InteractiveCard,
  Slider,
  Switch,
} from "@mingu/interaction-ui";
import { Arrow, ShapeIcon } from "./LandingIcons";

export default function SystemBench() {
  const [dark, setDark] = useState(false),
    [radius, setRadius] = useState(12),
    [name, setName] = useState("Something good");
  const [effect, setEffect] = useState("magnetic"),
    [saved, setSaved] = useState("");
  const snippet = `import { Button, DesignSystemProvider, FloatingField } from '@mingu/interaction-ui';\nimport '@mingu/interaction-ui/system.css';\n\n<DesignSystemProvider\n  theme="${dark ? "dark" : "light"}"\n  accent="neutral"\n  style={{\n    '--mingu-radius-md': '${radius}px',\n    '--mingu-control-radius': '${radius}px'\n  }}\n>\n  <FloatingField label="Your next idea" />\n  <Button interaction="${effect}">\n    Make it happen\n  </Button>\n</DesignSystemProvider>`;
  return (
    <div className="landing-bench" data-testid="landing-bench">
      <div className="landing-bench-stage">
        <div className="landing-window-label">
          <span className="landing-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>YOUR NEXT INTERFACE</span>
          <span>LIVE</span>
        </div>
        <DesignSystemProvider
          theme={dark ? "dark" : "light"}
          accent="neutral"
          style={{
            "--mingu-radius-md": `${radius}px`,
            "--mingu-control-radius": `${radius}px`,
          }}
          className="landing-bench-provider"
        >
          <InteractiveCard effect="spotlight" className="landing-product-card">
            <div className="landing-product-symbol" aria-hidden="true">
              <VectorIcon name="sparkle" size="1em" />
            </div>
            <Badge>Made by you</Badge>
            <h3>
              A little idea.
              <br />A good beginning.
            </h3>
            <FloatingField
              label="Your next idea"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved("");
              }}
            />
            <Button
              interaction={effect as "magnetic" | "ripple" | "shine"}
              disabled={!name.trim()}
              status={saved ? "success" : "idle"}
              onClick={() => setSaved(name.trim())}
            >
              Make it happen <Arrow />
            </Button>
            <p role="status">
              {saved
                ? `“${saved}” — 이름을 담았어요.`
                : "한 번 눌러보면 알게 됩니다."}
            </p>
          </InteractiveCard>
        </DesignSystemProvider>
        <div className="landing-bench-controls">
          <Switch
            checked={dark}
            onChange={(event) => setDark(event.target.checked)}
          >
            Dark surface
          </Switch>
          <Slider
            label="Corner radius"
            value={radius}
            min={0}
            max={28}
            step={1}
            onValueChange={setRadius}
          />
          <div className="landing-effect-picker">
            <span>Button response</span>
            <FocusDock
              label="버튼 인터랙션 선택"
              value={effect}
              onValueChange={(id) => {
                setEffect(id);
                setSaved("");
              }}
              items={[
                {
                  id: "magnetic",
                  label: "Magnetic",
                  icon: <ShapeIcon shape="magnetic" />,
                },
                {
                  id: "ripple",
                  label: "Ripple",
                  icon: <ShapeIcon shape="ripple" />,
                },
                {
                  id: "shine",
                  label: "Shine",
                  icon: <ShapeIcon shape="shine" />,
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="landing-bench-code">
        <div className="landing-code-heading">
          <span>ONE SYSTEM. YOUR EXPRESSION.</span>
          <Badge>React + TypeScript</Badge>
        </div>
        <CodeBlock
          code={snippet}
          filename="your-next-idea.tsx"
          language="tsx"
        />
        <p>
          테마, 반경, 버튼 반응을 바꿔보세요. 같은 컴포넌트가 다른 인상을
          만듭니다.
        </p>
      </div>
    </div>
  );
}
