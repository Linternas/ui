import React, {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Modal as NativeModal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "./theme";
import { Heading, Text } from "./typography";
import { Button, IconButton } from "./actions";
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  closeLabel?: string;
  dismissible?: boolean;
  returnFocusRef?: RefObject<React.ComponentRef<typeof View> | null>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Disable when the content already owns a FlatList/ScrollView. */
  scrollable?: boolean;
}
function ModalSurface({
  placement = "center",
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel = "Close",
  dismissible = true,
  returnFocusRef,
  style,
  testID,
  scrollable = true,
}: DialogProps & { placement?: "center" | "bottom" }) {
  const { colors: c, reducedMotion } = useTheme(),
    wasOpen = useRef(open);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (wasOpen.current && !open && returnFocusRef?.current) {
      timer = setTimeout(() => {
        const node =
          returnFocusRef.current && findNodeHandle(returnFocusRef.current);
        if (node) AccessibilityInfo.setAccessibilityFocus(node);
      }, 100);
    }
    wasOpen.current = open;
    return () => clearTimeout(timer);
  }, [open, returnFocusRef]);
  if (!open) return null;
  const close = () => {
    if (dismissible) onOpenChange(false);
  };
  return (
    <NativeModal
      visible
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={close}
      statusBarTranslucent
    >
      <SafeAreaProvider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: placement === "bottom" ? "flex-end" : "center",
              alignItems: "center",
            }}
          >
            <Pressable
              accessible={false}
              importantForAccessibility="no"
              onPress={close}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
            <ModalContent
              placement={placement}
              title={title}
              description={description}
              closeLabel={closeLabel}
              dismissible={dismissible}
              close={close}
              style={style}
              testID={testID}
              scrollable={scrollable}
            >
              {children}
            </ModalContent>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </NativeModal>
  );
}
function ModalContent({
  placement,
  title,
  description,
  closeLabel,
  dismissible,
  close,
  style,
  children,
  testID,
  scrollable,
}: Omit<DialogProps, "open" | "onOpenChange"> & {
  placement: "center" | "bottom";
  close: () => void;
}) {
  const { colors: c } = useTheme(),
    insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      accessibilityViewIsModal
      onAccessibilityEscape={close}
      style={[
        {
          width: placement === "bottom" ? "100%" : "90%",
          maxWidth: 600,
          maxHeight: "85%",
          borderRadius: 20,
          borderBottomLeftRadius: placement === "bottom" ? 0 : 20,
          borderBottomRightRadius: placement === "bottom" ? 0 : 20,
          backgroundColor: c.raised,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: Math.max(20, insets.bottom),
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Heading level={3}>{title}</Heading>
          {description && (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          )}
        </View>
        {dismissible && (
          <IconButton
            label={closeLabel ?? "Close"}
            variant="ghost"
            onPress={close}
          >
            <Text size="xl">×</Text>
          </IconButton>
        )}
      </View>
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16 }}
          style={{ flexGrow: 0, flexShrink: 1 }}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ gap: 16, flexShrink: 1 }}>{children}</View>
      )}
    </View>
  );
}
export function Dialog(props: DialogProps) {
  return <ModalSurface {...props} />;
}
export function BottomSheet(props: DialogProps) {
  return <ModalSurface {...props} placement="bottom" />;
}
export interface AlertDialogProps extends Omit<DialogProps, "children"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
  error?: string;
}
export function AlertDialog({
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
  error,
  onOpenChange,
  ...props
}: AlertDialogProps) {
  return (
    <Dialog {...props} onOpenChange={onOpenChange} dismissible={!loading}>
      <View style={{ gap: 12 }}>
        {error && (
          <Text tone="danger" accessibilityRole="alert">
            {error}
          </Text>
        )}
        <Button
          variant={destructive ? "danger" : "primary"}
          loading={loading}
          onPress={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onPress={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
      </View>
    </Dialog>
  );
}
export interface ActionSheetItem {
  id: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}
export function ActionSheet({
  items,
  ...props
}: Omit<DialogProps, "children"> & { items: readonly ActionSheetItem[] }) {
  return (
    <BottomSheet {...props}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.destructive ? "danger" : "ghost"}
          disabled={item.disabled}
          icon={item.icon}
          onPress={() => {
            props.onOpenChange(false);
            item.onPress();
          }}
        >
          {item.label}
        </Button>
      ))}
    </BottomSheet>
  );
}
