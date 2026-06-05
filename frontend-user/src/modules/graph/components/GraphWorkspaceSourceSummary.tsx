import { Link2 } from "lucide-react";
import type { GraphSourceReferenceSummary } from "@studymate/graph-core";
import { buildGraphSourceBacklinkFromSource } from "../lib/graphSourceBacklinks";

export function GraphWorkspaceSourceSummary(props: {
  onOpenSource: (target: string) => void;
  summary: GraphSourceReferenceSummary;
}) {
  const { summary } = props;
  const hasSourceRelations = summary.references.length > 0 || summary.isolatedNodeCount > 0;

  return (
    <div className="graph-rail-section" aria-label="图谱来源摘要">
      <div className="section-frame-head compact">
        <div>
          <p className="eyebrow">来源关系</p>
          <h2>图谱引用</h2>
        </div>
      </div>
      {hasSourceRelations ? (
        <div className="graph-form-stack">
          <div className="graph-source-summary-list" aria-label="来源类型统计">
            {summary.typeBuckets.map((bucket) => (
              <span className="graph-source-summary-pill" key={bucket.type}>
                {bucket.label} · {bucket.referenceCount} 来源 / {bucket.nodeCount} 节点
              </span>
            ))}
            {summary.isolatedNodeCount ? (
              <span className="graph-source-summary-pill warning">
                孤立/无来源 · {summary.isolatedNodeCount} 节点
              </span>
            ) : null}
          </div>
          <div className="graph-source-reference-list">
            {summary.references.slice(0, 5).map((reference) => {
              const backlink = buildGraphSourceBacklinkFromSource({
                type: reference.type,
                id: reference.id,
                label: reference.label,
                excerpt: reference.excerpt
              });
              return (
                <article className="graph-source-reference-item" key={reference.key}>
                  <div>
                    <strong>{reference.label}</strong>
                    <span>{reference.nodeCount} 个节点 · {backlink?.sourceTypeLabel ?? reference.type}</span>
                  </div>
                  {reference.excerpt ? <p>{reference.excerpt}</p> : null}
                  {backlink ? (
                    <button className="ghost-button compact" onClick={() => props.onOpenSource(backlink.target)} type="button">
                      <Link2 size={14} />
                      {backlink.actionLabel}
                    </button>
                  ) : null}
                </article>
              );
            })}
            {summary.references.length > 5 ? (
              <article className="graph-meta-card muted">
                <strong>还有 {summary.references.length - 5} 个来源</strong>
                <p>可通过节点详情回到具体资料、笔记或批注上下文。</p>
              </article>
            ) : null}
          </div>
        </div>
      ) : (
        <article className="graph-meta-card muted">
          <strong>暂无来源引用</strong>
          <p>从资料、笔记或批注生成节点后，这里会显示图谱和原始学习内容的关系。</p>
        </article>
      )}
    </div>
  );
}
