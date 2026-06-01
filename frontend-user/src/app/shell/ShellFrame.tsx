import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Bell, LogOut, Search, Sparkles, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { ContextPanel, primaryNavItems, quickActions, type ContextCard } from "../appShared";

export function ShellFrame(props: { session: AuthSession | null; onLogout: () => void; children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState(() => new URLSearchParams(location.search).get("q") || "");
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

  useEffect(() => {
    setSearchText(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchText.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

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
                <NavLink
                  className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  key={item.to}
                  to={item.to}
                >
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
                <Link
                  className="quiet-action"
                  key={item.label}
                  to={item.requiresAuth && !props.session ? "/login" : item.to}
                >
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </Link>
              ))}
            </div>
          </article>
        </aside>

        <div className="shell-main">
          <div className="topbar">
            <form className="search-field" onSubmit={handleSearchSubmit}>
              <Search size={16} />
              <input onChange={(event) => setSearchText(event.target.value)} placeholder="搜索资料、笔记或图谱" value={searchText} />
            </form>
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
