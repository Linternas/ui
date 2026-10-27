import { Icon as VectorIcon } from "../../src/icons";
import { useRef, useState } from "react";
import {
  HoverGallery,
  TextReveal,
  CursorTrail,
  AvatarCluster,
  HoldToConfirm,
  NumberScrubber,
  Text,
} from "@mingu/interaction-ui";
const images = [
  {
    id: "day",
    src: "/ui-lab/landscape.svg",
    alt: "Warm mountain silhouettes",
    title: "Daylight",
    description: "A little room to breathe.",
  },
  {
    id: "night",
    src: "/ui-lab/landscape-night.svg",
    alt: "Mountains beneath a night sky",
    title: "After hours",
    description: "A quieter kind of energy.",
  },
  {
    id: "again",
    src: "/ui-lab/landscape.svg",
    alt: "A sun above layered hills",
    title: "Somewhere",
    description: "Take the scenic route.",
  },
];
export default function PlaygroundPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const scroll = useRef<HTMLDivElement>(null),
    [confirmed, setConfirmed] = useState(0),
    [size, setSize] = useState(32);
  switch (id) {
    case "hover-gallery":
      return (
        <div className="ui-playground-wide">
          <HoverGallery label="Three perspectives" items={images} />
          <Text muted size="sm">
            Hover, tap, or use the arrow keys.
          </Text>
        </div>
      );
    case "text-reveal":
      return (
        <div className="ui-reveal-demo">
          <span className="ui-gesture-eyebrow">
            SCROLL TO BRING IT INTO FOCUS
          </span>
          <div
            className="ui-reveal-scroll"
            ref={scroll}
            tabIndex={0}
            role="region"
            aria-label="Scroll to reveal the paragraph"
          >
            <div className="ui-reveal-space">
              A little further <VectorIcon name="arrow-down" size="1em" />
            </div>
            <TextReveal
              containerRef={scroll}
              text="Less noise. More meaning. Make room for the details that turn an ordinary moment into something worth remembering."
            />
            <div className="ui-reveal-end">
              The details make the difference.
            </div>
          </div>
        </div>
      );
    case "cursor-trail":
      return (
        <CursorTrail label="A collection in motion" images={images}>
          <span className="ui-gesture-eyebrow">COLLECT LITTLE MOMENTS</span>
          <strong className="ui-trail-title">
            Leave a little
            <br />
            inspiration.
          </strong>
          <Text muted size="sm">
            Move your cursor through the canvas.
          </Text>
        </CursorTrail>
      );
    case "avatar-cluster":
      return (
        <div className="ui-avatar-demo">
          <span className="ui-gesture-eyebrow">
            GOOD THINGS START WITH PEOPLE
          </span>
          <AvatarCluster
            label="The studio"
            people={[
              {
                id: "min",
                name: "Min",
                role: "Design engineer",
                bio: "Finding the balance between thoughtful design and small, useful details.",
                href: "https://github.com/Linternas",
              },
              {
                id: "ari",
                name: "Ari",
                role: "Product designer",
                bio: "Making complex things feel a little simpler.",
              },
              {
                id: "noa",
                name: "Noa",
                role: "Frontend engineer",
                bio: "Turning ideas into interfaces that feel right.",
              },
              {
                id: "eli",
                name: "Eli",
                role: "Creative developer",
                bio: "Exploring the space between play and everyday tools.",
              },
            ]}
          />
          <Text muted size="sm">
            A small team. A shared direction.
          </Text>
        </div>
      );
    case "hold-to-confirm":
      return (
        <div className="ui-confirm-demo">
          <span className="ui-gesture-eyebrow">A MOMENT TO BE SURE</span>
          <strong>Give it a little intention.</strong>
          <HoldToConfirm
            label="Hold to publish"
            confirmationTitle="Publish this demo?"
            confirmationDescription="This updates the preview counter."
            onConfirm={async () => {
              await new Promise((resolve) => setTimeout(resolve, 450));
              setConfirmed((n) => n + 1);
            }}
          />
          <Text muted size="sm">
            {confirmed
              ? `Confirmed ${confirmed} ${confirmed === 1 ? "time" : "times"}.`
              : "Ready when you are."}
          </Text>
        </div>
      );
    case "number-scrubber":
      return (
        <div className="ui-scrubber-demo">
          <span className="ui-gesture-eyebrow">FINE-TUNE THE FEELING</span>
          <div
            className="ui-scrubber-sample"
            style={{ fontSize: compact ? Math.min(size, 48) : size }}
          >
            Aa<span style={{ fontSize: 12 }}> {size} px</span>
          </div>
          <NumberScrubber
            label="Type size"
            value={size}
            onValueChange={setSize}
            min={16}
            max={72}
            step={1}
            hint="Drag the handle, type a value, or use the arrow keys."
          />
        </div>
      );
    default:
      return null;
  }
}
