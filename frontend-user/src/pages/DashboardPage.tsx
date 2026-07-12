import { type ReactNode, useEffect, useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuthSession, MaterialPayload, NotePayload, PostSummary } from "../api/client";
import { listMaterials, listNotes, listPosts } from "../api/client";
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
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(Boolean(props.session));
  const [materialsError, setMaterialsError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [notesError, setNotesError] = useState("");

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

  useEffect(() => {
    void loadMaterialsSection();
    void loadPostsSection();
  }, []);

  useEffect(() => {
    if (!props.session) {
      setNotes([]);
      setNotesError("");
      setNotesLoading(false);
      return;
    }

    void loadNotesSection(props.session);
  }, [props.session]);

  const recentMaterials = materials.slice(0, 4);
  const recentNotes = notes.slice(0, 4);
  const recentPosts = posts.slice(0, 4);

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
          <span><strong>{notes.length}</strong> 条笔记</span>
          <span><strong>{posts.length}</strong> 条分享</span>
        </div>
      </section>

      <div className="metrics-grid">
        <MetricTile helper="公开资料和已整理附件总数" label="资料数" value={String(materials.length)} />
        <MetricTile helper="已经沉淀下来的个人笔记" label="笔记数" value={String(notes.length)} />
        <MetricTile helper="社区里可浏览的公开内容" label="社区分享" value={String(posts.length)} />
        <MetricTile helper="集中查看图谱与复习入口" label="学习空间" value="已就绪" />
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
