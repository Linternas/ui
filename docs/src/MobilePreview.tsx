import { Icon as VectorIcon } from "../../src/icons";
import { useRef, useState } from "react";
import {
  SwipeActions,
  PullToRefresh,
  LongPressMenu,
  SelectionBar,
  Button,
  Checkbox,
  Text,
} from "@mingu/interaction-ui";
const initialNotes = [
  { id: "field", title: "Field notes", detail: "A few things worth keeping." },
  { id: "weekend", title: "Weekend plans", detail: "Take the long way home." },
  { id: "idea", title: "A small idea", detail: "Start somewhere simple." },
];
function Glyph({ name }: { name: "pin" | "archive" | "copy" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "pin" ? (
        <path d="m9 3 6 0-1 6 3 3v2H7v-2l3-3-1-6Zm3 11v7" />
      ) : name === "copy" ? (
        <>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V4H4v12h4" />
        </>
      ) : (
        <>
          <path d="M4 8v12h16V8M3 4h18v4H3zM10 12h4" />
        </>
      )}
    </svg>
  );
}
export default function MobilePreview({ id }: { id: string }) {
  const [archived, setArchived] = useState(false),
    [pinned, setPinned] = useState(false),
    [copies, setCopies] = useState(0),
    [refreshes, setRefreshes] = useState(0),
    [selected, setSelected] = useState<string[]>(["field"]),
    [notes, setNotes] = useState(initialNotes),
    first = useRef<HTMLInputElement>(null);
  switch (id) {
    case "swipe-actions":
      return (
        <div className="ui-mobile-demo">
          <span className="ui-gesture-eyebrow">SWIPE TO MAKE ROOM</span>
          {!archived ? (
            <SwipeActions
              label="Field notes actions"
              startActions={[
                {
                  id: "pin",
                  label: pinned ? "Unpin" : "Pin",
                  icon: <Glyph name="pin" />,
                  onAction: () => setPinned(!pinned),
                },
              ]}
              endActions={[
                {
                  id: "archive",
                  label: "Archive",
                  icon: <Glyph name="archive" />,
                  onAction: () => setArchived(true),
                },
              ]}
            >
              <div className="ui-mobile-note">
                <span className="ui-mobile-symbol" aria-hidden="true">
                  <VectorIcon name="document" size="1em" />
                </span>
                <div>
                  <strong>{pinned ? "Pinned · " : ""}Field notes</strong>
                  <p>A few things worth keeping.</p>
                </div>
              </div>
            </SwipeActions>
          ) : (
            <div className="ui-mobile-empty">
              <Text>Moved to the archive.</Text>
              <Button variant="secondary" onClick={() => setArchived(false)}>
                Undo archive
              </Button>
            </div>
          )}
          <Text muted size="sm">
            Swipe either way. Tap an action when you’re ready.
          </Text>
        </div>
      );
    case "pull-to-refresh":
      return (
        <div className="ui-mobile-demo">
          <span className="ui-gesture-eyebrow">A FRESH LITTLE START</span>
          <PullToRefresh
            label="Your reading list"
            onRefresh={async ({ signal }) => {
              await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(() => {
                  signal.removeEventListener("abort", abort);
                  resolve();
                }, 650);
                function abort() {
                  clearTimeout(timer);
                  reject(new DOMException("Aborted", "AbortError"));
                }
                signal.addEventListener("abort", abort, { once: true });
              });
              setRefreshes((n) => n + 1);
            }}
          >
            <div className="ui-mobile-feed">
              {refreshes > 0 && (
                <div className="ui-mobile-feed-new">
                  <span>JUST IN</span>
                  <strong>A new perspective #{refreshes}</strong>
                  <p>Good things are worth coming back to.</p>
                </div>
              )}
              {[...initialNotes, ...initialNotes].map((note, i) => (
                <div key={i}>
                  <span className="ui-mobile-feed-index">0{i + 1}</span>
                  <strong>{note.title}</strong>
                  <p>{note.detail}</p>
                </div>
              ))}
            </div>
          </PullToRefresh>
          <Text muted size="sm">
            At the top, pull down and release. Refresh works too.
          </Text>
        </div>
      );
    case "long-press-menu":
      return (
        <div className="ui-mobile-demo">
          <span className="ui-gesture-eyebrow">STAY FOR A MOMENT</span>
          <LongPressMenu
            label="Weekend field notes"
            disabled={archived}
            actions={[
              {
                id: "pin",
                label: pinned ? "Unpin note" : "Pin note",
                icon: <Glyph name="pin" />,
                onAction: () => setPinned(!pinned),
              },
              {
                id: "copy",
                label: "Duplicate note",
                icon: <Glyph name="copy" />,
                onAction: () => setCopies((n) => n + 1),
              },
              {
                id: "archive",
                label: "Archive note",
                icon: <Glyph name="archive" />,
                onAction: () => setArchived(true),
              },
            ]}
          >
            <div className="ui-mobile-cover">
              <img
                src="/ui-lab/landscape-night.svg"
                alt="Mountains under a quiet night sky"
                draggable={false}
              />
              <div>
                <span className="ui-gesture-eyebrow">
                  PERSONAL / FIELD NOTES
                </span>
                <strong>
                  {archived
                    ? "In the archive."
                    : pinned
                      ? "Pinned for later."
                      : "Weekend field notes."}
                </strong>
                <p>Small places. Quiet moments.</p>
              </div>
            </div>
          </LongPressMenu>
          {archived ? (
            <Button variant="secondary" onClick={() => setArchived(false)}>
              Restore note
            </Button>
          ) : (
            <Text muted size="sm">
              Hold the card, or open Actions.
              {copies > 0
                ? ` ${copies} ${copies === 1 ? "copy" : "copies"} created.`
                : ""}
            </Text>
          )}
        </div>
      );
    case "selection-bar":
      return (
        <div className="ui-mobile-demo">
          <span className="ui-gesture-eyebrow">A FEW THINGS, TOGETHER</span>
          <div className="ui-mobile-selection">
            <div className="ui-mobile-checklist">
              {notes.map((note, i) => (
                <div
                  key={note.id}
                  data-selected={selected.includes(note.id) || undefined}
                >
                  <Checkbox
                    ref={i === 0 ? first : undefined}
                    checked={selected.includes(note.id)}
                    onChange={(event) =>
                      setSelected((keys) =>
                        event.target.checked
                          ? [...keys, note.id]
                          : keys.filter((key) => key !== note.id),
                      )
                    }
                  >
                    {note.title}
                  </Checkbox>
                  <p>{note.detail}</p>
                </div>
              ))}
            </div>
            <SelectionBar
              count={selected.length}
              onClear={() => setSelected([])}
              focusReturn={first}
              placement="inline"
              actions={[
                {
                  id: "archive",
                  label: "Archive",
                  icon: <Glyph name="archive" />,
                  onAction: () => {
                    setNotes((items) =>
                      items.filter((note) => !selected.includes(note.id)),
                    );
                    setSelected([]);
                  },
                },
              ]}
            />
            {notes.length < initialNotes.length && (
              <Button
                variant="ghost"
                onClick={() => {
                  setNotes(initialNotes);
                  setSelected([]);
                }}
              >
                Restore notes
              </Button>
            )}
          </div>
          <Text muted size="sm">
            Select a few notes. Keep the next action within reach.
          </Text>
        </div>
      );
    default:
      return null;
  }
}
