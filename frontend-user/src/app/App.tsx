import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Compass,
  GraduationCap,
  LayoutGrid,
  LibraryBig,
  LogOut,
  Network,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserRound
} from "lucide-react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { PdfReaderPane } from "../modules/reader/PdfReaderPane";
import { RichTextEditor } from "../modules/notes/RichTextEditor";
import {
  AuthSession,
  FilePayload,
  MaterialPayload,
  NotePayload,
  NoteVersionPayload,
  PostSummary,
  ProfilePayload,
  ReaderAnnotationPayload,
  ReaderStatePayload,
  createMaterial,
  createNote,
  createReaderAnnotation,
  deleteNote,
  deleteReaderAnnotation,
  getProfile,
  getReaderState,
  listMaterials,
  listNotes,
  listNoteVersions,
  listPosts,
  loginUser,
  logoutUser,
  rateMaterial,
  registerUser,
  restoreNoteVersion,
  toggleMaterialFavorite,
  updateMaterial,
  updateNote,
  updateProfile,
  updateReaderProgress,
  uploadFile
} from "../api/client";

const sessionStorageKey = "studymate.session";
const suspiciousQuestionPattern = /(\?{2,}|？{2,}|锟斤拷+)/g;

type ShellNavItem = {
  icon: typeof LayoutGrid;
  label: string;
  to: string;
  requiresAuth?: boolean;
};

type ContextCard = {
  title: string;
  body: string;
  tone?: "default" | "accent" | "muted";
};

const primaryNavItems: ShellNavItem[] = [
  { icon: LayoutGrid, label: "工作台", to: "/" },
  { icon: LibraryBig, label: "资料库", to: "/materials" },
  { icon: BookOpen, label: "阅读器", to: "/reader", requiresAuth: true },
  { icon: NotebookPen, label: "笔记", to: "/notes", requiresAuth: true },
  { icon: Network, label: "图谱", to: "/graph", requiresAuth: true },
  { icon: GraduationCap, label: "复习", to: "/review", requiresAuth: true },
  { icon: Bot, label: "AI 学伴", to: "/ai", requiresAuth: true },
  { icon: Compass, label: "社区", to: "/community" },
  { icon: Settings, label: "设置", to: "/settings", requiresAuth: true }
];

const quickActions = [
  { label: "新建资料", description: "把文件上传成可阅读、可引用的学习材料。" },
  { label: "继续阅读", description: "回到最近读过的资料，沿着批注继续整理。" },
  { label: "整理笔记", description: "在富文本编辑区里沉淀摘要、观点和待复习内容。" },
  { label: "进入图谱", description: "把知识点放到统一画布里，后面继续接真正图谱能力。" }
];

const graphPlaceholderColumns = [
  {
    title: "画布中心",
    description: "这里会承接节点、连线、分组、缩略图和工具条，成为整个产品的知识组织核心。"
  },
  {
    title: "来源引用",
    description: "资料、笔记、批注和卡片会作为可追溯的来源出现在右侧上下文里，方便一键拉入画布。"
  },
  {
    title: "AI 草稿",
    description: "AI 扩图、自动解释和 Mermaid 导入结果会先进待确认区，再由你决定是否落到正式图谱。"
  }
];

const reviewPlaceholderCards = [
  "今日到期卡片",
  "Deck 总览",
  "复习热力图",
  "错题回看",
  "图谱转卡片",
  "AI 草稿待确认"
];

const aiPlaceholderCards = [
  "基于资料生成摘要",
  "笔记结构优化建议",
  "图谱扩展建议",
  "复习卡片草稿",
  "学习计划占位",
  "待确认变更区"
];

function readSession(): AuthSession | null {
  const raw = window.localStorage.getItem(sessionStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(sessionStorageKey);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric"
  });
}

function normalizeQuestionText(value: string, fallback: string, replacement = fallback) {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^[?？锟斤拷\s]+$/.test(trimmed)) {
    return fallback;
  }

  return trimmed.replace(suspiciousQuestionPattern, replacement);
}

function displayText(value: string | undefined | null, fallback: string, replacement = fallback) {
  if (!value) {
    return fallback;
  }

  return normalizeQuestionText(value, fallback, replacement);
}

function displayMaterialTitle(material: MaterialPayload) {
  return displayText(material.title, "未命名资料", "资料");
}

function displayMaterialDescription(material: MaterialPayload) {
  return displayText(material.description, "这份资料的说明还没有整理好。", "资料说明");
}

function displayMaterialCategory(material: MaterialPayload) {
  return displayText(material.category, "未分类", "分类");
}

function displayMaterialOwner(material: MaterialPayload) {
  return displayText(material.ownerName, "匿名用户", "用户");
}

function displayMaterialTags(material: MaterialPayload) {
  return material.tags.length
    ? material.tags.map((tag, index) => displayText(tag, `标签 ${index + 1}`, "标签"))
    : ["待整理标签"];
}

function displayNoteTitle(note: NotePayload) {
  return displayText(note.title, "未命名笔记", "笔记");
}

function displayNoteSummary(note: NotePayload) {
  const summary = note.summary || stripHtml(note.content).slice(0, 90);
  return displayText(summary, "这条笔记还没有摘要。", "摘要");
}

function displayPostTitle(post: PostSummary) {
  return displayText(post.title, "未命名分享", "分享");
}

function displayPostBody(post: PostSummary) {
  return displayText(post.body, "这条分享还没有正文。", "内容");
}

