import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Layers3 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import type { AuthSession, SourceProfilePayload } from "../api/client";
import { getSourceProfile } from "../api/review";
import { WorkspaceHeader } from "../app/appShared";
import { DataState } from "../design-system/primitives";
import { buildPrimarySourceLink, buildSourceBacklinkTarget, normalizeSourceType } from "../features/sources/sourceLinks";

function formatMasteryLevel(level?: string) {
  switch (level) {
    case "weak":
      return "薄弱";
    case "solid":
      return "已掌握";
    case "building":
      return "学习中";
    default:
      return level || "学习中";
  }
}

function formatSourceType(sourceType: string) {
  switch (normalizeSourceType(sourceType)) {
    case "annotation":
    case "pdf-anchor":
    case "material":
      return "PDF / 资料";
    case "note":
    case "note-block":
      return "笔记";
    case "graph":
    case "graph-node":
      return "图谱";
    case "ai-draft":
    case "ai-task":
      return "AI";
    case "card":
      return "卡片";
    default:
      return sourceType || "来源";
  }
}

function formatReviewRating(rating: string) {
  switch (rating) {
    case "again":
      return "Again";
    case "hard":
      return "Hard";
    case "good":
      return "Good";
    case "easy":
      return "Easy";
    default:
      return rating || "评分";
  }
}

function formatDateTime(value?: string) {
  if (!value) {
    return "暂无";
  }
  return new Date(value).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function SourceProfilePage(props: { session: AuthSession }) {
  const [searchParams] = useSearchParams();
  const sourceType = normalizeSourceType(searchParams.get("sourceType") || "");
  const sourceId = searchParams.get("sourceId")?.trim() || "";
  const [profile, setProfile] = useState<SourceProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sourceLink = useMemo(() => profile ? buildPrimarySourceLink(profile) : null, [profile]);
  const sourceBacklink = profile?.target || buildSourceBacklinkTarget(sourceLink);
  const reviewTarget = sourceType && sourceId ? `/review?sourceType=${encodeURIComponent(sourceType)}&sourceId=${encodeURIComponent(sourceId)}` : "/review";

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setLoading(true);
      setError("");
      setProfile(null);
      if (!sourceType || !sourceId) {
        setLoading(false);
        setError("缺少来源类型或来源 ID。");
        return;
      }
      try {
        const payload = await getSourceProfile(props.session, { sourceType, sourceId });
        if (!cancelled) {
          setProfile(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "读取来源学习档案失败。");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [props.session, sourceId, sourceType]);

  const state = loading
    ? { kind: "loading" as const, title: "正在打开来源档案", description: "正在读取这个来源关联的 CardNote、复习队列和最近评分。" }
    : error
      ? { kind: "error" as const, title: "来源档案暂时不可用", description: error }
      : !profile
        ? { kind: "empty" as const, title: "没有找到来源档案", description: "从 Dashboard、图谱或复习页进入，可以携带更准确的来源定位。" }
        : null;

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        actions={<Link className="secondary-button" to="/review">返回复习</Link>}
        description="把回跳字段升级成可长期维护的学习对象。"
        eyebrow="Source 学习档案"
        title={profile?.title || sourceId || "来源档案"}
      />

      {state ? <DataState description={state.description} kind={state.kind} title={state.title} /> : null}

      {profile ? (
        <>
          <section className="section-frame">
            <div className="section-frame-head">
              <div>
                <span className="eyebrow">{formatSourceType(profile.sourceType)}</span>
                <h2>{profile.title || profile.sourceId}</h2>
                <p>{profile.excerpt || "这个来源已经进入复习系统，可以从这里查看掌握度、队列分布和最近复习记录。"}</p>
              </div>
              <div className="header-actions">
                <Link className="primary-button" to={reviewTarget}><BookOpenCheck size={16} />去复习</Link>
                {sourceBacklink ? <Link className="secondary-button" to={sourceBacklink}>回到来源</Link> : null}
                <Link className="secondary-button" to={sourceBacklink || "/reader"}><Layers3 size={16} />为此来源补卡</Link>
              </div>
            </div>
            <div className="metrics-grid">
              <article className="metric-card"><span>掌握度</span><strong>{profile.masteryScore}%</strong><small>{formatMasteryLevel(profile.masteryLevel)}</small></article>
              <article className="metric-card"><span>到期</span><strong>{profile.dueCount}</strong><small>张卡片</small></article>
              <article className="metric-card"><span>学习中</span><strong>{profile.learningCount}</strong><small>张卡片</small></article>
              <article className="metric-card"><span>最近复习</span><strong>{formatDateTime(profile.lastReviewedAt)}</strong><small>基于 ReviewLog</small></article>
            </div>
          </section>

          <section className="section-frame">
            <div className="section-frame-head">
              <div>
                <span className="eyebrow">队列分布</span>
                <h2>这个来源的 GeneratedCards</h2>
              </div>
            </div>
            <div className="mini-card-grid">
              {Object.entries(profile.queueStates).map(([stateName, count]) => (
                <article className="mini-card" key={stateName}><strong>{stateName}</strong><p>{count} 张</p></article>
              ))}
            </div>
          </section>

          <section className="section-frame">
            <div className="section-frame-head">
              <div>
                <span className="eyebrow">CardNotes</span>
                <h2>关联笔记与卡片</h2>
              </div>
            </div>
            <div className="mini-card-grid stacked">
              {profile.cardNotes?.length ? profile.cardNotes.map((note) => (
                <article className="mini-card" key={note.cardNote.id}>
                  <strong>{note.cardNote.fields?.front || note.cardNote.fields?.text || `CardNote ${note.cardNote.id}`}</strong>
                  <p>{`${note.cardNote.noteTypeCode || "basic"} · ${note.generatedCards.length} 张卡`}</p>
                  <small>{note.tags?.length ? note.tags.join(" / ") : "暂无标签"}</small>
                </article>
              )) : <DataState description="这个来源暂时还没有 CardNote，可以从原来源继续补卡。" kind="empty" title="暂无 CardNote" />}
            </div>
          </section>

          <section className="section-frame">
            <div className="section-frame-head">
              <div>
                <span className="eyebrow">最近复习</span>
                <h2>评分记录</h2>
              </div>
            </div>
            <div className="mini-card-grid stacked">
              {profile.recentReviews?.length ? profile.recentReviews.map((review) => (
                <article className="mini-card" key={review.reviewId}>
                  <strong>{formatReviewRating(review.rating)}</strong>
                  <p>{formatDateTime(review.reviewedAt)}</p>
                  <Link className="secondary-button" to={`/review?card=${encodeURIComponent(review.cardId)}`}>
                    打开卡片 <ArrowRight size={14} />
                  </Link>
                </article>
              )) : <DataState description="完成一次复习后，这里会显示最近评分。" kind="empty" title="暂无复习记录" />}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default SourceProfilePage;
