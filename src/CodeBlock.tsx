"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";

for (const [name, language] of Object.entries({
  typescript,
  javascript,
  json,
  css,
  bash,
  xml,
}))
  hljs.registerLanguage(name, language);

export interface CodeBlockProps {
  code: string;
  labels?: { copy?: string; copied?: string; success?: string; error?: string };
  language?: string;
  filename?: string;
  lineNumbers?: boolean;
  highlightLines?: readonly number[];
  className?: string;
}

export function CodeBlock({
  code,
  labels = {},
  language = "text",
  filename,
  lineNumbers = true,
  highlightLines = [],
  className = "",
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const highlighted = useMemo(() => {
    // Only highlighter-generated, escaped HTML reaches the markup sink.
    if (!hljs.getLanguage(language)) return null;
    return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  }, [code, language]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 2200);
  }
  // Keep a single code tree: multiline token spans remain intact across lines.
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className={`mru-code ${className}`}>
      <figcaption className="mru-code-header">
        <span className="mru-code-file">{filename ?? language}</span>
        <span className="mru-code-language">{filename ? language : ""}</span>
        <button type="button" onClick={copy} aria-label={labels.copy ?? "Copy code"}>
          {copyState === "copied" ? (labels.copied ?? "Copied ✓") : (labels.copy ?? "Copy")}
        </button>
        <span className="mru-sr-only" role="status">
          {copyState === "copied"
            ? (labels.success ?? "Code copied to clipboard")
            : copyState === "error"
              ? (labels.error ?? "Could not copy. Select and copy the code manually.")
              : ""}
        </span>
      </figcaption>
      <div
        className="mru-code-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${filename ?? language} source code`}
      >
        <div className="mru-code-body">
          <div className="mru-code-gutter" aria-hidden="true">
            {lines.map((_, index) => (
              <span key={index}>{lineNumbers ? index + 1 : ""}</span>
            ))}
          </div>
          <div className="mru-code-content">
            <div className="mru-code-highlights" aria-hidden="true">
              {lines.map((_, index) => (
                <span
                  key={index}
                  data-highlight={
                    highlightLines.includes(index + 1) || undefined
                  }
                />
              ))}
            </div>
            <pre>
              {highlighted === null ? (
                <code>{code}</code>
              ) : (
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              )}
            </pre>
          </div>
        </div>
      </div>
    </figure>
  );
}
