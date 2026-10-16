"use client";
import { useEffect, useRef, useState } from "react";
import { Button, CopyButton, Stack, Text, Badge } from "@mingu/interaction-ui";
export default function ButtonInteractions() {
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Stack gap={4}>
      <Stack direction="row" gap={3}>
        <Button interaction="magnetic">
          Move closer <span aria-hidden="true">↗</span>
        </Button>
        <Button variant="secondary" interaction="ripple">
          Press anywhere
        </Button>
        <Button variant="outline" interaction="shine">
          Catch the light <span aria-hidden="true">✦</span>
        </Button>
      </Stack>
      <Stack direction="row" gap={3} align="center">
        <Button
          icon={
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m-4-4 4 4 4-4M4 15v2h12v-2" />
            </svg>
          }
          loading={phase === "loading"}
          status={phase === "success" ? "success" : "idle"}
          interaction="ripple"
          onClick={() => {
            setPhase("loading");
            timer.current = setTimeout(() => setPhase("success"), 900);
          }}
        >
          <span className="mingu-action-label" data-phase={phase}>
            <span aria-hidden={phase !== "idle"}>Save changes</span>
            <span aria-hidden={phase !== "loading"}>Saving</span>
            <span aria-hidden={phase !== "success"}>Saved</span>
          </span>
        </Button>
        <CopyButton
          text="https://github.com/Linternas/ui"
          variant="secondary"
          label="Copy repository"
          copiedLabel="Copied"
        />
        <Badge tone="accent">Press → respond → settle</Badge>
      </Stack>
      <Text size="sm" muted>
        포인터를 가까이 움직이거나 버튼의 다른 지점을 눌러 보세요. 저장 버튼은
        로딩과 완료 전환을 보여줍니다.
      </Text>
    </Stack>
  );
}
