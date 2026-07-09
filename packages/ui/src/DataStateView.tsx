import React, { type ReactNode } from "react";
import { getDataStateLabel, type DataStateKind } from "./dataState";

export type DataStateProps = {
  action?: ReactNode;
  description: string;
  kind: DataStateKind;
  title: string;
};

export function DataState(props: DataStateProps) {
  return (
    <section className={`ds-data-state ds-data-state--${props.kind}`} aria-live={props.kind === "loading" ? "polite" : undefined}>
      <div>
        <p className="eyebrow">{getDataStateLabel(props.kind)}</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      {props.action ? <div className="ds-data-state__action">{props.action}</div> : null}
    </section>
  );
}
