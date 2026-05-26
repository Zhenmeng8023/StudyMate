import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Bird,
  LibraryBig,
  MessageSquareText,
  Orbit,
  ShieldCheck,
  UserRound
} from "lucide-react";
import {
  AuthSession,
  FilePayload,
  MaterialPayload,
  PostDetailPayload,
  PostSummary,
  createComment,
  createMaterial,
  createPost,
  deleteMaterial,
  getMaterial,
  getPost,
  getProfile,
  listMaterials,
  listPosts,
  loginUser,
  logoutUser,
  rateMaterial,
  registerUser,
  toggleMaterialFavorite,
  togglePostFavorite,
  togglePostLike,
  updateProfile,
  uploadFile
} from "../api/client";

const sessionStorageKey = "studymate.session";

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
  if (!session) {
    window.localStorage.removeItem(sessionStorageKey);
    return;
  }

  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function ProtectedRoute(props: { session: AuthSession | null; children: ReactNode }) {
  const location = useLocation();
  if (!props.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return props.children;
}

function AppLayout(props: {
  session: AuthSession | null;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  const location = useLocation();
  const navItems = useMemo(
    () => [
      { to: "/", label: "工作台" },
      { to: "/community", label: "学习社区" },
      { to: "/materials", label: "资料库" },
      { to: "/profile", label: "个人资料" },
      { to: "/register", label: "注册" },
      { to: "/login", label: "登录" }
    ],
    []
  );

  return (
    <div className="platform-shell">
      <header className="hero-band">
        <div className="hero-copy">
          <p className="hero-kicker">学伴图谱 v0.3.0</p>
          <h1>社区、资料和审核链路开始长成第一版产品闭环</h1>
          <p className="hero-summary">
            这一版把社区发帖、资料创建和后台审核串起来，让平台第一次不只是底座，而是能承载真实学习内容的工作台。
          </p>
        </div>
        <div className="hero-status">
          <div className="status-card">
            <ShieldCheck size={24} />
            <div>
              <strong>{props.session ? "内容创作已解锁" : "游客模式"}</strong>
              <span>{props.session ? props.session.user.displayName : "登录后可以发帖、建资料和上传附件"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="workspace-frame">
        <aside className="workspace-nav">
          <div className="brand-mark">
            <Bird size={18} />
            <span>StudyMate</span>
          </div>
          <nav>
            {navItems.map((item) => (
              <Link
                className={location.pathname === item.to ? "nav-link active" : "nav-link"}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {props.session ? (
            <button className="ghost-button" onClick={() => void props.onLogout()} type="button">
              退出登录
            </button>
          ) : null}
        </aside>

        <main className="workspace-main">{props.children}</main>
      </div>
    </div>
  );
}

function HomePage(props: { session: AuthSession | null }) {
  const cards = [
    {
      icon: MessageSquareText,
      title: "学习社区",
      description: "开始发布学习帖、收评论、点赞和收藏，先把学习内容流动起来。"
    },
    {
      icon: LibraryBig,
      title: "资料库",
      description: "支持创建资料、挂接上传文件，并进入后台审核流程。"
    },
    {
      icon: ShieldCheck,
      title: "后台审核",
      description: "管理员现在可以看到待审核帖子和资料，并执行通过、驳回、下架。"
    },
    {
      icon: Orbit,
      title: "下一步",
      description: "等这版稳定下来，我们就继续推进 PDF 阅读和笔记沉淀。"
    }
  ];

  return (
    <section className="panel-stack">
      <article className="feature-panel">
        <div className="panel-heading">
          <span className="section-label">版本目标</span>
          <h2>先让内容进入平台，再继续把知识沉淀成笔记和图谱</h2>
        </div>
        <p className="panel-copy">
          当前身份：
          {props.session ? ` 已以 ${props.session.user.displayName} 身份登录，可直接进入社区和资料库。` : " 目前是游客模式，登录后可创建内容。"}
        </p>
      </article>

      <section className="card-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="info-card" key={card.title}>
              <Icon size={22} />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          );
        })}
      </section>
    </section>
  );
}

function LoginPage(props: { onLogin: (session: AuthSession) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await loginUser({ login, password });
      props.onLogin(result);
      navigate((location.state as { from?: string } | null)?.from ?? "/community", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-panel">
      <div className="panel-heading">
        <span className="section-label">登录</span>
        <h2>进入社区和资料的创作区</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>邮箱或用户名</span>
          <input onChange={(event) => setLogin(event.target.value)} required value={login} />
        </label>
        <label>
          <span>密码</span>
          <input
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "登录中..." : "登录"}
        </button>
      </form>
    </section>
  );
}

function RegisterPage(props: { onRegister: (session: AuthSession) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await registerUser(form);
      props.onRegister(result);
      navigate("/community", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-panel">
      <div className="panel-heading">
        <span className="section-label">注册</span>
        <h2>创建一个真正能发内容、建资料的学习账号</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>用户名</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
            value={form.username}
          />
        </label>
        <label>
          <span>显示名</span>
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, displayName: event.target.value }))
            }
            value={form.displayName}
          />
        </label>
        <label>
          <span>邮箱</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={form.email}
          />
        </label>
        <label>
          <span>密码</span>
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
            type="password"
            value={form.password}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "注册中..." : "创建账号"}
        </button>
      </form>
    </section>
  );
}

