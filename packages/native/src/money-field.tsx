import { Icon } from "./icons";
import React, { useState } from "react";
import { View } from "react-native";
import { TextField, type TextFieldProps } from "./forms";
import { IconButton } from "./actions";
import { Text } from "./typography";
import { useValue } from "./state";
export interface MoneyFieldProps
  extends Omit<
    TextFieldProps,
    "value" | "defaultValue" | "onChangeText" | "keyboardType"
  > {
  /** Canonical decimal editing string, without grouping or unit. Empty and '-' are valid drafts. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  unit?: string;
  grouping?: boolean;
  allowDecimal?: boolean;
  decimalScale?: number;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  rangeError?: string;
  signLabel?: string;
}
export function normalizeMoneyInput(
  text: string,
  allowNegative = false,
  allowDecimal = false,
  decimalScale = 2,
): string {
  const negative = allowNegative && text.trim().startsWith("-");
  const clean = text.replace(/[^\d.]/g, "");
  const dot = clean.indexOf(".");
  const scale = Number.isFinite(decimalScale)
    ? Math.max(0, Math.min(12, Math.floor(decimalScale)))
    : 2;
  const body =
    allowDecimal && scale > 0 && dot >= 0
      ? `${clean.slice(0, dot)}.${clean
          .slice(dot + 1)
          .replace(/\./g, "")
          .slice(0, scale)}`
      : clean.replace(/\./g, "");
  return `${negative ? "-" : ""}${body}`;
}
export function parseMoneyInput(value: string): number | null {
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
export function formatMoneyInput(value: string): string {
  const [whole, fraction] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}
export function MoneyField({
  value,
  defaultValue = "",
  onValueChange,
  label,
  unit,
  grouping = true,
  allowDecimal = false,
  decimalScale = 2,
  allowNegative = false,
  min,
  max,
  rangeError = "Amount is outside the allowed range",
  signLabel = "Change amount sign",
  onFocus,
  onBlur,
  error,
  editable = true,
  ...props
}: MoneyFieldProps) {
  const [current, setCurrent] = useValue(value, defaultValue, onValueChange),
    [focused, setFocused] = useState(false);
  const parsed = parseMoneyInput(current),
    outside =
      parsed !== null &&
      ((min !== undefined && parsed < min) ||
        (max !== undefined && parsed > max));
  return (
    <View style={{ gap: 8 }}>
      <TextField
        {...props}
        label={label}
        editable={editable}
        value={focused || !grouping ? current : formatMoneyInput(current)}
        keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
        error={error ?? (outside ? rangeError : undefined)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onChangeText={(text) =>
          setCurrent(
            normalizeMoneyInput(
              text,
              allowNegative,
              allowDecimal,
              decimalScale,
            ),
          )
        }
      />
      {(unit || allowNegative) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {unit && (
            <Text size="sm" tone="muted">
              {unit}
            </Text>
          )}
          {allowNegative && (
            <IconButton
              variant="outline"
              disabled={!editable}
              label={signLabel}
              onPress={() =>
                setCurrent(
                  current.startsWith("-") ? current.slice(1) : `-${current}`,
                )
              }
            >
              <Icon name="sign" />
            </IconButton>
          )}
        </View>
      )}
    </View>
  );
}
