import React, { type ReactNode, useEffect, useId, useRef } from "react";
import { IconButton } from "./IconButton";

export type DrawerProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  isOpen: boolean;
  onClose?: () => void;
  side?: "left" | "right" | "bottom";
  title: string;
};

export function Drawer(props: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!props.isOpen || !props.onClose) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        props.onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [props.isOpen, props.onClose]);

  if (!props.isOpen) return null;

  return (
    <aside
      aria-describedby={props.description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className={["ds-drawer", `ds-drawer--${props.side ?? "left"}`, props.className ?? ""].filter(Boolean).join(" ")}
      role="dialog"
    >
      <header className="ds-drawer__header">
        <div>
          <h2 id={titleId}>{props.title}</h2>
          {props.description ? <p id={descriptionId}>{props.description}</p> : null}
        </div>
        {props.onClose ? (
          <IconButton ref={closeRef} aria-label={`关闭${props.title}`} onClick={props.onClose}>
            <span aria-hidden="true">×</span>
          </IconButton>
        ) : null}
      </header>
      <div className="ds-drawer__body">{props.children}</div>
    </aside>
  );
}