function ProfilePage(props: { session: AuthSession; onSessionChange: (session: AuthSession) => void }) {
  const [displayName, setDisplayName] = useState(props.session.user.displayName);
  const [email, setEmail] = useState(props.session.user.email);
  const [status, setStatus] = useState("正在同步资料...");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<FilePayload | null>(null);

  useEffect(() => {
    let active = true;
    void getProfile(props.session)
      .then((profile) => {
        if (!active) {
          return;
        }
        setDisplayName(profile.displayName);
        setEmail(profile.email);
        setStatus("资料已同步到当前会话。");
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "读取资料失败");
      });

    return () => {
      active = false;
    };
  }, [props.session]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("正在保存资料...");
    setError("");

    try {
      const profile = await updateProfile(props.session, { displayName, email });
      const nextSession = {
        ...props.session,
        user: {
          ...props.session.user,
          displayName: profile.displayName,
          email: profile.email
        }
      };
      props.onSessionChange(nextSession);
      setStatus("资料已保存。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      setStatus("保存没有成功。");
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("请选择一个文件再上传。");
      return;
    }

    setStatus("正在上传文件...");
    setError("");

    try {
      const result = await uploadFile(props.session, selectedFile);
      setLastUploadedFile(result);
      setStatus("文件上传完成。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
      setStatus("文件上传没有成功。");
    }
  }

  return (
    <section className="panel-stack">
      <article className="feature-panel">
        <div className="panel-heading">
          <span className="section-label">个人资料</span>
          <h2>这里还是平台基础版的锚点，同时也为资料库准备附件上传</h2>
        </div>
        <p className="panel-copy">{status}</p>
        {error ? <p className="error-text">{error}</p> : null}
      </article>

      <div className="profile-layout">
        <form className="auth-panel" onSubmit={handleProfileSubmit}>
          <div className="panel-heading">
            <span className="section-label">资料更新</span>
            <h2>当前身份：{props.session.user.role === "admin" ? "管理员" : "普通用户"}</h2>
          </div>
          <label>
            <span>显示名</span>
            <input onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
          </label>
          <label>
            <span>邮箱</span>
            <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <button className="primary-button" type="submit">
            保存个人资料
          </button>
        </form>

        <form className="auth-panel" onSubmit={handleUpload}>
          <div className="panel-heading">
            <span className="section-label">文件上传</span>
            <h2>上传附件后可以在资料库里关联到具体资料</h2>
          </div>
          <label className="file-picker">
            <span>选择文件</span>
            <input
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <button className="primary-button" type="submit">
            上传文件
          </button>
          {lastUploadedFile ? (
            <div className="upload-result">
              <strong>{lastUploadedFile.originalName}</strong>
              <span>文件 ID：{lastUploadedFile.id}</span>
              <span>大小：{Math.round(lastUploadedFile.size / 1024)} KB</span>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function CommunityPage(props: { session: AuthSession | null }) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("正在读取社区信息流...");
  const [error, setError] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    kind: "article" as "text" | "article" | "material"
  });
  const [commentBody, setCommentBody] = useState("");

  async function loadPosts(selectPostId?: string) {
    setLoading(true);
    setError("");
    try {
      const items = await listPosts();
      setPosts(items);
      setStatus(`当前共有 ${items.length} 条已公开帖子。`);
      const targetId = selectPostId ?? items[0]?.id;
      if (targetId) {
        const detail = await getPost(targetId);
        setSelectedPost(detail);
      } else {
        setSelectedPost(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取社区失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!props.session) {
      setError("请先登录再发帖。");
      return;
    }

    setStatus("正在提交帖子，帖子会进入审核队列...");
    setError("");
    try {
      await createPost(props.session, postForm);
      setPostForm({ title: "", body: "", kind: "article" });
      await loadPosts();
      setStatus("帖子已提交，等待管理员审核通过后公开。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发帖失败");
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!props.session || !selectedPost) {
      setError("请先登录并选择帖子后再评论。");
      return;
    }

    try {
      const detail = await createComment(props.session, selectedPost.id, commentBody);
      setSelectedPost(detail);
      setCommentBody("");
      await loadPosts(detail.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "评论失败");
    }
  }

  async function handleLike() {
    if (!props.session || !selectedPost) {
      setError("请先登录后再点赞。");
      return;
    }
    try {
      await togglePostLike(props.session, selectedPost.id);
      const detail = await getPost(selectedPost.id);
      setSelectedPost(detail);
      setPosts((current) => current.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "点赞失败");
    }
  }

  async function handleFavorite() {
    if (!props.session || !selectedPost) {
      setError("请先登录后再收藏。");
      return;
    }
    try {
      await togglePostFavorite(props.session, selectedPost.id);
      const detail = await getPost(selectedPost.id);
      setSelectedPost(detail);
      setPosts((current) => current.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "收藏失败");
    }
  }

  return (
    <section className="panel-stack">
      <article className="feature-panel">
        <div className="panel-heading">
          <span className="section-label">学习社区</span>
          <h2>先把学习讨论、资料推荐和内容沉淀的入口打开</h2>
        </div>
        <p className="panel-copy">{status}</p>
        {error ? <p className="error-text">{error}</p> : null}
      </article>

      <div className="split-layout">
        <div className="column-stack">
          <form className="auth-panel" onSubmit={handleCreatePost}>
            <div className="panel-heading">
              <span className="section-label">发布帖子</span>
              <h2>发出的内容会先进入审核流程</h2>
            </div>
            <label>
              <span>帖子标题</span>
              <input
                onChange={(event) =>
                  setPostForm((current) => ({ ...current, title: event.target.value }))
                }
                value={postForm.title}
              />
            </label>
            <label>
              <span>帖子类型</span>
              <select
                className="native-select"
                onChange={(event) =>
                  setPostForm((current) => ({
                    ...current,
                    kind: event.target.value as "text" | "article" | "material"
                  }))
                }
                value={postForm.kind}
              >
                <option value="article">长文帖</option>
                <option value="text">短内容帖</option>
                <option value="material">资料推荐帖</option>
              </select>
            </label>
            <label>
              <span>正文</span>
              <textarea
                className="native-textarea"
                onChange={(event) =>
                  setPostForm((current) => ({ ...current, body: event.target.value }))
                }
                rows={7}
                value={postForm.body}
              />
            </label>
            <button className="primary-button" type="submit">
              {props.session ? "提交到审核队列" : "登录后可发帖"}
            </button>
          </form>

          <div className="list-panel">
            <div className="panel-heading">
              <span className="section-label">社区信息流</span>
              <h2>已公开帖子</h2>
            </div>
            {loading ? <p className="panel-copy">帖子正在加载...</p> : null}
            {posts.map((post) => (
              <button
                className={selectedPost?.id === post.id ? "list-card active" : "list-card"}
                key={post.id}
                onClick={() => void getPost(post.id).then(setSelectedPost)}
                type="button"
              >
                <div className="list-head">
                  <strong>{post.title}</strong>
                  <span>{post.kind}</span>
                </div>
                <p>{post.body.slice(0, 120)}</p>
                <div className="list-meta">
                  <span>{post.authorName}</span>
                  <span>赞 {post.likesCount}</span>
                  <span>藏 {post.favoritesCount}</span>
                  <span>评 {post.commentsCount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="column-stack">
          <article className="auth-panel">
            <div className="panel-heading">
              <span className="section-label">帖子详情</span>
              <h2>{selectedPost ? selectedPost.title : "选择一条帖子查看详情"}</h2>
            </div>
            {selectedPost ? (
              <>
                <p className="panel-copy">{selectedPost.body}</p>
                <div className="metric-row">
                  <button className="ghost-button" onClick={() => void handleLike()} type="button">
                    点赞 {selectedPost.likesCount}
                  </button>
                  <button className="ghost-button" onClick={() => void handleFavorite()} type="button">
                    收藏 {selectedPost.favoritesCount}
                  </button>
                </div>
                <div className="comment-list">
                  {selectedPost.comments.map((comment) => (
                    <article className="comment-card" key={comment.id}>
                      <strong>{comment.authorName}</strong>
                      <p>{comment.body}</p>
                    </article>
                  ))}
                </div>
                <form className="form-grid" onSubmit={handleCommentSubmit}>
                  <label>
                    <span>写一条评论</span>
                    <textarea
                      className="native-textarea"
                      onChange={(event) => setCommentBody(event.target.value)}
                      rows={3}
                      value={commentBody}
                    />
                  </label>
                  <button className="primary-button" type="submit">
                    发表评论
                  </button>
                </form>
              </>
            ) : (
              <p className="panel-copy">当前还没有已公开帖子，或者帖子仍在审核中。</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function MaterialsPage(props: { session: AuthSession | null }) {
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPayload | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [status, setStatus] = useState("正在读取资料库...");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: ""
  });

  async function loadMaterials(selectMaterialId?: string) {
    try {
      const items = await listMaterials();
      setMaterials(items);
      setStatus(`当前共有 ${items.length} 条已公开资料。`);
      const targetId = selectMaterialId ?? items[0]?.id;
      if (targetId) {
        const detail = await getMaterial(targetId);
        setSelectedMaterial(detail);
      } else {
        setSelectedMaterial(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取资料失败");
    }
  }

  useEffect(() => {
    void loadMaterials();
  }, []);

  async function handleCreateMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!props.session) {
      setError("请先登录再创建资料。");
      return;
    }

    setStatus("正在提交资料并上传附件...");
    setError("");
    try {
      let attachmentFileId = "";
      if (attachmentFile) {
        const uploaded = await uploadFile(props.session, attachmentFile);
        attachmentFileId = uploaded.id;
      }

      await createMaterial(props.session, {
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        coverFileId: "",
        attachmentFileId
      });
      setForm({ title: "", description: "", category: "", tags: "" });
      setAttachmentFile(null);
      await loadMaterials();
      setStatus("资料已提交，等待管理员审核通过后公开。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建资料失败");
    }
  }

  async function handleFavoriteMaterial() {
    if (!props.session || !selectedMaterial) {
      setError("请先登录后再收藏资料。");
      return;
    }

    try {
      await toggleMaterialFavorite(props.session, selectedMaterial.id);
      const detail = await getMaterial(selectedMaterial.id);
      setSelectedMaterial(detail);
      setMaterials((current) => current.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "资料收藏失败");
    }
  }

  async function handleRateMaterial(score: number) {
    if (!props.session || !selectedMaterial) {
      setError("请先登录后再评分。");
      return;
    }

    try {
      await rateMaterial(props.session, selectedMaterial.id, score);
      const detail = await getMaterial(selectedMaterial.id);
      setSelectedMaterial(detail);
      setMaterials((current) => current.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "评分失败");
    }
  }

  async function handleDeleteMaterial() {
    if (!props.session || !selectedMaterial) {
      return;
    }

    try {
      await deleteMaterial(props.session, selectedMaterial.id);
      setSelectedMaterial(null);
      await loadMaterials();
      setStatus("资料已删除。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除资料失败");
    }
  }

  return (
    <section className="panel-stack">
      <article className="feature-panel">
        <div className="panel-heading">
          <span className="section-label">资料库</span>
          <h2>先把资料挂进平台，再把阅读、批注和笔记接上来</h2>
        </div>
        <p className="panel-copy">{status}</p>
        {error ? <p className="error-text">{error}</p> : null}
      </article>

      <div className="split-layout">
        <div className="column-stack">
          <form className="auth-panel" onSubmit={handleCreateMaterial}>
            <div className="panel-heading">
              <span className="section-label">新建资料</span>
              <h2>新资料默认先进入审核队列</h2>
            </div>
            <label>
              <span>资料标题</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                value={form.title}
              />
            </label>
            <label>
              <span>分类</span>
              <input
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                value={form.category}
              />
            </label>
            <label>
              <span>标签</span>
              <input
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="用逗号分隔，例如 Go,Gin,数据库"
                value={form.tags}
              />
            </label>
            <label>
              <span>资料说明</span>
              <textarea
                className="native-textarea"
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={6}
                value={form.description}
              />
            </label>
            <label className="file-picker">
              <span>附件文件</span>
              <input
                onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <button className="primary-button" type="submit">
              {props.session ? "提交资料" : "登录后可创建资料"}
            </button>
          </form>

          <div className="list-panel">
            <div className="panel-heading">
              <span className="section-label">资料列表</span>
              <h2>已公开资料</h2>
            </div>
            {materials.map((material) => (
              <button
                className={selectedMaterial?.id === material.id ? "list-card active" : "list-card"}
                key={material.id}
                onClick={() => void getMaterial(material.id).then(setSelectedMaterial)}
                type="button"
              >
                <div className="list-head">
                  <strong>{material.title}</strong>
                  <span>{material.category}</span>
                </div>
                <p>{material.description.slice(0, 120)}</p>
                <div className="list-meta">
                  <span>{material.ownerName}</span>
                  <span>藏 {material.favoritesCount}</span>
                  <span>评分 {material.averageRating.toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="column-stack">
          <article className="auth-panel">
            <div className="panel-heading">
              <span className="section-label">资料详情</span>
              <h2>{selectedMaterial ? selectedMaterial.title : "选择一条资料查看详情"}</h2>
            </div>
            {selectedMaterial ? (
              <>
                <p className="panel-copy">{selectedMaterial.description}</p>
                <div className="tag-row">
                  {selectedMaterial.tags.map((tag) => (
                    <span className="tag-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="metric-row">
                  <button className="ghost-button" onClick={() => void handleFavoriteMaterial()} type="button">
                    收藏 {selectedMaterial.favoritesCount}
                  </button>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      className="ghost-button"
                      key={score}
                      onClick={() => void handleRateMaterial(score)}
                      type="button"
                    >
                      评 {score} 分
                    </button>
                  ))}
                </div>
                <p className="panel-copy">平均评分：{selectedMaterial.averageRating.toFixed(1)}</p>
                {props.session?.user.id === selectedMaterial.ownerUserId ? (
                  <button className="ghost-button danger-button" onClick={() => void handleDeleteMaterial()} type="button">
                    删除我的资料
                  </button>
                ) : null}
              </>
            ) : (
              <p className="panel-copy">当前还没有已公开资料，或者资料仍在审核中。</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const navigate = useNavigate();

  function handleSessionChange(nextSession: AuthSession | null) {
    setSession(nextSession);
    persistSession(nextSession);
  }

  async function handleLogout() {
    if (!session) {
      return;
    }

    try {
      await logoutUser(session);
    } catch {
      // 本地状态仍然需要清空，避免坏会话继续留在页面里。
    }

    handleSessionChange(null);
    navigate("/login", { replace: true });
  }

  return (
    <AppLayout onLogout={handleLogout} session={session}>
      <Routes>
        <Route element={<HomePage session={session} />} path="/" />
        <Route
          element={<LoginPage onLogin={(nextSession) => handleSessionChange(nextSession)} />}
          path="/login"
        />
        <Route
          element={<RegisterPage onRegister={(nextSession) => handleSessionChange(nextSession)} />}
          path="/register"
        />
        <Route element={<CommunityPage session={session} />} path="/community" />
        <Route element={<MaterialsPage session={session} />} path="/materials" />
        <Route
          element={
            <ProtectedRoute session={session}>
              <ProfilePage
                onSessionChange={(nextSession) => handleSessionChange(nextSession)}
                session={session as AuthSession}
              />
            </ProtectedRoute>
          }
          path="/profile"
        />
      </Routes>
    </AppLayout>
  );
}
