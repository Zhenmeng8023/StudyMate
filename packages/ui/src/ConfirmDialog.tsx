import React from "react";
import { Button } from "./Button";

export type ConfirmDialogProps = {
  cancelLabel?: string;
  className?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  if (!props.isOpen) {
    return null;
  }

  const confirmText = props.confirming ? props.confirmingLabel ?? props.confirmLabel ?? "确认中..." : props.confirmLabel ?? "确认";
  const titleId = "confirm-dialog-title";
  const descriptionId = "confirm-dialog-description";

  return (
    <div className="confirm-dialog-backdrop">
      <section
        aria-describedby={props.description || props.errorMessage ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={["confirm-dialog", props.className ?? ""].filter(Boolean).join(" ")}
        role="dialog"
      >
        <div className="confirm-dialog__body">
          <h2 id={titleId}>{props.title}</h2>
          {props.description ? <p id={descriptionId}>{props.description}</p> : props.errorMessage ? <p id={descriptionId} /> : null}
          {props.errorMessage ? <p className="confirm-dialog__error" role="alert">{props.errorMessage}</p> : null}
        </div>
        <div className="confirm-dialog__footer">
          <Button disabled={props.confirming} onClick={props.onCancel} variant="secondary">
            {props.cancelLabel ?? "取消"}
          </Button>
          <Button
            danger={props.confirmTone === "danger" ? true : undefined}
            disabled={props.confirming || props.confirmDisabled}
            onClick={props.onConfirm}
            variant="primary"
          >
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
