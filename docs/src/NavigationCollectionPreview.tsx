import { useEffect, useRef, useState } from "react";
import { Button, Input } from "../../src/system/base";
import {
  PageTransition,
  DynamicStatusIsland,
  AnimatedMegaMenu,
  SortableGrid,
  CardNavigation,
  ScrollStack,
  StickyScrollStory,
  FooterReveal,
  ScrollExpandMedia,
  CoverflowCarousel,
} from "../../src/collections/navigation";
function Art({ title, number = "01" }: { title: string; number?: string }) {
  return (
    <div className="mingu-collection-demo-art">
      <span>{number}</span>
      <div aria-hidden="true" />
      <strong>{title}</strong>
      <small>FORM / SPACE / MOTION</small>
    </div>
  );
}
const projects = [
  {
    id: "form",
    title: "A study in form",
    description: "Small details. A different perspective.",
    media: <Art title="Form" />,
    content: (
      <>
        <p>
          Begin with a single circle. Give it space, and let the composition
          breathe.
        </p>
        <Button
          onClick={() => navigator.clipboard?.writeText("A study in form")}
        >
          Copy project title
        </Button>
      </>
    ),
  },
  {
    id: "space",
    title: "Room to think",
    description: "Make room for the things that matter.",
    media: <Art title="Space" number="02" />,
    content: (
      <p>
        Quiet surfaces, deliberate spacing, and enough room for the next idea.
      </p>
    ),
  },
  {
    id: "motion",
    title: "A natural rhythm",
    description: "Movement with a reason to exist.",
    media: <Art title="Motion" number="03" />,
    content: (
      <p>
        Transitions connect where you were to where you are going. The content
        stays in focus.
      </p>
    ),
  },
];
const menu = [
  {
    id: "build",
    label: "Build",
    description: "Everything you need for the next idea.",
    links: [
      {
        id: "button",
        label: "Core components",
        href: "/button",
        description: "The everyday building blocks.",
      },
      {
        id: "play",
        label: "Playground",
        href: "/playground",
        description: "A place to try something different.",
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    description: "Explore the language of the system.",
    links: [
      {
        id: "tokens",
        label: "Design tokens",
        href: "/foundations",
        description: "A shared visual foundation.",
      },
      {
        id: "all",
        label: "All components",
        href: "/all",
        description: "Explore the complete collection.",
      },
    ],
  },
  { id: "later", label: "Coming soon", disabled: true, links: [] },
];
function IslandDemo() {
  const [state, setState] = useState<"idle" | "working" | "success" | "error">(
      "idle",
    ),
    [progress, setProgress] = useState(0);
  useEffect(() => {
    if (state !== "working") return;
    const timer = setInterval(
      () => setProgress((p) => Math.min(100, p + 10)),
      300,
    );
    return () => clearInterval(timer);
  }, [state]);
  useEffect(() => {
    if (progress === 100) setState("success");
  }, [progress]);
  return (
    <div className="mingu-collection-demo-centered">
      <DynamicStatusIsland
        status={state}
        title={
          state === "working"
            ? "Preparing your collection"
            : state === "success"
              ? "Collection is ready"
              : state === "error"
                ? "Preparation interrupted"
                : "Your workspace, in a capsule"
        }
        detail={
          state === "working"
            ? "Keeping the small details in order."
            : state === "success"
              ? "All 10 pieces are ready to explore."
              : state === "error"
                ? "This is a local demo. Try preparing the collection again."
                : "Open the capsule to start a local task. Collapse it while the progress continues."
        }
        progress={state === "idle" ? undefined : progress}
        actions={
          <>
            <Button
              size="sm"
              onClick={() => {
                setProgress(0);
                setState("working");
              }}
              disabled={state === "working"}
            >
              {state === "idle" ? "Prepare collection" : "Restart"}
            </Button>
            {state === "working" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setState("error")}
              >
                Cancel task
              </Button>
            )}
          </>
        }
      />
      <p className="mingu-collection-hint">
        A quiet place for an ongoing task. Tap to open.
      </p>
    </div>
  );
}
function GridDemo({ compact = false }: { compact?: boolean }) {
  const [order, setOrder] = useState([
    "notes",
    "photos",
    "music",
    "ideas",
    "links",
    "tasks",
  ]);
  return (
    <div className="mingu-collection-demo">
      <SortableGrid
        minItemWidth={compact ? 80 : 130}
        order={order}
        onOrderChange={setOrder}
        items={[
          {
            id: "notes",
            label: "Notes",
            content: <Art title="Notes" number="01" />,
          },
          {
            id: "photos",
            label: "Photos",
            content: <Art title="Photos" number="02" />,
          },
          {
            id: "music",
            label: "Music",
            content: <Art title="Music" number="03" />,
          },
          {
            id: "ideas",
            label: "Ideas",
            content: <Art title="Ideas" number="04" />,
          },
          {
            id: "links",
            label: "Links",
            content: <Art title="Links" number="05" />,
          },
          {
            id: "tasks",
            label: "Tasks",
            content: <Art title="Tasks" number="06" />,
          },
        ].slice(0, compact ? 3 : 6)}
      />
      <p className="mingu-collection-hint" data-testid="grid-order">
        {(compact
          ? order.filter((id) => ["notes", "photos", "music"].includes(id))
          : order
        ).join(" → ")}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          setOrder(["notes", "photos", "music", "ideas", "links", "tasks"])
        }
      >
        Reset arrangement
      </Button>
    </div>
  );
}
function ScrollDemo({ id, compact }: { id: string; compact?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const steps = [
    {
      id: "shape",
      title: "Find the shape",
      description: (
        <p>
          Start with something simple. A circle, a line, a little curiosity.
        </p>
      ),
      preview: <Art title="Shape" number="01" />,
    },
    {
      id: "space",
      title: "Give it space",
      description: (
        <p>
          Let the pieces breathe. Keep what matters and remove what gets in the
          way.
        </p>
      ),
      preview: <Art title="Space" number="02" />,
    },
    {
      id: "move",
      title: "Let it move",
      description: (
        <p>A little movement can explain what comes next. Follow the rhythm.</p>
      ),
      preview: <Art title="Rhythm" number="03" />,
    },
  ];
  return (
    <div
      className="mingu-collection-demo-scroll"
      ref={scroller}
      tabIndex={0}
      aria-label="Scrollable interaction demo"
      data-testid="navigation-scroll"
      style={{ height: compact ? 300 : 420 }}
    >
      {id === "scroll-stack" ? (
        <ScrollStack
          items={steps.map((s) => ({
            id: s.id,
            title: s.title,
            content: (
              <>
                {s.description}
                <div className="mingu-collection-demo-mini-art">
                  <Art title={s.title} />
                </div>
              </>
            ),
          }))}
        />
      ) : id === "sticky-scroll-story" ? (
        <StickyScrollStory steps={steps} scrollContainerRef={scroller} />
      ) : id === "footer-reveal" ? (
        <FooterReveal
          footer={
            <>
              <span className="mingu-collection-hint">
                YOU MADE IT TO THE END
              </span>
              <h3>Let’s make something.</h3>
              <a href="/playground">Explore the playground ↗</a>
              <p>Small interactions. Better everyday tools.</p>
            </>
          }
        >
          <div className="mingu-collection-demo-end-story">
            <span className="mingu-collection-hint">SCROLL TO UNCOVER</span>
            <h3>
              There’s more
              <br />
              beneath the surface.
            </h3>
            <Art title="Stay curious" />
            <p>The page moves away, and the next chapter comes into view.</p>
            <span aria-hidden="true">↓</span>
          </div>
        </FooterReveal>
      ) : (
        <>
          <div className="mingu-collection-demo-scroll-intro">
            <span className="mingu-collection-hint">A WIDER PERSPECTIVE</span>
            <h3>
              Give the image
              <br />a little more room.
            </h3>
            <p>Scroll down to expand the frame.</p>↓
          </div>
          <ScrollExpandMedia
            scrollContainerRef={scroller}
            caption="A quiet frame, opening with the page."
          >
            <Art title="Open space" />
          </ScrollExpandMedia>
          <div className="mingu-collection-demo-scroll-outro">
            <p>
              Sometimes the smallest movement changes how you see the whole
              picture.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
function CoverflowDemo() {
  const [saves, setSaves] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <CoverflowCarousel
      items={projects.map((project, index) => ({
        id: project.id,
        title: project.title,
        content: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "grid",
                alignContent: "center",
                gap: 8,
                padding: 12,
                background: "var(--mingu-accent-soft)",
                borderRadius: "var(--mingu-radius-md)",
              }}
            >
              <small>STUDY 0{index + 1}</small>
              <strong>{project.title}</strong>
              <a href={`#study-${project.id}`}>View study ↗</a>
            </div>
            <Button
              size="sm"
              variant="secondary"
              aria-label={`Save ${project.title}`}
              onClick={() =>
                setSaves((current) => ({
                  ...current,
                  [project.id]: (current[project.id] ?? 0) + 1,
                }))
              }
            >
              Save study · {saves[project.id] ?? 0}
            </Button>
            <Input
              controlSize="sm"
              aria-label={`Note for ${project.title}`}
              placeholder="Add a note…"
              value={notes[project.id] ?? ""}
              onChange={(event) => {
                const note = event.currentTarget.value;
                setNotes((current) => ({ ...current, [project.id]: note }));
              }}
            />
          </div>
        ),
      }))}
    />
  );
}
export default function NavigationCollectionPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  switch (id) {
    case "page-transition":
      return (
        <PageTransition pages={compact ? projects.slice(0, 1) : projects} />
      );
    case "dynamic-status-island":
      return <IslandDemo />;
    case "animated-mega-menu":
      return (
        <div className="mingu-collection-demo">
          <AnimatedMegaMenu items={menu} />
          <div className="mingu-collection-demo-menu-space">
            <span className="mingu-collection-hint">
              ONE MENU. ROOM TO EXPLORE.
            </span>
            <h3>
              Less searching.
              <br />
              More making.
            </h3>
            <p>Open a menu, then move between sections.</p>
          </div>
        </div>
      );
    case "sortable-grid":
      return <GridDemo compact={compact} />;
    case "card-navigation":
      return (
        <CardNavigation
          groups={menu
            .filter((m) => !m.disabled)
            .map((m) => ({
              id: m.id,
              title: m.label,
              description: m.description,
              links: m.links,
            }))}
        />
      );
    case "scroll-stack":
    case "sticky-scroll-story":
    case "footer-reveal":
    case "scroll-expand-media":
      return <ScrollDemo id={id} compact={compact} />;
    case "coverflow-carousel":
      return <CoverflowDemo />;
    default:
      return null;
  }
}
