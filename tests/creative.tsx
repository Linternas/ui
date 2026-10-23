import { useState } from "react";
import {
  MultiSelect,
  TransferList,
  Rating,
  CircularDial,
  PixelEditor,
  GradientEditor,
  DesignSystemProvider,
  Button,
} from "../src";
const options = [
  { value: "react", label: "React" },
  { value: "motion", label: "Motion" },
  { value: "css", label: "CSS" },
  { value: "locked", label: "Locked", disabled: true },
];
export default function CreativeFixture() {
  const [submitted, setSubmitted] = useState(""),
    [notice, setNotice] = useState("");
  const controlled = new URLSearchParams(location.search).has("controlled");
  return (
    <DesignSystemProvider accent="neutral" theme="light">
      <main style={{ maxWidth: 560, margin: "24px auto", padding: 16 }}>
        {controlled ? (
          <>
            <MultiSelect
              label="Fixed stack"
              options={options}
              value={["react"]}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <CircularDial
              label="Fixed dial"
              value={40}
              step={5}
              onValueChange={(v) => setNotice(String(v))}
            />
            <PixelEditor
              columns={4}
              rows={4}
              value={[]}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <GradientEditor
              value={{
                angle: 90,
                stops: [
                  { id: "a", color: "#111111", position: 0 },
                  { id: "b", color: "#eeeeee", position: 100 },
                ],
              }}
              onValueChange={(v) => setNotice(JSON.stringify(v))}
            />
            <output aria-label="Change request">{notice}</output>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(
                JSON.stringify(
                  Array.from(new FormData(e.currentTarget).entries()),
                ),
              );
            }}
            style={{ display: "grid", gap: 32 }}
          >
            <MultiSelect
              label="Stack"
              name="stack"
              options={options}
              defaultValue={["react"]}
              maxSelected={2}
            />
            <TransferList
              label="Members"
              name="members"
              options={options}
              defaultValue={["css"]}
            />
            <Rating label="Rating" name="rating" defaultValue={2} />
            <CircularDial label="Dial" name="dial" defaultValue={30} step={5} />
            <div>
              <Button type="submit">Read form</Button>
              <Button type="reset" variant="outline">
                Reset form
              </Button>
            </div>
            <output aria-label="Form data">{submitted}</output>
          </form>
        )}
      </main>
    </DesignSystemProvider>
  );
}
