"use client";
import { Icon as VectorIcon } from "./icons";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./system/base";
import { FileUpload } from "./system/forms";
import { useControllable } from "./shared";
export type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
};
export interface RejectedFile {
  file: File;
  reason: string;
}
export interface FileDropzoneProps {
  label: string;
  files?: readonly File[];
  onFilesChange?: (files: readonly File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  hint?: string;
  onReject?: (files: RejectedFile[]) => void;
  onUpload?: (
    file: File,
    context: { signal: AbortSignal; onProgress: (percent: number) => void },
  ) => Promise<void>;
  className?: string;
}
const fileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
const accepts = (file: File, accept = "") =>
  !accept ||
  accept.split(",").some((value) => {
    const rule = value.trim().toLowerCase();
    return rule.startsWith(".")
      ? file.name.toLowerCase().endsWith(rule)
      : rule.endsWith("/*")
        ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
        : file.type.toLowerCase() === rule;
  });
function FilePreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? (
    <img src={url} alt="" />
  ) : (
    <span aria-hidden="true" className="mingu-dropzone-file-icon">
      <VectorIcon name="upload" size="1em" />
    </span>
  );
}
export function FileDropzone({
  label,
  files: controlled,
  onFilesChange,
  accept,
  multiple = true,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  disabled,
  required,
  name,
  form,
  hint,
  onReject,
  onUpload,
  className = "",
}: FileDropzoneProps) {
  const [files, setFiles] = useControllable<readonly File[]>(
    controlled,
    [],
    onFilesChange,
  );
  const [dragging, setDragging] = useState(false),
    [error, setError] = useState(""),
    [states, setStates] = useState<Record<string, UploadState>>({});
  const input = useRef<HTMLInputElement>(null),
    dragDepth = useRef(0),
    alive = useRef(true),
    controllers = useRef(new Map<string, AbortController>());
  const syncInput = (list: readonly File[]) => {
    if (!input.current) return;
    const transfer = new DataTransfer();
    list.forEach((file) => transfer.items.add(file));
    input.current.files = transfer.files;
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controllers.current.forEach((controller) => controller.abort());
      controllers.current.clear();
    };
  }, []);
  useEffect(() => {
    syncInput(files);
    const keys = new Set(files.map(fileKey));
    setStates((previous) => {
      const entries = Object.entries(previous).filter(([key]) => keys.has(key));
      return entries.length === Object.keys(previous).length
        ? previous
        : Object.fromEntries(entries);
    });
    controllers.current.forEach((controller, key) => {
      if (!keys.has(key)) {
        controller.abort();
        controllers.current.delete(key);
      }
    });
  }, [files]);
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner) return;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        if (controlled !== undefined) syncInput(controlled);
        else {
          setFiles([]);
          setStates({});
          setError("");
        }
      });
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [controlled, form, setFiles]);
  const choose = (incoming: readonly File[]) => {
    if (disabled || input.current?.matches(":disabled")) return;
    const next = multiple ? [...files] : [],
      rejected: RejectedFile[] = [];
    for (const file of incoming) {
      let reason = "";
      if (!accepts(file, accept)) reason = "File type is not accepted";
      else if (file.size > maxSize) reason = "File is too large";
      else if (next.some((existing) => fileKey(existing) === fileKey(file)))
        continue;
      else if (next.length >= (multiple ? Math.max(1, maxFiles) : 1))
        reason = "Too many files";
      if (reason) rejected.push({ file, reason });
      else next.push(file);
    }
    setError(
      rejected.map((item) => `${item.file.name}: ${item.reason}`).join(". "),
    );
    if (rejected.length) onReject?.(rejected);
    setFiles(next);
    syncInput(controlled ?? next);
  };
  const upload = async (file: File) => {
    if (!onUpload || disabled) return;
    const key = fileKey(file);
    if (controllers.current.has(key)) return;
    const controller = new AbortController();
    controllers.current.set(key, controller);
    const update = (state: UploadState) => {
      if (alive.current && !controller.signal.aborted)
        setStates((previous) => ({ ...previous, [key]: state }));
    };
    update({ status: "uploading", progress: 0 });
    try {
      await onUpload(file, {
        signal: controller.signal,
        onProgress: (value) =>
          update({
            status: "uploading",
            progress: Math.max(
              0,
              Math.min(100, Number.isFinite(value) ? value : 0),
            ),
          }),
      });
      update({ status: "success", progress: 100 });
    } catch (reason) {
      update({
        status: "error",
        progress: 0,
        error: reason instanceof Error ? reason.message : "Upload failed",
      });
    } finally {
      if (controllers.current.get(key) === controller)
        controllers.current.delete(key);
    }
  };
  return (
    <div
      className={`mingu-dropzone ${className}`}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onDragEnter={(event) => {
        if (disabled || !event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        dragDepth.current++;
        setDragging(true);
      }}
      onDragOver={(event) => {
        if (!disabled && event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        choose(Array.from(event.dataTransfer.files));
      }}
    >
      <div className="mingu-dropzone-target">
        <span className="mingu-dropzone-mark" aria-hidden="true">
          <VectorIcon name="upload" size="1em" />
        </span>
        <p>Drop files here or choose files</p>
        <FileUpload
          ref={input}
          label={label}
          hint={hint}
          name={name}
          form={form}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          required={required}
          onChange={(event) =>
            choose(Array.from(event.currentTarget.files ?? []))
          }
        />
      </div>
      {error && (
        <p role="alert" className="mingu-inline-error">
          {error}
        </p>
      )}
      <ul className="mingu-dropzone-files">
        {files.map((file) => {
          const key = fileKey(file),
            state = states[key] ?? { status: "idle", progress: 0 };
          return (
            <li key={key}>
              <FilePreview file={file} />
              <div className="mingu-dropzone-file-copy">
                <strong>{file.name}</strong>
                <small>
                  {Math.max(1, Math.round(file.size / 1024))} KB ·{" "}
                  {state.status}
                </small>
                {state.status === "uploading" && (
                  <progress
                    aria-label={`Upload ${file.name}`}
                    max={100}
                    value={state.progress}
                  />
                )}
                {state.error && (
                  <span role="alert" className="mingu-inline-error">
                    {state.error}
                  </span>
                )}
              </div>
              {onUpload && state.status !== "success" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  loading={state.status === "uploading"}
                  onClick={() => void upload(file)}
                >
                  {state.status === "error" ? "Retry" : "Upload"}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  controllers.current.get(key)?.abort();
                  controllers.current.delete(key);
                  const next = files.filter((item) => fileKey(item) !== key);
                  setFiles(next);
                  syncInput(controlled ?? next);
                  input.current?.focus({ preventScroll: true });
                  setStates((previous) => {
                    const result = { ...previous };
                    delete result[key];
                    return result;
                  });
                }}
              >
                <VectorIcon name="close" size="1em" />
              </Button>
            </li>
          );
        })}
      </ul>
      <span className="mingu-visually-hidden" role="status">
        {files.length} file{files.length === 1 ? "" : "s"} selected
      </span>
    </div>
  );
}
