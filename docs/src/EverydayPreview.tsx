import { useEffect, useRef, useState } from "react";
import {
  ImageLightbox,
  ExpandableCard,
  AnimatedFilterBar,
  ResizablePanels,
  SortableList,
  InlineEdit,
  SelectionToolbar,
  SmartHeader,
  CodeTabs,
  BottomSheet,
  ActionToast,
  FileDropzone,
  Button,
  Checkbox,
  Switch,
  Text,
  type SortableItem,
  type ActionToastMessage,
} from "@mingu/interaction-ui";
const day = "/ui-lab/landscape.svg",
  night = "/ui-lab/landscape-night.svg";
const initialItems: SortableItem[] = [
  { id: "notes", label: "Field notes" },
  { id: "work", label: "Selected work" },
  { id: "about", label: "About me" },
];
const projects = [
  {
    id: "field",
    name: "Field notes",
    category: "web",
    description: "A quiet place for ideas.",
  },
  {
    id: "objects",
    name: "Objects",
    category: "design",
    description: "Studies in form and space.",
  },
  {
    id: "archive",
    name: "Archive",
    category: "web",
    description: "Keep what matters.",
  },
  {
    id: "motion",
    name: "Motion study",
    category: "design",
    description: "Small, deliberate gestures.",
  },
];
function ToastDemo() {
  const [visible, setVisible] = useState(true),
    [messages, setMessages] = useState<ActionToastMessage[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismiss = (id: string) =>
    setMessages((items) => items.filter((item) => item.id !== id));
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const remove = () => {
    setVisible(false);
    setMessages((items) => [
      ...items.filter((item) => item.id !== "removed"),
      {
        id: "removed",
        title: "Note removed",
        description: "You can bring it back.",
        action: {
          label: "Undo",
          onAction: () => {
            setVisible(true);
            dismiss("removed");
          },
        },
      },
    ]);
  };
  const progress = () => {
    if (timer.current) clearInterval(timer.current);
    let value = 0;
    setMessages((items) => [
      ...items.filter((item) => item.id !== "progress"),
      { id: "progress", title: "Preview in progress", progress: 0, busy: true },
    ]);
    timer.current = setInterval(() => {
      value += 20;
      setMessages((items) =>
        items.map((item) =>
          item.id === "progress"
            ? {
                ...item,
                progress: value,
                busy: value < 100,
                title: value < 100 ? "Preview in progress" : "Preview complete",
                tone: value === 100 ? "success" : "neutral",
              }
            : item,
        ),
      );
      if (value >= 100 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 250);
  };
  return (
    <div className="ui-everyday-stack">
      <div className="ui-note-placeholder">
        {visible ? "A note worth keeping." : "The note was removed."}
      </div>
      <div className="ui-everyday-actions">
        <Button
          size="sm"
          variant="outline"
          disabled={!visible}
          onClick={remove}
        >
          Remove note
        </Button>
        <Button size="sm" variant="ghost" onClick={progress}>
          Preview progress
        </Button>
      </div>
      <ActionToast placement="inline" messages={messages} onDismiss={dismiss} />
    </div>
  );
}
function UploadDemo({ compact }: { compact: boolean }) {
  const [fail, setFail] = useState(false);
  return (
    <div className="ui-everyday-stack">
      <FileDropzone
        label="Choose images"
        accept="image/*"
        maxFiles={3}
        hint="Up to 3 images · 10 MB each"
        onUpload={async (_file, { signal, onProgress }) => {
          for (const progress of [25, 50, 75, 100]) {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(() => {
                signal.removeEventListener("abort", abort);
                resolve();
              }, 180);
              const abort = () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
              };
              if (signal.aborted) abort();
              else signal.addEventListener("abort", abort, { once: true });
            });
            if (progress === 50 && fail)
              throw Error("Preview failure. Turn off the switch and retry.");
            onProgress(progress);
          }
        }}
      />
      {!compact && (
        <Switch
          checked={fail}
          onChange={(event) => setFail(event.currentTarget.checked)}
        >
          Simulate upload failure
        </Switch>
      )}
      <Text muted size="sm">
        Local preview. Files stay in this browser.
      </Text>
    </div>
  );
}
export default function EverydayPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [items, setItems] = useState(initialItems),
    [name, setName] = useState("Untitled project"),
    [fail, setFail] = useState(false),
    [quote, setQuote] = useState(""),
    [open, setOpen] = useState(false),
    [published, setPublished] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  switch (id) {
    case "image-lightbox":
      return (
        <div className="ui-everyday-stack">
          <ImageLightbox
            images={[
              {
                id: "day",
                src: day,
                alt: "Mountains in daylight",
                caption: "A warm afternoon in the hills.",
              },
              {
                id: "night",
                src: night,
                alt: "Mountains after hours",
                caption: "The same shapes, a different light.",
              },
            ]}
          />
          <Text muted size="sm">
            Open an image. Zoom in on the details.
          </Text>
        </div>
      );
    case "expandable-card":
      return (
        <div className="ui-everyday-card">
          <ExpandableCard
            title="Field notes"
            description="A little space for a new perspective."
            image={{ src: day, alt: "Layered mountain landscape" }}
          >
            <p>
              A collection of small observations, considered details, and things
              worth returning to.
            </p>
            <Button
              variant="outline"
              onClick={() => setQuote("Saved to your preview collection.")}
            >
              Save to collection
            </Button>
            <p role="status">{quote}</p>
          </ExpandableCard>
        </div>
      );
    case "animated-filter-bar":
      return (
        <AnimatedFilterBar
          label="Project category"
          filters={[
            { value: "all", label: "All" },
            { value: "web", label: "Web" },
            { value: "design", label: "Design" },
          ]}
          items={projects}
          getKey={(item) => item.id}
          getFilter={(item) => item.category}
          renderItem={(item) => (
            <div className="ui-filter-project">
              <small>{item.category.toUpperCase()}</small>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </div>
          )}
        />
      );
    case "resizable-panels":
      return (
        <div className="ui-everyday-stack">
          <ResizablePanels
            first={
              <div className="ui-panel-editor">
                <small>EDITOR</small>
                <pre>{`<Card>\n  <Heading>\n    Room to think.\n  </Heading>\n</Card>`}</pre>
              </div>
            }
            second={
              <div className="ui-panel-preview">
                <span className="ui-panel-shape" aria-hidden="true" />
                <strong>Room to think.</strong>
                <p>A little more space.</p>
              </div>
            }
          />
          <Text muted size="sm">
            Drag the divider. Enter folds the first panel.
          </Text>
        </div>
      );
    case "sortable-list":
      return (
        <div className="ui-everyday-stack">
          <SortableList
            label="Profile links"
            items={items}
            onReorder={setItems}
          />
          <Text muted size="sm">
            Your links, in your order.
          </Text>
        </div>
      );
    case "inline-edit":
      return (
        <div className="ui-everyday-stack">
          <span className="ui-gesture-eyebrow">PROJECT NAME</span>
          <InlineEdit
            label="Project name"
            value={name}
            required
            maxLength={80}
            onSave={async (next) => {
              await new Promise((resolve) => setTimeout(resolve, 220));
              if (fail)
                throw Error(
                  "Could not save. Turn off the switch and try again.",
                );
              setName(next);
            }}
          />
          {!compact && (
            <Switch
              checked={fail}
              onChange={(event) => setFail(event.currentTarget.checked)}
            >
              Simulate save failure
            </Switch>
          )}
          <Text muted size="sm">
            Click the title to edit. Enter saves, Escape cancels.
          </Text>
        </div>
      );
    case "selection-toolbar":
      return (
        <div className="ui-everyday-stack">
          <SelectionToolbar
            actions={[
              {
                id: "quote",
                label: "Quote",
                onSelect: (text) => setQuote(text),
              },
            ]}
          >
            <div className="ui-selection-copy">
              <span className="ui-gesture-eyebrow">SELECT A SENTENCE</span>
              <p>
                Good design makes room for the things that matter. A little less
                noise. A little more intention.
              </p>
            </div>
          </SelectionToolbar>
          {quote && (
            <blockquote className="ui-selected-quote">{quote}</blockquote>
          )}
          <Text muted size="sm">
            Select text to copy or quote it.
          </Text>
        </div>
      );
    case "smart-header":
      return (
        <div
          ref={scroll}
          className="ui-header-scroll"
          tabIndex={0}
          role="region"
          aria-label="Header reading preview"
        >
          <SmartHeader containerRef={scroll}>
            <strong>Field notes.</strong>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                scroll.current?.scrollTo({ top: 0, behavior: "instant" })
              }
            >
              Top ↑
            </Button>
          </SmartHeader>
          <div className="ui-header-story">
            {[
              "Room to read.",
              "A quieter rhythm.",
              "Keep what matters.",
              "Find your way back.",
            ].map((title, i) => (
              <section key={title}>
                <small>0{i + 1}</small>
                <h3>{title}</h3>
                <p>
                  Scroll down to make space for the words. Move up when you need
                  the wayfinding again.
                </p>
              </section>
            ))}
          </div>
        </div>
      );
    case "code-tabs":
      return (
        <CodeTabs
          label="Build command"
          items={[
            {
              id: "npm",
              label: "npm",
              language: "bash",
              code: "npm run build",
              lineNumbers: false,
            },
            {
              id: "pnpm",
              label: "pnpm",
              language: "bash",
              code: "pnpm build\n\n# Start the production server\npnpm start",
              lineNumbers: false,
            },
            {
              id: "yarn",
              label: "yarn",
              language: "bash",
              code: "yarn build",
              lineNumbers: false,
            },
          ]}
        />
      );
    case "bottom-sheet":
      return (
        <div className="ui-everyday-stack">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open filters ↑
          </Button>
          <Text muted size="sm">
            {published ? "Showing published entries" : "Showing all entries"}
          </Text>
          <BottomSheet
            open={open}
            onOpenChange={setOpen}
            title="Make it yours"
            description="A little less to look through."
            snapPoints={[0.4, 0.7, 0.92]}
          >
            <div className="ui-everyday-stack">
              <Checkbox
                checked={published}
                onChange={(event) => setPublished(event.currentTarget.checked)}
              >
                Published only
              </Checkbox>
              <Text muted size="sm">
                Drag the handle to resize, or use its arrow keys.
              </Text>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </BottomSheet>
        </div>
      );
    case "action-toast":
      return <ToastDemo />;
    case "file-dropzone":
      return <UploadDemo compact={compact} />;
    default:
      return null;
  }
}
