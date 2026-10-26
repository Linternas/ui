import React, {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  View,
  TextInput,
  Switch as NativeSwitch,
  Pressable,
  FlatList,
  Platform,
  type TextInputProps,
  type SwitchProps as NativeSwitchProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { tokens, type ControlSize } from "../../tokens/src";
import { useTheme } from "./theme";
import { Text } from "./typography";
import { Button } from "./actions";
import { BottomSheet } from "./overlays";
import { useValue } from "./state";
export interface InputProps extends TextInputProps {
  controlSize?: ControlSize;
  invalid?: boolean;
  ref?: Ref<React.ComponentRef<typeof TextInput>>;
}
export function Input({
  controlSize = "md",
  invalid = false,
  editable = true,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors: c } = useTheme(),
    [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      editable={editable}
      placeholderTextColor={props.placeholderTextColor ?? c.muted}
      selectionColor={props.selectionColor ?? c.accent}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        {
          color: c.text,
          backgroundColor: editable ? c.raised : c.surface,
          borderColor: invalid
            ? c.danger
            : focused
              ? c.accent
              : c["control-border"],
          borderWidth: 1,
          borderRadius: tokens.radii.md,
          minHeight: Math.max(44, tokens.control[controlSize].height),
          paddingHorizontal: tokens.control[controlSize].padding,
          paddingVertical: 12,
          fontSize: 16,
          textAlignVertical: props.multiline ? "top" : "center",
          opacity: editable ? 1 : 0.6,
        },
        style,
      ]}
    />
  );
}
export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}
export function Field({
  label,
  hint,
  error,
  required,
  children,
  style,
}: FieldProps) {
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text size="sm" weight="medium">
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
      {(error || hint) && (
        <Text
          size="xs"
          tone={error ? "danger" : "muted"}
          accessibilityLiveRegion={error ? "polite" : "none"}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}
export interface TextFieldProps extends InputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}
export function TextField({
  label,
  hint,
  error,
  required,
  containerStyle,
  accessibilityHint,
  ...props
}: TextFieldProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      style={containerStyle}
    >
      <Input
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={
          [accessibilityHint, error || hint, required ? "Required" : undefined]
            .filter(Boolean)
            .join(". ") || undefined
        }
        invalid={!!error || props.invalid}
      />
    </Field>
  );
}
export function TextareaField(props: TextFieldProps) {
  return (
    <TextField {...props} multiline style={[{ minHeight: 120 }, props.style]} />
  );
}
export function PasswordField({
  label,
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...props
}: TextFieldProps & { showLabel?: string; hideLabel?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <TextField
        {...props}
        label={label}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        size="sm"
        variant="ghost"
        disabled={props.editable === false}
        accessibilityState={{ expanded: visible }}
        onPress={() => setVisible((v) => !v)}
      >
        {visible ? hideLabel : showLabel}
      </Button>
    </View>
  );
}
export function SearchField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
  );
}
export function NumberField(props: TextFieldProps) {
  return (
    <TextField {...props} keyboardType={props.keyboardType ?? "decimal-pad"} />
  );
}
export interface CheckboxProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  hint,
  style,
  testID,
}: CheckboxProps) {
  const { colors: c } = useTheme(),
    [value, setValue] = useValue(checked, defaultChecked, onCheckedChange);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{
        checked: indeterminate ? "mixed" : value,
        disabled,
      }}
      disabled={disabled}
      onPress={() => setValue(!value)}
      style={({ pressed }) => [
        {
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <View
        accessible={false}
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: value || indeterminate ? c.accent : c["control-border"],
          backgroundColor: value || indeterminate ? c.accent : c.raised,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <View
            style={{ width: 12, height: 2, backgroundColor: c["on-accent"] }}
          />
        ) : value ? (
          <View
            style={{
              width: 12,
              height: 7,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: c["on-accent"],
              transform: [{ rotate: "-45deg" }, { translateY: -1 }],
            }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text size="sm">{label}</Text>
        {hint && (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
export interface SwitchProps extends NativeSwitchProps {
  label: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
}
export function Switch({ label, hint, containerStyle, ...props }: SwitchProps) {
  const { colors: c } = useTheme();
  return (
    <View
      style={[
        {
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          justifyContent: "space-between",
        },
        containerStyle,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text size="sm">{label}</Text>
        {hint && (
          <Text size="xs" tone="muted">
            {hint}
          </Text>
        )}
      </View>
      <NativeSwitch
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={props.accessibilityHint ?? hint}
        trackColor={props.trackColor ?? { false: c.border, true: c.accent }}
        thumbColor={
          props.thumbColor ??
          (Platform.OS === "android"
            ? props.value
              ? c["on-accent"]
              : c.raised
            : undefined)
        }
      />
    </View>
  );
}
export interface Choice {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface ChoiceGroupProps {
  label: string;
  options: readonly Choice[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  style,
}: ChoiceGroupProps) {
  const { colors: c } = useTheme(),
    [selected, setSelected] = useValue(value, defaultValue, onValueChange);
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[{ gap: 8 }, style]}
    >
      <Text size="sm" weight="medium">
        {label}
      </Text>
      {options.map((item) => (
        <Pressable
          key={item.value}
          accessibilityRole="radio"
          accessibilityLabel={item.label}
          accessibilityHint={item.description}
          accessibilityState={{
            checked: selected === item.value,
            disabled: !!(disabled || item.disabled),
          }}
          disabled={disabled || item.disabled}
          onPress={() => setSelected(item.value)}
          style={{
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: disabled || item.disabled ? 0.5 : 1,
          }}
        >
          <View
            accessible={false}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderColor:
                selected === item.value ? c.accent : c["control-border"],
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected === item.value && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: c.accent,
                }}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text size="sm">{item.label}</Text>
            {item.description && (
              <Text size="xs" tone="muted">
                {item.description}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
export function SegmentedControl({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  style,
}: ChoiceGroupProps) {
  const { colors: c } = useTheme(),
    [selected, setSelected] = useValue(
      value,
      defaultValue ?? options.find((o) => !o.disabled)?.value ?? "",
      onValueChange,
    );
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          backgroundColor: c.surface,
          borderRadius: 12,
          padding: 4,
          gap: 4,
        },
        style,
      ]}
    >
      {options.map((item) => (
        <Pressable
          key={item.value}
          accessibilityRole="radio"
          accessibilityLabel={item.label}
          accessibilityState={{
            checked: selected === item.value,
            disabled: !!(disabled || item.disabled),
          }}
          disabled={disabled || item.disabled}
          onPress={() => setSelected(item.value)}
          style={{
            flexGrow: 1,
            minHeight: 44,
            paddingHorizontal: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: selected === item.value ? c.raised : "transparent",
            borderRadius: 8,
            opacity: disabled || item.disabled ? 0.5 : 1,
          }}
        >
          <Text
            size="sm"
            weight={selected === item.value ? "semibold" : "regular"}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export interface SelectProps extends ChoiceGroupProps {
  placeholder?: string;
  searchable?: boolean;
  searchLabel?: string;
  emptyLabel?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  closeLabel?: string;
}
export function Select({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  style,
  placeholder = "Choose…",
  searchable = false,
  searchLabel = "Search options",
  emptyLabel = "No matching options",
  hint,
  error,
  required,
  closeLabel = "Close",
}: SelectProps) {
  const { colors: c } = useTheme(),
    [selected, setSelected] = useValue(value, defaultValue, onValueChange),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    trigger = useRef<React.ComponentRef<typeof View>>(null),
    item = options.find((o) => o.value === selected);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const filtered = options.filter((o) =>
    `${o.label} ${o.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      style={style}
    >
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${item?.label ?? placeholder}`}
        accessibilityHint={error || hint}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => {
          setQuery("");
          setOpen(true);
        }}
        style={{
          minHeight: 48,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderWidth: 1,
          borderColor: error ? c.danger : c["control-border"],
          borderRadius: 10,
          backgroundColor: c.raised,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text size="sm" tone={item ? "default" : "muted"} style={{ flex: 1 }}>
          {item?.label ?? placeholder}
        </Text>
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            width: 9,
            height: 9,
            borderRightWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: c.text,
            transform: [{ rotate: "45deg" }],
            marginBottom: 4,
            marginHorizontal: 4,
          }}
        />
      </Pressable>
      <BottomSheet
        open={open && !disabled}
        onOpenChange={setOpen}
        title={label}
        closeLabel={closeLabel}
        returnFocusRef={trigger}
        scrollable={false}
      >
        {searchable && (
          <Input
            accessibilityLabel={searchLabel}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        )}
        <FlatList
          data={filtered}
          keyExtractor={(option) => option.value}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: 360, flexShrink: 1 }}
          ListEmptyComponent={<Text tone="muted">{emptyLabel}</Text>}
          renderItem={({ item: option }) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              accessibilityState={{
                checked: selected === option.value,
                disabled: !!option.disabled,
              }}
              disabled={option.disabled}
              onPress={() => {
                setSelected(option.value);
                setOpen(false);
              }}
              style={{
                minHeight: 48,
                paddingVertical: 12,
                paddingHorizontal: 8,
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                backgroundColor:
                  selected === option.value ? c["accent-soft"] : "transparent",
                borderRadius: 8,
                opacity: option.disabled ? 0.5 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text size="sm">{option.label}</Text>
                {option.description && (
                  <Text size="xs" tone="muted">
                    {option.description}
                  </Text>
                )}
              </View>
              {selected === option.value && <Text tone="accent">✓</Text>}
            </Pressable>
          )}
        />
      </BottomSheet>
    </Field>
  );
}
export const SelectField = Select;
