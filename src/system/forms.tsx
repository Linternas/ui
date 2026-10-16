"use client";
import * as React from "react";
import {
  useId,
  useState,
  useRef,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button, Input, TextField, type TextFieldProps } from "./base";
import { useControllable } from "../shared";

export type ControlSize = "sm" | "md" | "lg";
export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return <label {...props} className={`mingu-label ${className}`} />;
}
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mingu-field">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {(error || hint) && (
        <p
          id={`${htmlFor}-description`}
          className={error ? "mingu-field-error" : "mingu-muted"}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
export function PasswordField({
  label,
  ...props
}: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mingu-password">
      <TextField
        {...props}
        label={label}
        type={visible ? "text" : "password"}
      />
      <Button
        variant="ghost"
        size="sm"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? "Hide" : "Show"}
      </Button>
    </div>
  );
}
export function SearchField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="search" />;
}
export function NumberField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="number" />;
}
/** Native date control preserves locale, keyboard entry, min/max, and form submission. */
export function DatePicker(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="date" />;
}
export interface Choice {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  name,
  disabled,
  required,
  error,
}: {
  label: string;
  options: readonly Choice[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <fieldset
      className="mingu-radio-group"
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="mingu-radio">
          <input
            type="radio"
            name={name ?? id}
            value={option.value}
            checked={selected === option.value}
            disabled={option.disabled}
            required={required}
            aria-invalid={!!error || undefined}
            onChange={() => setSelected(option.value)}
          />
          <span>
            {option.label}
            {option.description && <small>{option.description}</small>}
          </span>
        </label>
      ))}
      {error && (
        <p id={`${id}-error`} className="mingu-field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function Slider({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  name,
}: {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
}) {
  const id = useId();
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <div className="mingu-field">
      <div className="mingu-field-heading">
        <Label htmlFor={id}>{label}</Label>
        <output htmlFor={id}>{current}</output>
      </div>
      <input
        className="mingu-slider"
        id={id}
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(e) => setCurrent(e.target.valueAsNumber)}
      />
    </div>
  );
}
export function FileUpload({
  label,
  hint,
  id,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string; hint?: string }) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="mingu-field">
      <Label htmlFor={inputId}>{label}</Label>
      <input
        {...props}
        className={`mingu-file ${props.className ?? ""}`}
        type="file"
        id={inputId}
        aria-describedby={
          [props["aria-describedby"], hint && `${inputId}-hint`]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {hint && (
        <p className="mingu-muted" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export interface ComboboxProps {
  label: string;
  options: readonly Choice[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  emptyLabel?: string;
}
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  disabled,
  name,
  emptyLabel = "No results",
}: ComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const selected = options.find((item) => item.value === value);
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const enabled = filtered.filter((item) => !item.disabled);
  const activeOption =
    enabled[Math.min(active, Math.max(0, enabled.length - 1))];
  useEffect(() => {
    const ul = list.current;
    if (!ul || !activeOption) return;
    const li = document.getElementById(
      `${id}-option-${options.indexOf(activeOption)}`,
    );
    if (!li) return;
    if (li.offsetTop < ul.scrollTop) ul.scrollTop = li.offsetTop;
    else if (li.offsetTop + li.offsetHeight > ul.scrollTop + ul.clientHeight)
      ul.scrollTop = li.offsetTop + li.offsetHeight - ul.clientHeight;
  }, [activeOption, id, options, open]);
  const choose = (item: Choice) => {
    onValueChange(item.value);
    setOpen(false);
    setQuery("");
    setActive(0);
  };
  return (
    <div
      className="mingu-field mingu-combobox"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <Label htmlFor={id}>{label}</Label>
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}
      <Input
        id={id}
        role="combobox"
        autoComplete="off"
        value={open ? query : (selected?.label ?? "")}
        placeholder={placeholder}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeOption
            ? `${id}-option-${options.indexOf(activeOption)}`
            : undefined
        }
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setQuery("");
            return;
          }
          if (e.key === "Tab") {
            setOpen(false);
            setQuery("");
            return;
          }
          if (e.key === "Enter" && open) {
            e.preventDefault();
            if (activeOption) choose(activeOption);
            return;
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              setQuery("");
              setActive(0);
            } else
              setActive((index) =>
                enabled.length
                  ? (index +
                      (e.key === "ArrowDown" ? 1 : -1) +
                      enabled.length) %
                    enabled.length
                  : 0,
              );
          }
        }}
      />
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="mingu-combobox-list"
        >
          {filtered.map((option) => (
            <li
              key={option.value}
              id={`${id}-option-${options.indexOf(option)}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              data-active={option === activeOption || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!option.disabled) choose(option);
              }}
            >
              {option.label}
            </li>
          ))}
          {!filtered.length && (
            <li role="presentation" className="mingu-muted">
              {emptyLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
