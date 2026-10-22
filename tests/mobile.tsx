import { useRef, useState } from "react";
import {
  DesignSystemProvider,
  Button,
  PullToRefresh,
  SwipeActions,
  LongPressMenu,
  SelectionBar,
} from "../src";
import MobilePreview from "../docs/src/MobilePreview";
export default function MobileFixture() {
  const [refreshAttempts, setRefreshAttempts] = useState(0),
    [refreshes, setRefreshes] = useState(0),
    [actions, setActions] = useState(0),
    [attempts, setAttempts] = useState(0),
    [disabled, setDisabled] = useState(false),
    [selected, setSelected] = useState(2),
    [selectionTries, setSelectionTries] = useState(0),
    [nativeClicks, setNativeClicks] = useState(0),
    first = useRef<HTMLButtonElement>(null),
    [canceled, setCanceled] = useState(false);
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 16 }}
    >
      <main style={{ maxWidth: 440, display: "grid", gap: 40 }}>
        {[
          "swipe-actions",
          "pull-to-refresh",
          "long-press-menu",
          "selection-bar",
        ].map((id) => (
          <section key={id} data-testid={id}>
            <MobilePreview id={id} />
          </section>
        ))}
        <section data-testid="refresh-errors">
          <PullToRefresh
            label="Refresh test"
            disabled={disabled}
            onRefresh={async ({ signal }) => {
              setRefreshAttempts((n) => n + 1);
              await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(resolve, 250);
                signal.addEventListener(
                  "abort",
                  () => {
                    clearTimeout(timer);
                    reject(new Error("Aborted"));
                  },
                  { once: true },
                );
              });
              if (refreshAttempts === 0) throw Error("Failed");
              setRefreshes((n) => n + 1);
            }}
          >
            <div style={{ padding: 24, height: 700 }}>Pull from here.</div>
            <button type="button">Native child</button>
          </PullToRefresh>
          <output aria-label="Refresh attempts">{refreshAttempts}</output>
          <output aria-label="Refresh successes">{refreshes}</output>
          <Button onClick={() => setDisabled((d) => !d)}>
            Toggle refresh disabled
          </Button>
        </section>
        <section data-testid="swipe-errors">
          <SwipeActions
            label="Async swipe"
            endActions={[
              {
                id: "fail",
                label: "Run action",
                onAction: async () => {
                  setAttempts((n) => n + 1);
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  if (attempts === 0) throw Error("Failed");
                  setActions((n) => n + 1);
                },
              },
              {
                id: "disabled",
                label: "Unavailable",
                disabled: true,
                onAction: () => setActions((n) => n + 100),
              },
            ]}
          >
            <strong>Swipe for actions.</strong>
          </SwipeActions>
          <output aria-label="Action attempts">{attempts}</output>
          <output aria-label="Action successes">{actions}</output>
        </section>
        <section data-testid="vertical-scroll">
          <div
            role="region"
            aria-label="Scrollable inbox"
            style={{
              height: 200,
              overflowY: "auto",
              overscrollBehavior: "contain",
              border: "1px solid gray",
            }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <SwipeActions
                key={i}
                label={`Message ${i + 1}`}
                endActions={[
                  { id: "archive", label: "Archive", onAction: () => {} },
                ]}
              >
                <p>Message {i + 1} · Swipe or scroll.</p>
                <Button onClick={() => setNativeClicks((n) => n + 1)}>
                  Open message {i + 1}
                </Button>
              </SwipeActions>
            ))}
          </div>
          <output aria-label="Native clicks">{nativeClicks}</output>
        </section>
        <section data-testid="long-failure">
          <LongPressMenu
            label="Failure menu"
            delay={350}
            actions={[
              {
                id: "fail",
                label: "Try action",
                onAction: async () => {
                  setAttempts((n) => n + 1);
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  if (attempts === 0) throw Error("Failed");
                  setActions((n) => n + 1);
                },
              },
              {
                id: "disabled",
                label: "Unavailable",
                disabled: true,
                onAction: () => {},
              },
            ]}
          >
            <div style={{ padding: 40 }}>
              Hold here.
              <Button onClick={() => setNativeClicks((n) => n + 1)}>
                Native child
              </Button>
            </div>
          </LongPressMenu>
          <output aria-label="Action attempts">{attempts}</output>
          <output aria-label="Action successes">{actions}</output>
          <output aria-label="Native clicks">{nativeClicks}</output>
        </section>
        <section data-testid="selection-failure">
          <Button ref={first} onClick={() => setSelected(2)}>
            Select items
          </Button>
          <SelectionBar
            count={selected}
            focusReturn={first}
            onClear={() => setSelected(0)}
            actions={[
              {
                id: "run",
                label: "Apply selection",
                onAction: async () => {
                  setSelectionTries((n) => n + 1);
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  if (selectionTries === 0) throw Error("Failed");
                  setSelected(0);
                },
              },
              {
                id: "disabled",
                label: "Unavailable",
                disabled: true,
                onAction: () => {},
              },
            ]}
          />
          <output aria-label="Selection attempts">{selectionTries}</output>
        </section>
        <section data-testid="abort-refresh">
          <AbortRefreshFixture />
        </section>
        <section data-testid="cancel-refresh">
          <PullToRefresh
            label="Canceled refresh"
            onRefresh={async () => {
              setCanceled(true);
            }}
          >
            <div style={{ height: 700, padding: 24 }}>Cancel gesture area.</div>
          </PullToRefresh>
          <output aria-label="Canceled callback">{String(canceled)}</output>
        </section>
      </main>
    </DesignSystemProvider>
  );
}

export function AbortRefreshFixture() {
  const [visible, setVisible] = useState(true),
    [aborted, setAborted] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(false)}>Unmount refresh</Button>
      {visible && (
        <PullToRefresh
          label="Abortable refresh"
          onRefresh={({ signal }) =>
            new Promise<void>((_, reject) => {
              signal.addEventListener(
                "abort",
                () => {
                  setAborted(true);
                  reject(new Error("Aborted"));
                },
                { once: true },
              );
            })
          }
        >
          <p>Pending request</p>
        </PullToRefresh>
      )}
      <output aria-label="Request aborted">{String(aborted)}</output>
    </>
  );
}
