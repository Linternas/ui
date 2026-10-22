import { useRef, useState } from "react";
import {
  DesignSystemProvider,
  ImageLightbox,
  ExpandableCard,
  ResizablePanels,
  FileDropzone,
  Button,
  ActionToast,
  type ActionToastMessage,
} from "../src";
import EverydayPreview from "../docs/src/EverydayPreview";
export const everydayIds = [
  "image-lightbox",
  "expandable-card",
  "animated-filter-bar",
  "resizable-panels",
  "sortable-list",
  "inline-edit",
  "selection-toolbar",
  "smart-header",
  "code-tabs",
  "bottom-sheet",
  "action-toast",
  "file-dropzone",
];
function ControlledUpload() {
  const [files, setFiles] = useState<readonly File[]>([]),
    [aborts, setAborts] = useState(0);
  return (
    <div data-testid="controlled-upload">
      <FileDropzone
        label="Controlled attachments"
        files={files}
        onFilesChange={setFiles}
        onUpload={(file, { signal }) =>
          file.name !== "wait.txt"
            ? Promise.resolve()
            : new Promise((_resolve, reject) => {
                signal.addEventListener(
                  "abort",
                  () => {
                    setAborts((n) => n + 1);
                    reject(new DOMException("Aborted", "AbortError"));
                  },
                  { once: true },
                );
              })
        }
      />
      <Button onClick={() => setFiles([])}>Clear externally</Button>
      <output aria-label="Aborted uploads">{aborts}</output>
    </div>
  );
}
export default function EverydayFixture() {
  const [formValue, setFormValue] = useState("");
  const attempts = useRef(0);
  const [messages, setMessages] = useState<ActionToastMessage[]>([
    {
      id: "retry",
      title: "An action",
      action: {
        label: "Try action",
        onAction: async () => {
          if (++attempts.current === 1) throw Error("Failed");
          setMessages([]);
        },
      },
    },
  ]);
  return (
    <DesignSystemProvider
      theme="light"
      accent="neutral"
      style={{ padding: 16 }}
    >
      <main style={{ maxWidth: 720, display: "grid", gap: 60 }}>
        {everydayIds.map((id) => (
          <section data-testid={id} key={id}>
            <h2>{id}</h2>
            <EverydayPreview id={id} />
          </section>
        ))}
        <section data-testid="edges">
          <ImageLightbox images={[]} />
          <ExpandableCard title="Locked card" disabled>
            Unavailable
          </ExpandableCard>
          <ResizablePanels
            label="Locked panels"
            disabled
            first="First"
            second="Second"
          />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setFormValue(
                Array.from(new FormData(event.currentTarget).entries())
                  .map(
                    ([name, file]) =>
                      `${name}:${file instanceof File ? file.name : file}`,
                  )
                  .join(","),
              );
            }}
          >
            <FileDropzone
              label="Attachments"
              name="attachments"
              accept=".txt"
              maxSize={8}
              maxFiles={2}
              required
            />
            <Button type="submit">Submit files</Button>
            <Button type="reset">Reset files</Button>
          </form>
          <output aria-label="Submitted files">{formValue}</output>
          <ActionToast
            placement="inline"
            label="Retry notifications"
            messages={messages}
            onDismiss={(id) =>
              setMessages((items) => items.filter((item) => item.id !== id))
            }
          />
        </section>
        <ControlledUpload />
      </main>
    </DesignSystemProvider>
  );
}
