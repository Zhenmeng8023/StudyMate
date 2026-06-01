import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AuthSession } from "../api/client";
import { loginUser, registerUser } from "../api/client";

export function AuthLead() {
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

export function LoginPage(props: { onLogin: (session: AuthSession) => void }) {
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

export function RegisterPage(props: { onRegister: (session: AuthSession) => void }) {
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
