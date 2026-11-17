export type ConfirmDialogKey = "moderation" | "report" | "user" | "aiTask" | "template";

export const adminConfirmDialogKeys: ConfirmDialogKey[] = ["moderation", "report", "user", "aiTask", "template"];

export type ConfirmDialogHandlerMap<T> = Record<ConfirmDialogKey, T>;

export function runAdminConfirmDialogHandler<T>(
  key: ConfirmDialogKey,
  handlers: ConfirmDialogHandlerMap<(note?: string) => T>,
  note?: string
) {
  return handlers[key](note);
}

export function resetAdminConfirmDialogState(handlers: ConfirmDialogHandlerMap<() => void>) {
  for (const key of adminConfirmDialogKeys) {
    handlers[key]();
  }
}