function displayAnnotationText(annotation: ReaderAnnotationPayload) {
  return displayText(annotation.quote || annotation.comment, "这条批注还没有内容。", "批注");
}

function createNoteDraft(materialId = "") {
  return {
    title: "",
    summary: "",
    content: "",
    materialId,
    folderName: "收集箱",
    tags: [] as string[]
  };
}

function WorkspaceHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="workspace-header">
      <div>
        <p className="eyebrow">{props.eyebrow}</p>
        <h1>{props.title}</h1>
        <p className="header-copy">{props.description}</p>
      </div>
      {props.actions ? <div className="header-actions">{props.actions}</div> : null}
    </header>
  );
}

function MetricTile(props: { label: string; value: string; helper: string }) {
  return (
    <article className="metric-tile">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
      <p>{props.helper}</p>
    </article>
  );
}

function SectionFrame(props: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
  slim?: boolean;
}) {
  return (
    <section className={props.slim ? "section-frame slim" : "section-frame"}>
      <div className="section-frame-head">
        <div>
          <p className="eyebrow">{props.subtitle}</p>
          <h2>{props.title}</h2>
        </div>
        {props.action}
      </div>
      {props.children}
    </section>
  );
}

function ContextPanel(props: { cards: ContextCard[] }) {
  return (
    <aside className="context-panel">
      {props.cards.map((card) => (
        <article className={`context-card ${card.tone ?? "default"}`} key={card.title}>
          <strong>{card.title}</strong>
          <p>{card.body}</p>
        </article>
      ))}
    </aside>
  );
}

function AuthLead() {
  return (
    <section className="auth-lead">
      <div className="brand-block">
        <div className="brand-glyph">学</div>
        <div>
          <strong>StudyMate</strong>
          <span>以资料、阅读、笔记和图谱为核心的学习工作区</span>
        </div>
      </div>
      <div>
        <p className="eyebrow">学习闭环</p>
        <h1>让阅读、整理、组织和复习发生在同一张工作台里。</h1>
        <p>
          现在已经接通资料库、阅读器和笔记系统的主链路。图谱、复习和 AI
          学伴先用高质量占位承接，后面会沿这套壳层继续补齐。
        </p>
      </div>
      <div className="auth-feature-list">
        <article>
          <strong>资料到笔记</strong>
          <span>上传资料、进入阅读、摘录批注、沉淀成笔记，入口已经打通。</span>
        </article>
        <article>
          <strong>统一工作区</strong>
          <span>不再把阅读、笔记、图谱和社区拆成几张零散页面，而是统一在一个壳层里工作。</span>
        </article>
        <article>
          <strong>为后续图谱留位</strong>
          <span>图谱页已经按核心工作区去布局，等下一阶段直接接真实画布能力。</span>
        </article>
      </div>
    </section>
  );
}

