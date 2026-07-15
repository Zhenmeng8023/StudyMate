import React, { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

export type ConfirmDialogProps = {
  cancelLabel?: string;
  className?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: React.ReactNode;
  errorMessage?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!props.isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => confirmRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !props.confirming) {
        event.preventDefault();
        props.onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [props.isOpen, props.confirming, props.onCancel]);

  if (!props.isOpen) return null;

  const confirmText = props.confirming
    ? props.confirmingLabel ?? props.confirmLabel ?? "确认中..."
    : props.confirmLabel ?? "确认";
  const hasDescription = props.description !== undefined && props.description !== null;

  return (
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !props.confirming) props.onCancel();
      }}
    >
      <section
        ref={dialogRef}
        aria-describedby={hasDescription || props.errorMessage ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={["confirm-dialog", props.className ?? ""].filter(Boolean).join(" ")}
        role="dialog"
      >
        <div className="confirm-dialog__body">
          <h2 id={titleId}>{props.title}</h2>
          {hasDescription ? (
            <div className="confirm-dialog__description" id={descriptionId}>{props.description}</div>
          ) : props.errorMessage ? (
            <div className="confirm-dialog__description" id={descriptionId} />
          ) : null}
          {props.errorMessage ? <p className="confirm-dialog__error" role="alert">{props.errorMessage}</p> : null}
        </div>
        <div className="confirm-dialog__footer">
          <Button disabled={props.confirming} onClick={props.onCancel} variant="secondary">
            {props.cancelLabel ?? "取消"}
          </Button>
          <Button
            ref={confirmRef}
            danger={props.confirmTone === "danger"}
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
