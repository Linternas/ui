import { useState } from "react";
import {
  DesignSystemProvider,
  RadialMenu,
  PreviewLink,
  MorphingSearch,
  ElasticSlider,
  Button,
} from "../src";
const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150"><rect width="240" height="150" fill="#65766b"/></svg>',
  );
export default function GestureFixture() {
  const [selection, setSelection] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [value, setValue] = useState(50);
  const [formValue, setFormValue] = useState("");
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 16 }}
    >
      <main style={{ maxWidth: 500, display: "grid", gap: 24 }}>
        <RadialMenu
          label="Create"
          onSelect={setSelection}
          items={[
            { id: "note", label: "Note", icon: "+" },
            { id: "locked", label: "Locked", icon: "◇", disabled: true },
            { id: "image", label: "Image", icon: "▧" },
            { id: "link", label: "Link", icon: "↗" },
          ]}
        />
        <output aria-label="Selected action">{selection}</output>
        <RadialMenu label="Empty actions" items={[]} />
        <RadialMenu
          label="Disabled actions"
          items={[
            { id: "none", label: "Unavailable", icon: "+", disabled: true },
          ]}
        />
        <Button>Outside</Button>
        <DesignSystemProvider theme="dark">
          <p style={{ margin: 0 }}>
            <PreviewLink
              href="#project"
              title="Project destination"
              data-testid="preview-link"
              preview={{
                src: image,
                title: "Selected work",
                description: "A quiet collection",
              }}
            >
              Open project
            </PreviewLink>
          </p>
        </DesignSystemProvider>
        <MorphingSearch
          label="Find projects"
          value={query}
          onValueChange={setQuery}
          onSearch={setSubmitted}
        />
        <output aria-label="Submitted query">{submitted}</output>
        <MorphingSearch label="Disabled search" disabled />
        <form
          id="slider-form"
          onSubmit={(event) => {
            event.preventDefault();
            setFormValue(
              JSON.stringify(
                Object.fromEntries(new FormData(event.currentTarget)),
              ),
            );
          }}
        >
          <ElasticSlider
            label="Intensity"
            name="intensity"
            value={value}
            onValueChange={setValue}
            formatValue={(value) => `${value}%`}
          />
          <ElasticSlider
            label="Stepped"
            name="stepped"
            min={0.1}
            max={1.05}
            step={0.3}
            defaultValue={1.05}
          />
          <ElasticSlider
            label="Disabled level"
            name="disabled"
            disabled
            defaultValue={30}
          />
          <Button type="submit">Read values</Button>
          <Button type="reset">Reset values</Button>
        </form>
        <output aria-label="Form values">{formValue}</output>
        <div id="project">Project target</div>
      </main>
    </DesignSystemProvider>
  );
}
