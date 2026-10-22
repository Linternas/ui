"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { CodeBlock, type CodeBlockProps } from "./CodeBlock";
import { Tabs } from "./system/base";
import { useControllable } from "./shared";
import { selectionSpring } from "./system/motion-tokens";
export interface CodeTab extends CodeBlockProps {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface CodeTabsProps {
  items: readonly CodeTab[];
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}
export function CodeTabs({
  items,
  label = "Code examples",
  value,
  defaultValue,
  onValueChange,
  className = "",
}: CodeTabsProps) {
  const [selected, select] = useControllable(
    value,
    defaultValue ?? items.find((item) => !item.disabled)?.id ?? "",
    onValueChange,
  );
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`mingu-code-tabs ${className}`}
      layout={!reduced}
      transition={reduced ? { duration: 0 } : selectionSpring}
    >
      {items.length ? (
        <Tabs
          animated
          label={label}
          value={selected}
          onValueChange={select}
          items={items.map(({ id, label: tabLabel, disabled, ...code }) => ({
            value: id,
            label: tabLabel,
            disabled,
            content: <CodeBlock {...code} />,
          }))}
        />
      ) : (
        <p className="mingu-muted">No code examples</p>
      )}
    </motion.div>
  );
}
