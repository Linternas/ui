import { useState } from "react";
import { DesignSystemProvider, Button, Checkbox } from "../src/system/base";
import { ImageParticleMorph } from "../src/collections/lab";
export default function MorphConsumer() {
  const [amount, setAmount] = useState(0.8),
    [accept, setAccept] = useState(false),
    [requested, setRequested] = useState<number | null>(null);
  const uncontrolled = new URLSearchParams(location.search).has("uncontrolled");
  return (
    <DesignSystemProvider theme="light">
      <main style={{ maxWidth: 700, margin: "24px auto" }}>
        <ImageParticleMorph
          src="/ui-lab/signal.svg"
          amount={uncontrolled ? undefined : amount}
          defaultAmount={0.25}
          autoRotate
          onAmountChange={(value) => {
            setRequested(value);
            if (accept) setAmount(value);
          }}
        />
        <Checkbox
          checked={accept}
          onChange={(event) => setAccept(event.target.checked)}
        >
          Accept updates
        </Checkbox>
        <Button onClick={() => setAmount(2)}>Set external amount</Button>
        <output aria-label="Requested amount">{String(requested)}</output>
      </main>
    </DesignSystemProvider>
  );
}
