import type { ReactNode } from "react";

export type DataStateKind = "empty" | "error" | "loading" | "stale" | "unauthorized";

export function DataState(props: {
  action?: ReactNode;
  description: string;
  kind: DataStateKind;
  title: string;
}) {
  return (
    <section className={`ds-data-state ds-data-state--${props.kind}`} aria-live={props.kind === "loading" ? "polite" : undefined}>
      <div>
        <p className="eyebrow">{stateLabel(props.kind)}</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      {props.action ? <div className="ds-data-state__action">{props.action}</div> : null}
    </section>
  );
}

function stateLabel(kind: DataStateKind) {
  if (kind === "loading") return "加载中";
  if (kind === "error") return "暂时不可用";
  if (kind === "unauthorized") return "需要登录";
  if (kind === "stale") return "需要刷新";
  return "暂无内容";
}
