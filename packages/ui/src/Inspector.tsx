import React, { type ReactNode } from "react";

export type InspectorProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function Inspector(props: InspectorProps) {
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
