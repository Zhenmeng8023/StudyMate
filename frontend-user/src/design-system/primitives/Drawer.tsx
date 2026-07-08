import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Drawer(props: {
  children: ReactNode;
  className?: string;
  description?: string;
  isOpen: boolean;
  onClose?: () => void;
  side?: "left" | "right" | "bottom";
  title: string;
}) {
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
            <X size={16} />
          </button>
        ) : null}
      </header>
      <div className="ds-drawer__body">{props.children}</div>
    </aside>
  );
}
