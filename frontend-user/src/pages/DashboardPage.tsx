import { type ReactNode, useEffect, useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import type { AiDraftPayload, AiTaskPayload, AuthSession, MaterialPayload, NotePayload, PostSummary, ReviewFeedbackPayload, ReviewQueuePayload } from "../api/client";
import { listAiDrafts, listAiTasks } from "../api/ai";
import { listMaterials, listNotes, listPosts } from "../api/client";
import { getReviewFeedback, getTodayReviewQueue } from "../api/review";
import {
  displayMaterialCategory,
  displayMaterialDescription,
  displayMaterialTitle,
  displayNoteSummary,
  displayNoteTitle,
  displayPostBody,
  displayPostTitle,
  formatDate,
  MetricTile,
  quickActions,
  SectionFrame,
  WorkspaceHeader
} from "../app/appShared";
import { DataState } from "../design-system/primitives";
import { formatAiStatusLabel, formatAiTaskLabel } from "../features/ai/aiDrafts";

type DashboardSectionState =
  | {
      kind: "loading" | "empty" | "error" | "unauthorized";
      title: string;
      description: string;
    }
  | null;

export function DashboardPage(props: { session: AuthSession | null }) {
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueuePayload | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedbackPayload | null>(null);
  const [aiDrafts, setAiDrafts] = useState<AiDraftPayload[]>([]);
  const [aiTasks, setAiTasks] = useState<AiTaskPayload[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(Boolean(props.session));
  const [reviewLoading, setReviewLoading] = useState(Boolean(props.session));
  const [feedbackLoading, setFeedbackLoading] = useState(Boolean(props.session));
  const [aiLoading, setAiLoading] = useState(Boolean(props.session));
  const [materialsError, setMaterialsError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [aiError, setAiError] = useState("");

  async function loadMaterialsSection() {
    setMaterialsLoading(true);
    setMaterialsError("");
    try {
      setMaterials(await listMaterials());
    } catch (error) {
      setMaterials([]);
      setMaterialsError(error instanceof Error ? error.message : "读取资料首页失败。");
    } finally {
      setMaterialsLoading(false);
    }
  }

  async function loadPostsSection() {
    setPostsLoading(true);
    setPostsError("");
    try {
      setPosts(await listPosts());
    } catch (error) {
      setPosts([]);
      setPostsError(error instanceof Error ? error.message : "读取社区动态失败。");
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadNotesSection(session: AuthSession) {
    setNotesLoading(true);
    setNotesError("");
    try {
      setNotes(await listNotes(session));
    } catch (error) {
      setNotes([]);
      setNotesError(error instanceof Error ? error.message : "读取个人笔记失败。");
    } finally {
      setNotesLoading(false);
    }
  }

  async function loadReviewSection(session: AuthSession) {
    setReviewLoading(true);
    setReviewError("");
    try {
      setReviewQueue(await getTodayReviewQueue(session));
    } catch (error) {
      setReviewQueue(null);
      setReviewError(error instanceof Error ? error.message : "读取今日复习失败。");
    } finally {
      setReviewLoading(false);
    }
  }

  async function loadFeedbackSection(session: AuthSession) {
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      setReviewFeedback(await getReviewFeedback(session));
    } catch (error) {
      setReviewFeedback(null);
      setFeedbackError(error instanceof Error ? error.message : "读取复习反馈失败。");
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function loadAiSection(session: AuthSession) {
    setAiLoading(true);
    setAiError("");
    try {
      const [drafts, tasks] = await Promise.all([listAiDrafts(session), listAiTasks(session)]);
      setAiDrafts(drafts);
      setAiTasks(tasks);
    } catch (error) {
      setAiDrafts([]);
      setAiTasks([]);
      setAiError(error instanceof Error ? error.message : "读取 AI 工作台失败。");
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    void loadMaterialsSection();
    void loadPostsSection();
  }, []);

  useEffect(() => {
    if (!props.session) {
      setNotes([]);
      setNotesError("");
      setNotesLoading(false);
      setReviewQueue(null);
      setReviewError("");
      setReviewLoading(false);
      setReviewFeedback(null);
      setFeedbackError("");
      setFeedbackLoading(false);
      setAiDrafts([]);
      setAiTasks([]);
      setAiError("");
      setAiLoading(false);
      return;
    }

    void loadNotesSection(props.session);
    void loadReviewSection(props.session);
    void loadFeedbackSection(props.session);
    void loadAiSection(props.session);
  }, [props.session]);

  const recentMaterials = materials.slice(0, 4);
  const recentNotes = notes.slice(0, 4);
  const recentPosts = posts.slice(0, 4);
  const recentReviewItems = reviewQueue?.items.slice(0, 3) || [];
  const weakReviewCards = reviewFeedback?.weakCards.slice(0, 3) || [];
  const pendingAiTasks = aiTasks.filter((task) => !["completed", "confirmed", "failed"].includes(task.status));
  const recentAiDrafts = aiDrafts.slice(0, 2);
  const recentAiTasks = (pendingAiTasks.length ? pendingAiTasks : aiTasks).slice(0, 2);
  const pendingWorkspaceCount = (reviewQueue?.dueCount || 0) + aiDrafts.length + pendingAiTasks.length;

  const materialsState: DashboardSectionState = materialsLoading
    ? {
        kind: "loading",
        title: "正在加载最近资料",
        description: "准备你最近整理和上传过的学习资料。"
      }
    : materialsError
      ? {
          kind: "error",
          title: "最近资料暂时不可用",
          description: materialsError
        }
      : recentMaterials.length
        ? null
        : {
            kind: "empty",
            title: "还没有可继续的资料",
            description: "先上传一份学习材料，或者回到资料库整理已有内容。"
          };

  const postsState: DashboardSectionState = postsLoading
    ? {
        kind: "loading",
        title: "正在加载社区动态",
        description: "准备最近公开分享出来的学习内容。"
      }
    : postsError
      ? {
          kind: "error",
          title: "社区动态暂时不可用",
          description: postsError
        }
      : recentPosts.length
        ? null
        : {
            kind: "empty",
            title: "还没有公开分享",
            description: "社区里出现的新内容会先在这里汇总，方便你从学习区直接切过去看。"
          };

  const notesState: DashboardSectionState = !props.session
    ? {
        kind: "unauthorized",
        title: "登录后查看个人笔记",
        description: "登录后继续回到你最近的阅读笔记与整理上下文。"
      }
    : notesLoading
      ? {
          kind: "loading",
          title: "正在加载个人笔记",
          description: "准备你最近保存和整理过的学习笔记。"
        }
      : notesError
        ? {
            kind: "error",
            title: "个人笔记暂时不可用",
            description: notesError
          }
        : recentNotes.length
          ? null
          : {
              kind: "empty",
              title: "还没有个人笔记",
              description: "先从资料库进入一份材料，或者直接在笔记页新建一条阅读笔记。"
            };

  const reviewState: DashboardSectionState = !props.session
    ? {
        kind: "unauthorized",
        title: "登录后查看今日复习",
        description: "登录后直接接上今天待完成的复习队列。"
      }
    : reviewLoading
      ? {
          kind: "loading",
          title: "正在加载今日复习",
          description: "准备你今天最该先完成的卡片。"
        }
      : reviewError
        ? {
            kind: "error",
            title: "今日复习暂时不可用",
            description: reviewError
          }
        : reviewQueue && reviewQueue.dueCount > 0
          ? null
          : {
              kind: "empty",
              title: "今天的复习队列已经清空",
              description: "如果要继续整理卡片，可以去复习工作台管理牌组和来源草稿。"
            };

  const aiState: DashboardSectionState = !props.session
    ? {
        kind: "unauthorized",
        title: "登录后查看 AI 草稿",
        description: "登录后继续处理最近生成的草稿和任务。"
      }
    : aiLoading
      ? {
          kind: "loading",
          title: "正在加载 AI 工作台",
          description: "准备最近生成的 AI 草稿和任务。"
        }
      : aiError
        ? {
            kind: "error",
            title: "AI 工作台暂时不可用",
            description: aiError
          }
        : recentAiDrafts.length || recentAiTasks.length
          ? null
          : {
              kind: "empty",
              title: "还没有 AI 草稿",
              description: "从阅读、笔记或图谱生成草稿后，这里会优先展示待确认内容。"
            };

  const feedbackState: DashboardSectionState = !props.session
    ? {
        kind: "unauthorized",
        title: "登录后查看学习反馈",
        description: "登录后查看最近反复遗忘或仍在学习中的卡片。"
      }
    : feedbackLoading
      ? {
          kind: "loading",
          title: "正在加载学习反馈",
          description: "准备你最近最需要优先回补的卡片。"
        }
      : feedbackError
        ? {
            kind: "error",
            title: "学习反馈暂时不可用",
            description: feedbackError
          }
        : reviewFeedback && reviewFeedback.weakCardCount > 0
          ? null
          : {
              kind: "empty",
              title: "最近没有明显薄弱点",
              description: "继续保持当前复习节奏，新的反馈会在这里出现。"
            };

  function formatFeedbackStateLabel(state: string) {
    switch (state) {
      case "learning":
        return "学习中";
      case "relearning":
        return "重新学习";
      case "review":
        return "复习中";
      case "new":
      default:
        return "新卡";
    }
  }

  function renderSectionState(state: Exclude<DashboardSectionState, null>, action?: ReactNode) {
    return <DataState action={action} description={state.description} kind={state.kind} title={state.title} />;
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <Link className="secondary-button" to="/materials">
              <Upload size={16} />
              管理资料
            </Link>
            <Link className="primary-button" to={props.session ? "/reader" : "/login"}>
              <BookOpen size={16} />
              继续阅读
            </Link>
          </div>
        }
        description="从最近资料、笔记和图谱中选择一项继续，学习过程会自动回到你上一次停下的位置。"
        eyebrow="学习控制台"
        title={props.session ? `你好，${props.session.user.displayName}` : "从一项学习任务开始"}
      />

      <section aria-label="继续学习" className="dashboard-continue-card">
        <div className="dashboard-continue-card__copy">
          <p className="eyebrow">下一步</p>
          <h2>把注意力放在一件正在推进的事上</h2>
          <p>阅读、笔记、图谱和复习都保留在同一个学习空间里；从最近一份资料继续即可。</p>
        </div>
        <div className="dashboard-continue-card__actions">
          <Link className="primary-button" to={props.session ? "/reader" : "/login"}>
            <BookOpen size={16} />
            继续阅读
          </Link>
          <Link className="secondary-button" to={props.session ? "/graph" : "/login"}>
            查看图谱
          </Link>
        </div>
        <div aria-label="学习资产概览" className="dashboard-continue-card__facts">
          <span><strong>{materials.length}</strong> 份资料</span>
          <span><strong>{reviewQueue?.dueCount || 0}</strong> 张待复习</span>
          <span><strong>{aiDrafts.length + pendingAiTasks.length}</strong> 项待处理</span>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricTile helper="公开资料和已整理附件总数" label="资料数" value={String(materials.length)} />
        <MetricTile helper="已经沉淀下来的个人笔记" label="笔记数" value={String(notes.length)} />
        <MetricTile helper="社区里可浏览的公开内容" label="社区分享" value={String(posts.length)} />
        <MetricTile helper="复习与 AI 草稿会在这里汇总成今天的最小待办" label="今日待办" value={props.session ? String(pendingWorkspaceCount) : "登录后查看"} />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <SectionFrame
            action={
              <Link className="bookmark-chip" to="/materials">
                打开资料库
              </Link>
            }
            className="dashboard-section dashboard-section-materials"
            subtitle="最近资料"
            title="从资料继续"
          >
            {materialsState ? renderSectionState(
              materialsState,
              materialsState.kind === "error" ? (
                <button className="secondary-button" onClick={() => void loadMaterialsSection()} type="button">
                  重新加载
                </button>
              ) : materialsState.kind === "empty" ? (
                <Link className="secondary-button" to="/materials">
                  打开资料库
                </Link>
              ) : undefined
            ) : (
              <div className="list-stack dense">
                {recentMaterials.map((material) => (
                  <Link className="list-row compact" key={material.id} to={`/materials?selected=${material.id}`}>
                    <div>
                      <strong>{displayMaterialTitle(material)}</strong>
                      <p>{displayMaterialDescription(material)}</p>
                    </div>
                    <span>{displayMaterialCategory(material)}</span>
                  </Link>
                ))}
              </div>
            )}
          </SectionFrame>

          <SectionFrame
            action={
              <Link className="bookmark-chip" to="/community">
                进入社区
              </Link>
            }
            className="dashboard-section dashboard-section-community"
            subtitle="社区动态"
            title="最近公开分享"
          >
            {postsState ? renderSectionState(
              postsState,
              postsState.kind === "error" ? (
                <button className="secondary-button" onClick={() => void loadPostsSection()} type="button">
                  重新加载
                </button>
              ) : postsState.kind === "empty" ? (
                <Link className="secondary-button" to="/community">
                  进入社区
                </Link>
              ) : undefined
            ) : (
              <div className="story-card-grid">
                {recentPosts.map((post) => (
                  <article className="story-card" key={post.id}>
                    <div className="story-card-head">
                      <strong>{displayPostTitle(post)}</strong>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <p>{displayPostBody(post).slice(0, 120)}</p>
                  </article>
                ))}
              </div>
            )}
          </SectionFrame>
        </div>

        <div className="dashboard-side-column">
          <SectionFrame
            action={
              <Link className="bookmark-chip" to={props.session ? "/notes" : "/login"}>
                打开笔记
              </Link>
            }
            className="dashboard-section dashboard-section-notes"
            subtitle="最近笔记"
            title="继续整理"
          >
            {notesState ? renderSectionState(
              notesState,
              notesState.kind === "error" ? (
                <button className="secondary-button" onClick={() => props.session ? void loadNotesSection(props.session) : undefined} type="button">
                  重新加载
                </button>
              ) : notesState.kind === "unauthorized" ? (
                <Link className="secondary-button" to="/login">
                  登录后继续
                </Link>
              ) : notesState.kind === "empty" ? (
                <Link className="secondary-button" to={props.session ? "/notes" : "/login"}>
                  打开笔记
                </Link>
              ) : undefined
            ) : (
              <div className="mini-card-grid stacked">
                {recentNotes.map((note) => (
                  <article className="mini-card" key={note.id}>
                    <strong>{displayNoteTitle(note)}</strong>
                    <p>{displayNoteSummary(note)}</p>
                    <Link className="secondary-button" to={`/notes?selected=${note.id}`}>
                      打开笔记
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </SectionFrame>

          <SectionFrame
            action={
              <Link className="bookmark-chip" to={props.session ? "/review" : "/login"}>
                进入复习
              </Link>
            }
            className="dashboard-section dashboard-section-review"
            subtitle="今日复习"
            title="从队列继续"
          >
            {reviewState ? renderSectionState(
              reviewState,
              reviewState.kind === "error" ? (
                <button className="secondary-button" onClick={() => props.session ? void loadReviewSection(props.session) : undefined} type="button">
                  重新加载
                </button>
              ) : reviewState.kind === "unauthorized" ? (
                <Link className="secondary-button" to="/login">
                  登录后继续
                </Link>
              ) : reviewState.kind === "empty" ? (
                <Link className="secondary-button" to={props.session ? "/review" : "/login"}>
                  打开复习工作台
                </Link>
              ) : undefined
            ) : (
              <div className="mini-card-grid stacked">
                <article className="mini-card">
                  <strong>{reviewQueue?.dueCount || 0} 张卡片等待复习</strong>
                  <p>先从今天最早到期的卡片开始，保持复习上下文连续。</p>
                  <Link className="secondary-button" to="/review">
                    打开今日复习
                  </Link>
                </article>
                {recentReviewItems.map((item) => (
                  <article className="mini-card" key={item.card.id}>
                    <strong>{item.card.front}</strong>
                    <p>{item.deckTitle} · {item.schedule.state === "review" ? "复习队列" : "待学习"}</p>
                    <Link className="secondary-button" to={`/review?card=${encodeURIComponent(item.card.id)}`}>
                      直接打开
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </SectionFrame>

          <SectionFrame
            action={
              <Link className="bookmark-chip" to={props.session ? "/review" : "/login"}>
                查看反馈
              </Link>
            }
            className="dashboard-section dashboard-section-feedback"
            subtitle="学习反馈"
            title="优先回补这些卡片"
          >
            {feedbackState ? renderSectionState(
              feedbackState,
              feedbackState.kind === "error" ? (
                <button className="secondary-button" onClick={() => props.session ? void loadFeedbackSection(props.session) : undefined} type="button">
                  重新加载
                </button>
              ) : feedbackState.kind === "unauthorized" ? (
                <Link className="secondary-button" to="/login">
                  登录后继续
                </Link>
              ) : feedbackState.kind === "empty" ? (
                <Link className="secondary-button" to={props.session ? "/review" : "/login"}>
                  打开复习工作台
                </Link>
              ) : undefined
            ) : (
              <div className="mini-card-grid stacked">
                <article className="mini-card">
                  <strong>{reviewFeedback?.weakCardCount || 0} 张卡片需要回补</strong>
                  <p>{`${reviewFeedback?.learningCount || 0} 张仍在学习中，${reviewFeedback?.dueCount || 0} 张已经到期。`}</p>
                  <Link className="secondary-button" to="/review">
                    打开复习工作台
                  </Link>
                </article>
                {weakReviewCards.map((card) => (
                  <article className="mini-card" key={card.cardId}>
                    <strong>{card.front}</strong>
                    <p>{`${card.deckTitle} · ${formatFeedbackStateLabel(card.state)} · 遗忘 ${card.lapseCount} 次`}</p>
                    <Link className="secondary-button" to={`/review?card=${encodeURIComponent(card.cardId)}`}>
                      直接回补
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </SectionFrame>

          <SectionFrame
            action={
              <Link className="bookmark-chip" to={props.session ? "/ai" : "/login"}>
                打开 AI
              </Link>
            }
            className="dashboard-section dashboard-section-ai"
            subtitle="AI 工作台"
            title="继续确认草稿"
          >
            {aiState ? renderSectionState(
              aiState,
              aiState.kind === "error" ? (
                <button className="secondary-button" onClick={() => props.session ? void loadAiSection(props.session) : undefined} type="button">
                  重新加载
                </button>
              ) : aiState.kind === "unauthorized" ? (
                <Link className="secondary-button" to="/login">
                  登录后继续
                </Link>
              ) : aiState.kind === "empty" ? (
                <Link className="secondary-button" to={props.session ? "/ai" : "/login"}>
                  打开 AI 工作台
                </Link>
              ) : undefined
            ) : (
              <div className="mini-card-grid stacked">
                <article className="mini-card">
                  <strong>{aiDrafts.length} 条草稿待确认</strong>
                  <p>{pendingAiTasks.length ? `${pendingAiTasks.length} 个任务仍在进行中。` : "最近生成的草稿会集中显示在这里。"}</p>
                  <Link className="secondary-button" to="/ai">
                    打开 AI 工作台
                  </Link>
                </article>
                {recentAiDrafts.map((draft) => (
                  <article className="mini-card" key={draft.id}>
                    <strong>{draft.front}</strong>
                    <p>{draft.sourceLabel || "待确认卡片草稿"}</p>
                    <Link className="secondary-button" to={`/ai?draft=${encodeURIComponent(draft.id)}`}>
                      查看草稿
                    </Link>
                  </article>
                ))}
                {recentAiTasks.map((task) => (
                  <article className="mini-card" key={task.id}>
                    <strong>{formatAiTaskLabel(task.taskType)}</strong>
                    <p>{formatAiStatusLabel(task.status)}</p>
                    <Link className="secondary-button" to={`/ai?task=${encodeURIComponent(task.id)}`}>
                      查看任务
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </SectionFrame>

          <SectionFrame className="dashboard-section dashboard-section-actions" subtitle="高频入口" title="今天先做什么">
            <div className="dashboard-action-grid">
              {quickActions.map((item) => (
                <Link className="mini-card dashboard-action-card" key={item.label} to={item.requiresAuth && !props.session ? "/login" : item.to}>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                  <span className="dashboard-action-link">{item.requiresAuth && !props.session ? "登录后进入" : "立即前往"}</span>
                </Link>
              ))}
            </div>
          </SectionFrame>
        </div>
      </div>
    </>
  );
}
