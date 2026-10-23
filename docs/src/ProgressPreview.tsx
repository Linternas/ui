import { useEffect, useState } from "react";
import {
  Button,
  Progress,
  Slider,
  Switch,
  Text,
} from "@mingu/interaction-ui/system";
export default function ProgressPreview() {
  const [value, setValue] = useState(45),
    [running, setRunning] = useState(false),
    [started, setStarted] = useState(false),
    [unknown, setUnknown] = useState(false);
  useEffect(() => {
    if (!running || unknown) return;
    const timer = setInterval(() => setValue((n) => Math.min(100, n + 4)), 160);
    return () => clearInterval(timer);
  }, [running, unknown]);
  useEffect(() => {
    if (value >= 100) setRunning(false);
  }, [value]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  const status = unknown
    ? "Waiting for a value"
    : value >= 100
      ? "Complete"
      : running
        ? "In progress"
        : started
          ? "Paused"
          : "Ready";
  return (
    <div className="ui-progress-demo">
      <div className="ui-progress-heading">
        <span className="ui-gesture-eyebrow">ONE STEP AT A TIME</span>
        <span role="status">{status}</span>
      </div>
      <Progress label="Preview task" value={unknown ? undefined : value} />
      <div className="ui-progress-controls">
        <Button
          disabled={unknown}
          onClick={() => {
            if (value >= 100) setValue(0);
            setStarted(true);
            setRunning(!running);
          }}
        >
          {running
            ? "Pause"
            : value >= 100
              ? "Replay"
              : started
                ? "Resume"
                : "Start"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setValue(0);
            setRunning(false);
            setStarted(false);
            setUnknown(false);
          }}
        >
          Reset
        </Button>
      </div>
      <Slider
        label="Progress value"
        min={0}
        max={100}
        value={value}
        disabled={unknown}
        onValueChange={(value) => {
          setValue(value);
          setRunning(false);
        }}
      />
      <Switch
        checked={unknown}
        onChange={(event) => {
          setUnknown(event.currentTarget.checked);
          setRunning(false);
        }}
      >
        Indeterminate
      </Switch>
      <Text muted size="sm">
        Start, pause, or set a value.
      </Text>
    </div>
  );
}
