import type { ActionConfirmCopy } from "./adminActionConfirmCopy";
import type { ConfirmDialogKey } from "./adminConfirmDialogState";

export type AdminConfirmDialogItem = {
  key: ConfirmDialogKey;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  title: string;
};

type AdminConfirmDialogInput = {
  copy: ActionConfirmCopy;
  errorMessage: string;
  isOpen: boolean;
};

export function buildAdminConfirmDialogs(input: {
  loading: boolean;
  moderation: AdminConfirmDialogInput;
  report: AdminConfirmDialogInput;
  aiTask: AdminConfirmDialogInput;
  template: AdminConfirmDialogInput;
  user: AdminConfirmDialogInput;
}): AdminConfirmDialogItem[] {
  const { loading } = input;

  return ([
    ["moderation", input.moderation],
    ["report", input.report],
    ["aiTask", input.aiTask],
    ["template", input.template],
    ["user", input.user]
  ] as const).map(([key, dialog]) => ({
    key,
    cancelLabel: "取消",
    confirmLabel: dialog.copy.confirmLabel,
    confirmTone: dialog.copy.confirmTone,
    confirming: loading,
    confirmingLabel: dialog.copy.confirmingLabel,
    description: dialog.copy.description,
    errorMessage: dialog.errorMessage,
    isOpen: dialog.isOpen,
    title: dialog.copy.title
  }));
}
