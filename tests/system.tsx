import { useState } from "react";
import {
  Button,
  Checkbox,
  DesignSystemProvider,
  Dialog,
  Grid,
  Card,
  Switch,
  Tabs,
  TextField,
} from "../src/system";
export default function SystemFixture() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("one");
  const [count, setCount] = useState(0);
  return (
    <DesignSystemProvider theme="light">
      <Grid>
        <Card>
          <TextField label="Email" hint="Work address" error="Enter an email" />
          <Checkbox>Accept terms</Checkbox>
          <Switch>Notifications</Switch>
          <Button loading onClick={() => setCount(count + 1)}>
            Save
          </Button>
          <output>{count}</output>
          <Button onClick={() => setOpen(true)}>Open settings</Button>
        </Card>
        <Card>
          <Tabs
            label="Settings tabs"
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "one", label: "General", content: "General panel" },
              {
                value: "locked",
                label: "Locked",
                disabled: true,
                content: null,
              },
              { value: "two", label: "Advanced", content: "Advanced panel" },
            ]}
          />
        </Card>
      </Grid>
      <DesignSystemProvider theme="dark" data-testid="nested-dark">
        <Button>Dark action</Button>
      </DesignSystemProvider>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Settings"
        description="Manage your account"
      >
        <TextField label="Display name" />
        <Button onClick={() => setOpen(false)}>Done</Button>
      </Dialog>
    </DesignSystemProvider>
  );
}