function LoginPage(props: { onLogin: (session: AuthSession) => void }) {
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await loginUser(form);
      props.onLogin(session);
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "登录失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <AuthLead />
        <section className="auth-card">
          <p className="eyebrow">欢迎回来</p>
          <h2>登录到你的学习工作区</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>用户名或邮箱</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))}
                placeholder="输入用户名或邮箱"
                value={form.login}
              />
            </label>
            <label>
              <span>密码</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="输入密码"
                type="password"
                value={form.password}
              />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
          <p className="inline-link-row">
            还没有账号？<Link to="/register">去注册</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function RegisterPage(props: { onRegister: (session: AuthSession) => void }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await registerUser(form);
      props.onRegister(session);
      navigate("/", { replace: true });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "注册失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <AuthLead />
        <section className="auth-card">
          <p className="eyebrow">创建账号</p>
          <h2>开始搭建你的学习图谱</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>用户名</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="输入用户名"
                value={form.username}
              />
            </label>
            <label>
              <span>显示名称</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="输入在前台显示的名字"
                value={form.displayName}
              />
            </label>
            <label>
              <span>邮箱</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="输入邮箱"
                type="email"
                value={form.email}
              />
            </label>
            <label>
              <span>密码</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="设置密码"
                type="password"
                value={form.password}
              />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "注册中..." : "注册并进入工作区"}
            </button>
          </form>
          <p className="inline-link-row">
            已经有账号？<Link to="/login">去登录</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function DashboardPage(props: { session: AuthSession | null }) {
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    void listMaterials().then(setMaterials).catch(() => setMaterials([]));
    void listPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    if (!props.session) {
      setNotes([]);
      return;
    }

    void listNotes(props.session).then(setNotes).catch(() => setNotes([]));
  }, [props.session]);

  const recentMaterials = materials.slice(0, 3);
  const recentNotes = notes.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

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
        description="这里不是营销首页，而是你的学习工作台。资料、阅读、笔记和图谱入口都在同一层级里，方便快速回到上次工作现场。"
        eyebrow="工作台"
        title="把今天的学习任务收拢到一个界面里"
      />

      <div className="metrics-grid">
        <MetricTile helper="公开资料和已整理附件总数" label="资料数" value={String(materials.length)} />
        <MetricTile helper="已经沉淀下来的个人笔记" label="笔记数" value={String(notes.length)} />
        <MetricTile helper="社区里可浏览的公开内容" label="社区分享" value={String(posts.length)} />
        <MetricTile helper="图谱与复习能力下一步会从这里接入" label="下一阶段" value="图谱 + 复习" />
      </div>

      <div className="dashboard-grid">
        <SectionFrame subtitle="最近资料" title="从资料继续">
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
        </SectionFrame>

        <SectionFrame subtitle="最近笔记" title="继续整理">
          <div className="mini-card-grid stacked">
            {recentNotes.length ? (
              recentNotes.map((note) => (
                <article className="mini-card" key={note.id}>
                  <strong>{displayNoteTitle(note)}</strong>
                  <p>{displayNoteSummary(note)}</p>
                  <Link className="secondary-button" to={`/notes?selected=${note.id}`}>
                    打开笔记
                  </Link>
                </article>
              ))
            ) : (
              <article className="mini-card tall">
                <strong>还没有个人笔记</strong>
                <p>先从资料库进入一份材料，或者直接在笔记页新建一条读书笔记。</p>
              </article>
            )}
          </div>
        </SectionFrame>

        <SectionFrame subtitle="高频入口" title="今天先做什么">
          <div className="mini-card-grid stacked">
            {quickActions.map((item) => (
              <article className="mini-card" key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </SectionFrame>
      </div>

      <SectionFrame subtitle="社区动态" title="最近公开分享">
        <div className="mini-card-grid">
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
      </SectionFrame>
    </>
  );
}

function MaterialsPage(props: { session: AuthSession | null }) {
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FilePayload | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    attachmentFileId: ""
  });
  const searchParams = new URLSearchParams(useLocation().search);

  async function loadAll() {
    const items = await listMaterials();
    setMaterials(items);
    setSelectedId((current) => current || searchParams.get("selected") || items[0]?.id || "");
  }

  useEffect(() => {
    void loadAll().catch(() => setMaterials([]));
  }, []);

  const filteredMaterials = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return materials;
    }

    return materials.filter((material) =>
      [displayMaterialTitle(material), displayMaterialDescription(material), displayMaterialCategory(material)]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [materials, search]);

  const selectedMaterial =
    filteredMaterials.find((material) => material.id === selectedId) ??
    materials.find((material) => material.id === selectedId) ??
    filteredMaterials[0] ??
    null;

  useEffect(() => {
    if (selectedMaterial) {
      setDraft({
        title: displayMaterialTitle(selectedMaterial),
        description:
          displayMaterialDescription(selectedMaterial) === "这份资料的说明还没有整理好。"
            ? ""
            : displayMaterialDescription(selectedMaterial),
        category: displayMaterialCategory(selectedMaterial) === "未分类" ? "" : displayMaterialCategory(selectedMaterial),
        tags: displayMaterialTags(selectedMaterial).join(", "),
        attachmentFileId: selectedMaterial.attachmentFileId
      });
      setUploadedFile(
        selectedMaterial.attachmentFileId
          ? {
              id: selectedMaterial.attachmentFileId,
              createdAt: selectedMaterial.createdAt,
              mimeType: selectedMaterial.attachmentMime,
              originalName: selectedMaterial.attachmentName,
              ownerUserId: selectedMaterial.ownerUserId,
              path: "",
              size: 0
            }
          : null
      );
    }
  }, [selectedMaterial]);

  async function handleUpload() {
    if (!props.session || !selectedFile) {
      return;
    }

    setBusy("upload");
    setMessage("");
    try {
      const payload = await uploadFile(props.session, selectedFile);
      setUploadedFile(payload);
      setDraft((current) => ({ ...current, attachmentFileId: payload.id }));
      setMessage(`已上传 ${payload.originalName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请稍后再试。");
    } finally {
      setBusy("");
    }
  }

  async function handleCreate() {
    if (!props.session) {
      setMessage("登录后才能创建资料。");
      return;
    }

    setBusy("save");
    setMessage("");
    try {
      await createMaterial(props.session, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
        coverFileId: "",
        attachmentFileId: draft.attachmentFileId
      });
      await loadAll();
      setMessage("资料已提交审核。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建资料失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleUpdate() {
    if (!props.session || !selectedMaterial) {
      return;
    }

    setBusy("update");
    setMessage("");
    try {
      await updateMaterial(props.session, selectedMaterial.id, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
        coverFileId: "",
        attachmentFileId: draft.attachmentFileId
      });
      await loadAll();
      setMessage("资料已更新。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新资料失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleFavorite() {
    if (!props.session || !selectedMaterial) {
      setMessage("登录后才能收藏资料。");
      return;
    }

    setBusy("favorite");
    try {
      await toggleMaterialFavorite(props.session, selectedMaterial.id);
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "收藏失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleRate(score: number) {
    if (!props.session || !selectedMaterial) {
      setMessage("登录后才能评分。");
      return;
    }

    setBusy(`rate-${score}`);
    try {
      await rateMaterial(props.session, selectedMaterial.id, score);
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "评分失败。");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <label className="secondary-button">
              <Upload size={16} />
              选择附件
              <input
                hidden
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <button className="secondary-button" disabled={!props.session || !selectedFile || busy === "upload"} onClick={handleUpload} type="button">
              {busy === "upload" ? "上传中..." : "上传附件"}
            </button>
            <button className="primary-button" disabled={!props.session || busy === "save"} onClick={handleCreate} type="button">
              新建资料
            </button>
          </div>
        }
        description="这一版先把资料库做成真正可工作的三栏结构：左侧筛选，中间列表，右侧详情和编辑动作。未实现的高级能力先留位。"
        eyebrow="资料库"
        title="把资料管理、阅读入口和编辑动作放到一张桌面上"
      />

      <div className="library-workspace">
        <SectionFrame slim subtitle="筛选" title="定位资料">
          <div className="filter-stack">
            <label className="search-field inset">
              <Search size={16} />
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="按标题、分类或描述搜索"
                value={search}
              />
            </label>
            <div className="chip-row">
              <span className="chip">公开资料 {materials.length}</span>
              <span className="chip muted">审批仍走管理端</span>
            </div>
            <div className="sidebar-action-list">
              {quickActions.map((item) => (
                <div className="quiet-action" key={item.label}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
              ))}
            </div>
          </div>
        </SectionFrame>

        <SectionFrame slim subtitle="结果" title="资料列表">
          <div className="list-stack">
            {filteredMaterials.map((material) => (
              <button
                className={selectedMaterial?.id === material.id ? "list-row active" : "list-row"}
                key={material.id}
                onClick={() => setSelectedId(material.id)}
                type="button"
              >
                <div>
                  <strong>{displayMaterialTitle(material)}</strong>
                  <p>{displayMaterialDescription(material)}</p>
                </div>
                <span>{displayMaterialCategory(material)}</span>
              </button>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame
          action={
            selectedMaterial?.attachmentFileId ? (
              <Link className="secondary-button" to={`/reader/${selectedMaterial.id}`}>
                <BookOpen size={16} />
                进入阅读
              </Link>
            ) : null
          }
          subtitle="详情"
          title={selectedMaterial ? displayMaterialTitle(selectedMaterial) : "选择一份资料"}
        >
          {selectedMaterial ? (
            <div className="detail-stack">
              <article className="profile-summary">
                <strong>{displayMaterialCategory(selectedMaterial)}</strong>
                <span>作者：{displayMaterialOwner(selectedMaterial)}</span>
                <span>创建于 {formatDate(selectedMaterial.createdAt)}</span>
                <span>评分 {selectedMaterial.averageRating.toFixed(1)} / 收藏 {selectedMaterial.favoritesCount}</span>
              </article>

              <div className="chip-row">
                {displayMaterialTags(selectedMaterial).map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <p className="detail-copy">{displayMaterialDescription(selectedMaterial)}</p>

              <div className="detail-actions">
                <button className="secondary-button" disabled={!props.session || busy === "favorite"} onClick={handleFavorite} type="button">
                  收藏资料
                </button>
                {[3, 4, 5].map((score) => (
                  <button className="secondary-button" disabled={!props.session || busy === `rate-${score}`} key={score} onClick={() => handleRate(score)} type="button">
                    {score} 分
                  </button>
                ))}
              </div>

              <div className="form-stack">
                <label>
                  <span>标题</span>
                  <input onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} value={draft.title} />
                </label>
                <label>
                  <span>说明</span>
                  <input onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} value={draft.description} />
                </label>
                <label>
                  <span>分类</span>
                  <input onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} value={draft.category} />
                </label>
                <label>
                  <span>标签</span>
                  <input onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} value={draft.tags} />
                </label>
                <button className="primary-button" disabled={!props.session || busy === "update"} onClick={handleUpdate} type="button">
                  保存资料信息
                </button>
              </div>

              {uploadedFile ? (
                <article className="upload-summary">
                  <strong>{uploadedFile.originalName}</strong>
                  <span>{uploadedFile.mimeType || "未知类型"}</span>
                  <span>{uploadedFile.id}</span>
                </article>
              ) : null}
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>还没有可展示的资料</strong>
              <p>先在左侧创建一份材料，或者等管理员通过待审核内容。</p>
            </article>
          )}
          {message ? <p className="muted-copy">{message}</p> : null}
        </SectionFrame>
      </div>
    </>
  );
}

function CommunityPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    void listPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <>
      <WorkspaceHeader
        description="社区先继续承接真实的公开内容列表，后面再接回发帖、评论、点赞和收藏的重设计界面。"
        eyebrow="社区"
        title="把学习内容的公开分享留在统一风格里"
      />
      <div className="community-layout">
        <SectionFrame slim subtitle="视图" title="当前入口">
          <div className="list-stack dense">
            <div className="quiet-action">
              <strong>推荐流</strong>
              <small>公开帖子和资料分享的统一入口。</small>
            </div>
            <div className="quiet-action">
              <strong>问答区</strong>
              <small>后面会把问题、回答和参考资料挂到同一条讨论链路上。</small>
            </div>
          </div>
        </SectionFrame>

        <SectionFrame subtitle="动态" title="最新分享">
          <div className="list-stack">
            {posts.map((post) => (
              <article className="story-card" key={post.id}>
                <div className="story-card-head">
                  <strong>{displayPostTitle(post)}</strong>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <p>{displayPostBody(post)}</p>
                <div className="story-card-meta">
                  <span>点赞 {post.likesCount}</span>
                  <span>收藏 {post.favoritesCount}</span>
                  <span>评论 {post.commentsCount}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame slim subtitle="后续规划" title="下一步">
          <article className="placeholder-card">
            <strong>后面会接回更完整的发帖体验</strong>
            <p>包括分类、封面、资料引用卡片、评论层级和运营推荐位，风格与资料库保持统一。</p>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}

function NotesPage(props: { session: AuthSession }) {
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [versions, setVersions] = useState<NoteVersionPayload[]>([]);
  const [noteId, setNoteId] = useState("");
  const [draft, setDraft] = useState(createNoteDraft());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const searchParams = new URLSearchParams(useLocation().search);

  async function loadAll(selected?: string) {
    const [noteItems, materialItems] = await Promise.all([listNotes(props.session), listMaterials()]);
    setNotes(noteItems);
    setMaterials(materialItems);
    const nextId = selected || searchParams.get("selected") || noteItems[0]?.id || "";
    setNoteId(nextId);
  }

  useEffect(() => {
    void loadAll().catch(() => {
      setNotes([]);
      setMaterials([]);
    });
  }, [props.session]);

  const selectedNote = notes.find((note) => note.id === noteId) ?? notes[0] ?? null;
  const relatedMaterial = materials.find((material) => material.id === (draft.materialId || selectedNote?.materialId || ""));

  useEffect(() => {
    if (!selectedNote) {
      setDraft(createNoteDraft());
      setVersions([]);
      return;
    }

    setDraft({
      title: displayNoteTitle(selectedNote) === "未命名笔记" ? "" : displayNoteTitle(selectedNote),
      summary: displayNoteSummary(selectedNote) === "这条笔记还没有摘要。" ? "" : displayNoteSummary(selectedNote),
      content: selectedNote.content,
      materialId: selectedNote.materialId,
      folderName: selectedNote.folderName || "收集箱",
      tags: selectedNote.tags
    });

    void listNoteVersions(props.session, selectedNote.id).then(setVersions).catch(() => setVersions([]));
  }, [props.session, selectedNote]);

  async function handleCreate() {
    setBusy("create");
    setMessage("");
    try {
      const created = await createNote(props.session, draft);
      await loadAll(created.id);
      setMessage("笔记已创建。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleUpdate() {
    if (!selectedNote) {
      return;
    }

    setBusy("update");
    setMessage("");
    try {
      await updateNote(props.session, selectedNote.id, {
        title: draft.title,
        summary: draft.summary || stripHtml(draft.content).slice(0, 80),
        content: draft.content,
        folderName: draft.folderName,
        tags: draft.tags
      });
      await loadAll(selectedNote.id);
      setMessage("笔记已保存，新版本已经记录。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    if (!selectedNote || !window.confirm("确定删除这条笔记吗？")) {
      return;
    }

    setBusy("delete");
    setMessage("");
    try {
      await deleteNote(props.session, selectedNote.id);
      await loadAll();
      setMessage("笔记已删除。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleRestore(versionId: string) {
    if (!selectedNote) {
      return;
    }

    setBusy(`restore-${versionId}`);
    try {
      await restoreNoteVersion(props.session, selectedNote.id, versionId);
      await loadAll(selectedNote.id);
      setMessage("已恢复到所选版本。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "恢复版本失败。");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <button className="secondary-button" onClick={() => setDraft(createNoteDraft(relatedMaterial?.id ?? ""))} type="button">
              清空草稿
            </button>
            <button className="primary-button" disabled={busy === "create"} onClick={handleCreate} type="button">
              新建笔记
            </button>
          </div>
        }
        description="笔记页现在不只是一个文本框了。左侧是笔记清单，中间是富文本编辑器，右侧挂版本、来源资料和后续图谱入口。"
        eyebrow="笔记"
        title="把阅读后的内容沉淀成可复用的笔记"
      />

      <div className="notes-workspace">
        <SectionFrame slim subtitle="笔记列表" title="最近编辑">
          <div className="list-stack">
            {notes.map((note) => (
              <button
                className={selectedNote?.id === note.id ? "list-row active" : "list-row"}
                key={note.id}
                onClick={() => setNoteId(note.id)}
                type="button"
              >
                <div>
                  <strong>{displayNoteTitle(note)}</strong>
                  <p>{displayNoteSummary(note)}</p>
                </div>
                <span>v{note.versionNumber}</span>
              </button>
            ))}
          </div>
        </SectionFrame>

        <div className="page-stack">
          <SectionFrame
            action={
              <div className="detail-actions">
                {selectedNote ? (
                  <button className="secondary-button" disabled={busy === "delete"} onClick={handleDelete} type="button">
                    删除
                  </button>
                ) : null}
                <button className="primary-button" disabled={busy === "update"} onClick={handleUpdate} type="button">
                  保存当前版本
                </button>
              </div>
            }
            subtitle="编辑区"
            title={selectedNote ? displayNoteTitle(selectedNote) : "新建笔记"}
          >
            <div className="form-stack">
              <label>
                <span>标题</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} value={draft.title} />
              </label>
              <label>
                <span>摘要</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} value={draft.summary} />
              </label>
              <label>
                <span>文件夹</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, folderName: event.target.value }))} value={draft.folderName} />
              </label>
              <label>
                <span>关联资料</span>
                <select
                  className="select-field"
                  onChange={(event) => setDraft((current) => ({ ...current, materialId: event.target.value }))}
                  value={draft.materialId}
                >
                  <option value="">暂不关联</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {displayMaterialTitle(material)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>标签</span>
                <input
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    }))
                  }
                  value={draft.tags.join(", ")}
                />
              </label>
            </div>
            <RichTextEditor
              onChange={(value) => setDraft((current) => ({ ...current, content: value }))}
              placeholder="开始写下你的阅读理解、问题和待整理线索..."
              value={draft.content}
            />
            {message ? <p className="muted-copy">{message}</p> : null}
          </SectionFrame>

          <div className="main-grid">
            <SectionFrame slim subtitle="来源资料" title="当前关联">
              {relatedMaterial ? (
                <article className="profile-summary">
                  <strong>{displayMaterialTitle(relatedMaterial)}</strong>
                  <span>{displayMaterialDescription(relatedMaterial)}</span>
                  <span>{displayMaterialCategory(relatedMaterial)}</span>
                  <Link className="secondary-button" to={`/reader/${relatedMaterial.id}`}>
                    回到阅读器
                  </Link>
                </article>
              ) : (
                <article className="placeholder-card">
                  <strong>暂未关联资料</strong>
                  <p>你可以在上方选择一份资料，让笔记和阅读状态形成回路。</p>
                </article>
              )}
            </SectionFrame>

            <SectionFrame slim subtitle="版本" title="历史记录">
              <div className="list-stack dense">
                {versions.map((version) => (
                  <div className="list-row compact" key={version.id}>
                    <div>
                      <strong>v{version.versionNumber}</strong>
                      <p>{version.title}</p>
                    </div>
                    <button className="secondary-button" disabled={busy === `restore-${version.id}`} onClick={() => handleRestore(version.id)} type="button">
                      恢复
                    </button>
                  </div>
                ))}
              </div>
            </SectionFrame>
          </div>
        </div>
      </div>
    </>
  );
}

function ReaderPage(props: { session: AuthSession }) {
  const params = useParams();
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [selectedId, setSelectedId] = useState(params.materialId ?? "");
  const [readerState, setReaderState] = useState<ReaderStatePayload | null>(null);
  const [selection, setSelection] = useState("");
  const [annotationComment, setAnnotationComment] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void listMaterials()
      .then((items) => {
        const readable = items.filter((item) => item.attachmentFileId);
        setMaterials(readable);
        setSelectedId((current) => current || params.materialId || readable[0]?.id || "");
      })
      .catch(() => setMaterials([]));
  }, [params.materialId]);

  const selectedMaterial = materials.find((material) => material.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedMaterial) {
      setReaderState(null);
      return;
    }

    void getReaderState(props.session, selectedMaterial.id).then(setReaderState).catch(() => {
      setReaderState({
        materialId: selectedMaterial.id,
        currentPage: 1,
        totalPages: 0,
        progressPercent: 0,
        bookmarks: [],
        lastReadAt: selectedMaterial.updatedAt,
        annotations: []
      });
    });
  }, [props.session, selectedMaterial]);

  async function persistProgress(nextPage: number, totalPages: number) {
    if (!selectedMaterial || !readerState) {
      return;
    }

    const progressPercent = totalPages ? Math.min(100, Math.round((nextPage / totalPages) * 100)) : readerState.progressPercent;
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: nextPage,
      totalPages,
      progressPercent,
      bookmarks: readerState.bookmarks
    });
    setReaderState(payload);
  }

  async function handleAddBookmark() {
    if (!selectedMaterial || !readerState) {
      return;
    }

    const bookmarks = Array.from(new Set([...readerState.bookmarks, readerState.currentPage])).sort((a, b) => a - b);
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: readerState.currentPage,
      totalPages: readerState.totalPages,
      progressPercent: readerState.progressPercent,
      bookmarks
    });
    setReaderState(payload);
  }

  async function handleCreateAnnotation() {
    if (!selectedMaterial || !readerState || (!selection && !annotationComment)) {
      return;
    }

    setBusy("annotation");
    setMessage("");
    try {
      await createReaderAnnotation(props.session, selectedMaterial.id, {
        page: readerState.currentPage,
        quote: selection,
        comment: annotationComment,
        color: "amber"
      });
      setSelection("");
      setAnnotationComment("");
      const payload = await getReaderState(props.session, selectedMaterial.id);
      setReaderState(payload);
      setMessage("批注已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleDeleteAnnotation(annotationId: string) {
    if (!selectedMaterial) {
      return;
    }

    setBusy(`annotation-${annotationId}`);
    try {
      await deleteReaderAnnotation(props.session, selectedMaterial.id, annotationId);
      const payload = await getReaderState(props.session, selectedMaterial.id);
      setReaderState(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除批注失败。");
    } finally {
      setBusy("");
    }
  }

  const fileUrl = selectedMaterial ? `/api/v1/materials/${selectedMaterial.id}/attachment` : "";
  const canUsePdf = selectedMaterial?.attachmentMime.toLowerCase().includes("pdf");

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <button className="secondary-button" onClick={() => void handleAddBookmark()} type="button">
              添加书签
            </button>
            {selectedMaterial ? (
              <Link className="primary-button" to={`/notes?material=${selectedMaterial.id}`}>
                去写笔记
              </Link>
            ) : null}
          </div>
        }
        description="阅读器现在接回了真实的阅读状态、页码进度、书签和批注。PDF 用专门的阅读组件，其他附件先用内嵌预览承接。"
        eyebrow="阅读器"
        title="把阅读进度、批注和笔记入口收进同一屏里"
      />

      <div className="reader-workspace">
        <SectionFrame slim subtitle="可读资料" title="选择一份材料">
          <div className="list-stack">
            {materials.map((material) => (
              <button
                className={selectedMaterial?.id === material.id ? "list-row active" : "list-row"}
                key={material.id}
                onClick={() => setSelectedId(material.id)}
                type="button"
              >
                <div>
                  <strong>{displayMaterialTitle(material)}</strong>
                  <p>{displayMaterialDescription(material)}</p>
                </div>
                <span>{material.attachmentName || "有附件"}</span>
              </button>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame subtitle="阅读区" title={selectedMaterial ? displayMaterialTitle(selectedMaterial) : "还没有可阅读资料"}>
          {selectedMaterial && readerState ? (
            <div className="page-stack">
              <div className="reader-stage-toolbar">
                <div className="chip-row">
                  <span className="chip">当前页 {readerState.currentPage}</span>
                  <span className="chip">总页数 {readerState.totalPages || "待识别"}</span>
                  <span className="chip">进度 {readerState.progressPercent}%</span>
                </div>
              </div>
              <div className="reader-stage">
                {canUsePdf ? (
                  <PdfReaderPane
                    fileUrl={fileUrl}
                    initialPage={readerState.currentPage}
                    onPageChange={(page) =>
                      void persistProgress(page, readerState.totalPages || page).catch(() => undefined)
                    }
                    onSelectionChange={setSelection}
                    onTotalPagesChange={(pages) =>
                      void persistProgress(readerState.currentPage, pages).catch(() => undefined)
                    }
                  />
                ) : (
                  <iframe className="reader-embed" src={fileUrl} title={selectedMaterial.attachmentName} />
                )}
              </div>
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>先从左侧选择一份带附件的资料</strong>
              <p>如果资料是 PDF，会进入真正的 PDF 阅读视图；其他文件先走嵌入式预览。</p>
            </article>
          )}
        </SectionFrame>

        <SectionFrame slim subtitle="摘录与批注" title="右侧工作区">
          {readerState ? (
            <div className="page-stack">
              <article className="profile-summary">
                <strong>当前选中文本</strong>
                <span>{selection || "在 PDF 内选中一段文字，或者直接写一条批注。"}</span>
              </article>
              <label className="form-stack">
                <span>批注内容</span>
                <input onChange={(event) => setAnnotationComment(event.target.value)} value={annotationComment} />
              </label>
              <button className="primary-button" disabled={busy === "annotation"} onClick={() => void handleCreateAnnotation()} type="button">
                保存批注
              </button>
              <div className="bookmark-stack">
                {readerState.bookmarks.map((bookmark) => (
                  <span className="bookmark-chip chip" key={bookmark}>
                    第 {bookmark} 页
                  </span>
                ))}
              </div>
              <div className="list-stack dense">
                {readerState.annotations.map((annotation) => (
                  <article className="annotation-story" key={annotation.id}>
                    <strong>第 {annotation.page} 页</strong>
                    <p>{displayAnnotationText(annotation)}</p>
                    <button
                      className="secondary-button"
                      disabled={busy === `annotation-${annotation.id}`}
                      onClick={() => void handleDeleteAnnotation(annotation.id)}
                      type="button"
                    >
                      删除批注
                    </button>
                  </article>
                ))}
              </div>
              {message ? <p className="muted-copy">{message}</p> : null}
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>批注区已就位</strong>
              <p>选择材料后，这里会展示书签、摘录和批注列表，并继续接笔记和图谱入口。</p>
            </article>
          )}
        </SectionFrame>
      </div>
    </>
  );
}

function PlaceholderBoard(props: {
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

function GraphPage() {
  return (
    <PlaceholderBoard
      columns={graphPlaceholderColumns}
      description="图谱页会成为产品中枢。当前先保住壳层、信息架构和上下文布局，下一阶段直接接真正画布。"
      eyebrow="图谱"
      title="让知识组织真正围绕画布展开"
    />
  );
}

function ReviewPage() {
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

function AiPage() {
  return (
    <>
      <WorkspaceHeader
        description="AI 学伴不会直接替你改内容，而是先把建议放进待确认区，让它成为辅助，不是黑盒。"
        eyebrow="AI 学伴"
        title="让 AI 对资料、笔记和图谱提供上下文感知的帮助"
      />
      <div className="mini-card-grid">
        {aiPlaceholderCards.map((title) => (
          <article className="mini-card tall" key={title}>
            <strong>{title}</strong>
            <p>这里先承接布局和交互节奏，后面再接模型调用与确认流程。</p>
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsPage(props: { session: AuthSession }) {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [form, setForm] = useState({ displayName: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getProfile(props.session)
      .then((payload) => {
        setProfile(payload);
        setForm({ displayName: payload.displayName, email: payload.email });
      })
      .catch(() => undefined);
  }, [props.session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = await updateProfile(props.session, form);
      setProfile(payload);
      setMessage("个人资料已更新。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新资料失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <WorkspaceHeader
        description="这一页先保留最需要的个人资料入口，后面再扩展通知、偏好设置、同步与导出。"
        eyebrow="设置"
        title="让个人资料和工作区偏好有一个稳定入口"
      />
      <div className="settings-grid">
        <SectionFrame subtitle="个人资料" title={profile?.displayName || "账户信息"}>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              <span>显示名称</span>
              <input onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} value={form.displayName} />
            </label>
            <label>
              <span>邮箱</span>
              <input onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              {busy ? "保存中..." : "保存设置"}
            </button>
          </form>
          {message ? <p className="muted-copy">{message}</p> : null}
        </SectionFrame>

        <SectionFrame subtitle="后续" title="下一步会补什么">
          <article className="placeholder-card">
            <strong>通知、同步和导出</strong>
            <p>这里会继续扩展阅读提醒、AI 结果通知、资料导出、偏好设置和账户安全相关配置。</p>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}

function RequireAuth(props: { session: AuthSession | null; children: ReactNode }) {
  const location = useLocation();
  if (!props.session) {
    return <Navigate replace state={{ from: location.pathname + location.search }} to="/login" />;
  }

  return <>{props.children}</>;
}

function ShellFrame(props: { session: AuthSession | null; onLogout: () => void; children: ReactNode }) {
  const location = useLocation();
  const contextCards = useMemo<ContextCard[]>(() => {
    if (location.pathname.startsWith("/materials")) {
      return [
        { title: "资料库节奏", body: "左侧筛选，中间列表，右侧详情。创建和编辑动作都留在同一页里。", tone: "accent" },
        { title: "数据兜底", body: "如果历史数据里已经有问号或乱码，前端会优先用可读的中文占位来展示。", tone: "muted" }
      ];
    }

    if (location.pathname.startsWith("/reader")) {
      return [
        { title: "阅读闭环", body: "这一页已经接回进度、书签和批注，下一步直接补高亮可视化和摘录池。", tone: "accent" },
        { title: "后续联动", body: "阅读批注会继续和笔记、图谱节点草稿相互跳转。", tone: "muted" }
      ];
    }

    if (location.pathname.startsWith("/notes")) {
      return [
        { title: "笔记定位", body: "这一页负责沉淀内容，版本历史和来源资料已经回到右侧上下文里。", tone: "accent" },
        { title: "下一步", body: "后面会继续接资料引用块、阅读摘录池和图谱节点转换。", tone: "muted" }
      ];
    }

    return [
      { title: "StudyMate 方向", body: "资料、阅读、笔记、图谱、复习和 AI 都围绕同一个学习工作区展开。", tone: "accent" },
      { title: "当前阶段", body: "正在继续做厚 v0.4.0，把真正可用的前台体验先立起来。", tone: "muted" }
    ];
  }, [location.pathname]);

  return (
    <div className="shell-root">
      <div className="shell-background" />
      <div className="shell-layout">
        <aside className="primary-sidebar">
          <div className="brand-block">
            <div className="brand-glyph">学</div>
            <div>
              <strong>StudyMate</strong>
              <span>统一学习工作区</span>
            </div>
          </div>

          <nav className="primary-nav">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              if (item.requiresAuth && !props.session) {
                return (
                  <Link className="nav-item locked" key={item.to} to="/login">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <NavLink className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")} key={item.to} to={item.to}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <article className="sidebar-card">
            <p className="eyebrow">快速动作</p>
            <div className="sidebar-action-list">
              {quickActions.map((item) => (
                <div className="quiet-action" key={item.label}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
              ))}
            </div>
          </article>
        </aside>

        <div className="shell-main">
          <div className="topbar">
            <label className="search-field">
              <Search size={16} />
              <input placeholder="搜索资料、笔记、帖子和后续图谱入口" />
            </label>
            <div className="topbar-actions">
              <button className="icon-button" title="提醒" type="button">
                <Bell size={16} />
              </button>
              <button className="topbar-link" type="button">
                <Sparkles size={16} />
                AI 草稿
              </button>
              {props.session ? (
                <>
                  <span className="chip">
                    <UserRound size={14} />
                    {props.session.user.displayName}
                  </span>
                  <button className="topbar-link muted" onClick={props.onLogout} type="button">
                    <LogOut size={16} />
                    退出
                  </button>
                </>
              ) : (
                <Link className="primary-button" to="/login">
                  登录
                </Link>
              )}
            </div>
          </div>

          <div className="main-grid">
            <main className="workspace-surface">{props.children}</main>
            <ContextPanel cards={contextCards} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const navigate = useNavigate();

  function handleSession(nextSession: AuthSession | null) {
    setSession(nextSession);
    persistSession(nextSession);
  }

  async function handleLogout() {
    try {
      if (session) {
        await logoutUser(session);
      }
    } catch {
      // Ignore network logout errors and clear local session anyway.
    } finally {
      handleSession(null);
      navigate("/", { replace: true });
    }
  }

  return (
    <Routes>
      <Route element={<LoginPage onLogin={handleSession} />} path="/login" />
      <Route element={<RegisterPage onRegister={handleSession} />} path="/register" />
      <Route
        element={
          <ShellFrame onLogout={() => void handleLogout()} session={session}>
            <DashboardPage session={session} />
          </ShellFrame>
        }
        path="/"
      />
      <Route
        element={
          <ShellFrame onLogout={() => void handleLogout()} session={session}>
            <MaterialsPage session={session} />
          </ShellFrame>
        }
        path="/materials"
      />
      <Route
        element={
          <ShellFrame onLogout={() => void handleLogout()} session={session}>
            <CommunityPage />
          </ShellFrame>
        }
        path="/community"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <ReaderPage session={session as AuthSession} />
            </ShellFrame>
          </RequireAuth>
        }
        path="/reader"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <ReaderPage session={session as AuthSession} />
            </ShellFrame>
          </RequireAuth>
        }
        path="/reader/:materialId"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <NotesPage session={session as AuthSession} />
            </ShellFrame>
          </RequireAuth>
        }
        path="/notes"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <GraphPage />
            </ShellFrame>
          </RequireAuth>
        }
        path="/graph"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <ReviewPage />
            </ShellFrame>
          </RequireAuth>
        }
        path="/review"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <AiPage />
            </ShellFrame>
          </RequireAuth>
        }
        path="/ai"
      />
      <Route
        element={
          <RequireAuth session={session}>
            <ShellFrame onLogout={() => void handleLogout()} session={session}>
              <SettingsPage session={session as AuthSession} />
            </ShellFrame>
          </RequireAuth>
        }
        path="/settings"
      />
    </Routes>
  );
}
