import React, { type ReactNode } from "react";

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
  if (!props.isOpen) {
    return null;
  }

  return (
    <aside className={["ds-drawer", `ds-drawer--${props.side ?? "left"}`, props.className ?? ""].filter(Boolean).join(" ")} aria-label={props.title}>
      <header className="ds-drawer__header">
        <div>
          <h2>{props.title}</h2>
          {props.description ? <p>{props.description}</p> : null}
        </div>
        {props.onClose ? (
          <button aria-label={`关闭${props.title}`} className="icon-button" onClick={props.onClose} type="button">
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </header>
      <div className="ds-drawer__body">{props.children}</div>
    </aside>
  );
}
