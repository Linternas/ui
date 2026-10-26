import React, { useRef } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useValue, clamp } from "./state";
import { TextField, type TextFieldProps } from "./forms";
import { Button } from "./actions";
import { Text } from "./typography";
export interface NumberStepperProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
  style?: StyleProp<ViewStyle>;
}
export function NumberStepper({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  decreaseLabel = "Decrease",
  increaseLabel = "Increase",
  style,
}: NumberStepperProps) {
  const low = Number.isFinite(min) ? min : 0,
    high = Number.isFinite(max) && max >= low ? max : low + 100,
    increment = Number.isFinite(step) && step > 0 ? step : 1,
    [current, setCurrent] = useValue(value, defaultValue, onValueChange),
    actual = clamp(current, low, high);
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text size="sm">{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Button
          variant="outline"
          disabled={disabled || actual <= low}
          accessibilityLabel={`${decreaseLabel} ${label}`}
          onPress={() =>
            setCurrent(
              clamp(Number((actual - increment).toFixed(8)), low, high),
            )
          }
        >
          −
        </Button>
        <Text
          accessibilityLiveRegion="polite"
          style={{ minWidth: 40, textAlign: "center" }}
        >
          {actual}
        </Text>
        <Button
          variant="outline"
          disabled={disabled || actual >= high}
          accessibilityLabel={`${increaseLabel} ${label}`}
          onPress={() =>
            setCurrent(
              clamp(Number((actual + increment).toFixed(8)), low, high),
            )
          }
        >
          +
        </Button>
      </View>
    </View>
  );
}
export interface OtpInputProps
  extends Omit<
    TextFieldProps,
    "value" | "defaultValue" | "onChangeText" | "maxLength" | "secureTextEntry"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  secure?: boolean;
}
/** One real input preserves paste, autofill, keyboard and selection behavior. */
export function OtpInput({
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  length = 6,
  secure = false,
  style,
  ...props
}: OtpInputProps) {
  const n = Math.round(clamp(length, 4, 10)),
    [code, setCode] = useValue(value, defaultValue, onValueChange),
    completed = useRef("");
  return (
    <TextField
      {...props}
      value={code}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="one-time-code"
      autoCorrect={false}
      maxLength={n * 4}
      secureTextEntry={secure}
      onChangeText={(text) => {
        const next = text.replace(/[^0-9]/g, "").slice(0, n);
        setCode(next);
        if (next.length === n && completed.current !== next) {
          completed.current = next;
          onComplete?.(next);
        } else if (next.length < n) completed.current = "";
      }}
      style={[{ letterSpacing: 8, fontSize: 24 }, style]}
    />
  );
}
