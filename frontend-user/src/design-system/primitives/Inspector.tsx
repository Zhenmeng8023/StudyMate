import type { ReactNode } from "react";

export function Inspector(props: { children: ReactNode; description?: string; title: string }) {
  return (
    <aside className="ds-inspector" aria-label={props.title}>
      <header className="ds-inspector__header">
        <h2>{props.title}</h2>
        {props.description ? <p>{props.description}</p> : null}
      </header>
      <div className="ds-inspector__body">{props.children}</div>
    </aside>
  );
}
