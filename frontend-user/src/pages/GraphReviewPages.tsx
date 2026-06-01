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
          <h2>这一块先用高质量占位承接整体布局</h2>
          <p>真实功能会沿当前壳层继续填充，不会再回到过去那种零散临时页的状态。</p>
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
      description="图谱页会成为产品中枢。当前先保住壳层、信息架构和上下文布局，下一阶段直接接真正画布。"
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
        description="复习系统会和笔记、图谱、AI 草稿形成闭环。现在先把面板结构留好，避免后面再拆前端。"
        eyebrow="复习"
        title="把今日到期、错题回看和卡片来源放到一个界面里"
      />
      <div className="review-grid">
        {reviewPlaceholderCards.map((title) => (
          <article className="mini-card tall" key={title}>
            <strong>{title}</strong>
            <p>这一块后面会接真实数据和复习动作。</p>
          </article>
        ))}
      </div>
    </>
  );
}
