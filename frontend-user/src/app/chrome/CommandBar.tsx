import { FormEvent, useMemo } from "react";
import { Bell, ChevronRight, Command, LogOut, Search, Sparkles, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { IconButton } from "../../design-system/primitives";
import type { AppLayoutMode } from "../layouts/layoutPolicy";

type PageMeta = { crumb: string; title: string; subtitle?: string };

const modeLabels: Partial<Record<AppLayoutMode, string>> = {
  studio: "专注学习",
  canvas: "图谱工作区",
  focus: "今日复习"
};

function resolvePageMeta(pathname: string): PageMeta {
  if (pathname === "/") return { crumb: "学习空间", title: "学习概览", subtitle: "继续一项已开始的学习任务" };
  if (pathname.startsWith("/materials")) return { crumb: "学习空间", title: "资料库", subtitle: "管理资料与阅读入口" };
  if (pathname.startsWith("/community")) return { crumb: "探索", title: "学习社区", subtitle: "浏览值得继续讨论的学习分享" };
  if (pathname.startsWith("/search")) return { crumb: "学习空间", title: "搜索", subtitle: "从你的学习资产中定位线索" };
  if (pathname.startsWith("/ai")) return { crumb: "学习空间", title: "AI 学伴", subtitle: "确认草稿，再进入正式学习资产" };
  if (pathname.startsWith("/settings")) return { crumb: "个人空间", title: "设置", subtitle: "管理个人资料与工作偏好" };
  if (pathname.startsWith("/reader")) return { crumb: "阅读工作台", title: "阅读与批注" };
  if (pathname.startsWith("/notes")) return { crumb: "知识沉淀", title: "笔记工作台" };
  if (pathname.startsWith("/graph")) return { crumb: "知识组织", title: "图谱画布" };
  if (pathname.startsWith("/review")) return { crumb: "学习反馈", title: "今日复习" };
  return { crumb: "StudyMate", title: "学习空间" };
}

export function CommandBar(props: {
  mode: AppLayoutMode;
  onLogout: () => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSearchTextChange: (value: string) => void;
  searchText: string;
  session: AuthSession | null;
  showSearch: boolean;
}) {
  const location = useLocation();
  const label = modeLabels[props.mode];
  const meta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname]);

  return (
    <header className={`topbar topbar--${props.mode}`}>
      <div className="topbar-page-meta">
        {label ? <span className="topbar-mode-label">{label}</span> : null}
        <div className="topbar-breadcrumb" aria-label="当前位置">
          <span>{meta.crumb}</span>
          <ChevronRight aria-hidden="true" size={14} />
          <strong>{meta.title}</strong>
        </div>
        {meta.subtitle ? <span className="topbar-subtitle">{meta.subtitle}</span> : null}
      </div>

      {props.showSearch ? (
        <form className="search-field topbar-search" onSubmit={props.onSearchSubmit} role="search">
          <Search size={16} />
          <input
            aria-label="搜索资料、笔记或图谱"
            onChange={(event) => props.onSearchTextChange(event.target.value)}
            placeholder="搜索资料、笔记、图谱…"
            value={props.searchText}
          />
          <kbd><Command size={12} />K</kbd>
        </form>
      ) : null}

      <div className="topbar-actions">
        {props.mode !== "focus" ? (
          <>
            <IconButton aria-label="提醒" className="topbar-icon-button" title="提醒">
              <Bell size={17} />
            </IconButton>
            <Link className="topbar-link topbar-ai-link" to={props.session ? "/ai" : "/login"}>
              <Sparkles size={16} />
              <span>AI 草稿</span>
            </Link>
          </>
        ) : (
          <Link className="topbar-link muted" to="/">
            <span>结束复习</span>
          </Link>
        )}
        {props.session ? (
          <div className="topbar-user-menu">
            <Link aria-label="打开个人设置" className="topbar-user" to="/settings">
              <span className="topbar-user__avatar">{props.session.user.displayName.slice(0, 1) || <UserRound size={14} />}</span>
              <span>{props.session.user.displayName}</span>
            </Link>
            <IconButton aria-label="退出登录" className="topbar-logout" onClick={props.onLogout} title="退出登录">
              <LogOut size={16} />
            </IconButton>
          </div>
        ) : (
          <Link className="primary-button" to="/login">登录</Link>
        )}
      </div>
    </header>
  );
}
