import { useState } from "react";
import {
  Button,
  CopyButton,
  FloatingField,
  SegmentedControl,
  InteractiveCard,
  Heading,
  Tabs,
  DesignSystemProvider,
} from "../src/system";
export default function MicroFixture() {
  const [clicks, setClicks] = useState(0),
    [data, setData] = useState(""),
    [tab, setTab] = useState("one");
  return (
    <DesignSystemProvider theme="light" style={{ padding: 24 }}>
      <div style={{ display: "grid", gap: 24, maxWidth: 600 }}>
        <Button interaction="magnetic" onClick={() => setClicks((n) => n + 1)}>
          Magnetic
        </Button>
        <Button interaction="ripple" onClick={() => setClicks((n) => n + 1)}>
          Ripple
        </Button>
        <Button interaction="ripple" onPointerDown={(e) => e.preventDefault()}>
          Prevent ripple
        </Button>
        <Button interaction="shine">Shine</Button>
        <Button interaction="magnetic" disabled>
          Disabled motion
        </Button>
        <output aria-label="Clicks">{clicks}</output>
        <CopyButton text="raw clipboard text" label="Copy text" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setData(
              JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
            );
          }}
        >
          <FloatingField
            label="Email address"
            name="email"
            type="email"
            required
            hint="Work address"
          />
          <SegmentedControl
            label="Billing"
            name="billing"
            defaultValue="monthly"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "locked", label: "Unavailable", disabled: true },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Button type="submit">Submit</Button>
          <output aria-label="Form data">{data}</output>
        </form>
        <InteractiveCard effect="tilt" data-testid="tilt">
          <Heading>Interactive surface</Heading>
          <Button>Card action</Button>
        </InteractiveCard>
        <Tabs
          animated
          label="Animated tabs"
          value={tab}
          onValueChange={setTab}
          items={[
            { value: "one", label: "First", content: "First panel" },
            { value: "two", label: "Second", content: "Second panel" },
          ]}
        />
      </div>
    </DesignSystemProvider>
  );
}
