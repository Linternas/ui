import { useRef, useState } from "react";
import {
  DesignSystemProvider,
  Button,
  TextField,
  TextareaField,
  SelectField,
  PasswordField,
  Input,
  Select,
  Stack,
} from "../src/system";
import { CodeBlock } from "../src/CodeBlock";

export default function ControlFixture() {
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const select = useRef<HTMLSelectElement>(null);
  const [result, setResult] = useState("");
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 24 }}
    >
      <div style={{ maxWidth: 560, display: "grid", gap: 24 }}>
        <p id="external">Shared guidance.</p>
        <form
          style={{ display: "grid", gap: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            setResult(
              JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
            );
          }}
        >
          <TextField
            label="Workspace"
            name="workspace"
            defaultValue="mingu"
            leading="@"
            trailing=".dev"
            required
            ref={input}
            hint="Lowercase name"
            aria-describedby="external"
          />
          <TextareaField
            label="Description"
            name="description"
            defaultValue="A design system"
            ref={textarea}
            hint="Optional details"
            aria-describedby="external"
          />
          <SelectField
            label="Visibility"
            name="visibility"
            ref={select}
            defaultValue="private"
            hint="Access level"
            required
            aria-describedby="external"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </SelectField>
          <TextField
            label="Read only"
            name="locked"
            defaultValue="kept"
            readOnly
          />
          <TextField
            label="Disabled"
            name="disabled"
            defaultValue="excluded"
            disabled
          />
          <PasswordField
            label="Password"
            name="password"
            defaultValue="secret123"
            hint="Use a unique password"
          />
          <PasswordField
            label="Disabled password"
            name="disabled-password"
            defaultValue="locked"
            disabled
          />
          <Button type="submit">Submit controls</Button>
        </form>
        <Button status="success">Saved state</Button>
        <Button status="error">Error state</Button>
        <output aria-label="Submitted values">{result}</output>
        <Button onClick={() => input.current?.focus()}>Focus input ref</Button>
        <Button onClick={() => textarea.current?.focus()}>
          Focus textarea ref
        </Button>
        <Button onClick={() => select.current?.focus()}>
          Focus select ref
        </Button>
        <TextareaField
          label="Invalid notes"
          error="Write a note"
          aria-describedby="external"
        />
        <SelectField
          label="Invalid choice"
          error="Choose a value"
          defaultValue=""
        >
          <option value="">Choose…</option>
        </SelectField>
        <TextField label="Invalid address" error="Try another address" />
        <fieldset disabled>
          <legend>Locked settings</legend>
          <PasswordField label="Fieldset password" defaultValue="locked" />
        </fieldset>
        <div data-testid="sizes" style={{ display: "grid", gap: 12 }}>
          {(["sm", "md", "lg"] as const).map((size) => (
            <div
              key={size}
              data-size={size}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <Button size={size}>{size}</Button>
              <Input aria-label={`${size} input`} controlSize={size} />
              <Select aria-label={`${size} select`} controlSize={size}>
                <option>{size}</option>
              </Select>
            </div>
          ))}
        </div>
        <Stack data-testid="long-content-stack">
          <CodeBlock
            code={'const source = "' + "long source line ".repeat(30) + '";'}
          />
        </Stack>
        <DesignSystemProvider
          theme="dark"
          accent="neutral"
          data-testid="neutral-dark"
        >
          <Button>Dark neutral</Button>
        </DesignSystemProvider>
        <DesignSystemProvider
          theme="light"
          accent="brand"
          data-testid="brand-light"
        >
          <Button>Light brand</Button>
        </DesignSystemProvider>
        <DesignSystemProvider
          theme="system"
          accent="neutral"
          data-testid="neutral-system"
        >
          <Button>System neutral</Button>
        </DesignSystemProvider>
      </div>
    </DesignSystemProvider>
  );
}
