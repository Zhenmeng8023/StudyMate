import type { AuthSession } from "../api/client";
import { GraphWorkspacePage } from "../modules/graph/GraphWorkspacePage";
import { ReviewWorkspacePage } from "../modules/review/ReviewWorkspacePage";
import { graphPlaceholderColumns, reviewPlaceholderCards, WorkspaceHeader } from "../app/appShared";

export function PlaceholderBoard(props: {
  eyebrow: string;
  title: string;
  description: string;
  columns: { title: string; description: string }[];
}) {
  return (
    <>
      <WorkspaceHeader description={props.description} eyebrow={props.eyebrow} title={props.title} />
      <div className="placeholder-board">
        <article className="placeholder-lead">
          <h2>以当前学习任务为中心</h2>
          <p>从来源材料进入编辑、组织与复习，让每一步都保留可回看的上下文。</p>
        </article>
        <div className="placeholder-columns">
          {props.columns.map((column) => (
            <article className="placeholder-card" key={column.title}>
              <strong>{column.title}</strong>
              <p>{column.description}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export function LegacyGraphPage() {
  return (
    <PlaceholderBoard
      columns={graphPlaceholderColumns}
      description="图谱用于把资料、笔记和复习线索组织到同一张可追溯的知识地图中。"
      eyebrow="图谱"
      title="让知识组织真正围绕画布展开"
    />
  );
}

export function GraphPage(props: { session: AuthSession }) {
  return <GraphWorkspacePage session={props.session} />;
}

export function ReviewWorkspaceRoute(props: { session: AuthSession }) {
  return <ReviewWorkspacePage session={props.session} />;
}

export function ReviewPage() {
  return (
    <>
      <WorkspaceHeader
        description="复习系统将笔记与图谱中的重点转换为可持续回看的记忆反馈。"
        eyebrow="复习"
        title="把今日到期、错题回看和卡片来源放到一个界面里"
      />
      <div className="review-grid">
        {reviewPlaceholderCards.map((title) => (
          <article className="mini-card tall" key={title}>
            <strong>{title}</strong>
            <p>从笔记、图谱和资料生成的卡片会在这里形成连续的复习反馈。</p>
          </article>
        ))}
      </div>
    </>
  );
}
