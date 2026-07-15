import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { primaryNavItems } from "../appShared";

const navigationGroups = [
  { label: "学习空间", items: ["/", "/materials", "/reader", "/notes"] },
  { label: "理解与巩固", items: ["/graph", "/review", "/ai"] },
  { label: "发现", items: ["/community", "/settings"] }
] as const;

export function PrimaryNavigation(props: { session: AuthSession | null }) {
  const initials = props.session?.user.displayName?.trim().slice(0, 1) || "学";

  return (
    <aside className="primary-sidebar" aria-label="主导航">
      <div className="primary-sidebar__top">
        <Link className="brand-block" to="/">
          <span className="brand-glyph" aria-hidden="true">S</span>
          <span>
            <strong>StudyMate</strong>
            <small>把资料变成知识</small>
          </span>
        </Link>
      </div>

      <Link className="sidebar-primary-action" to="/materials">
        <Plus aria-hidden="true" size={17} strokeWidth={2.1} />
        <span>添加学习资料</span>
        <kbd>N</kbd>
      </Link>

      <nav className="primary-nav" aria-label="学习功能">
        {navigationGroups.map((group) => (
          <section className="primary-nav__section" key={group.label}>
            <p className="primary-nav__label">{group.label}</p>
            {primaryNavItems
              .filter((item) => (group.items as readonly string[]).includes(item.to))
              .map((item) => {
                const Icon = item.icon;
                const target = item.requiresAuth && !props.session ? "/login" : item.to;
                return (
                  <NavLink
                    aria-label={item.requiresAuth && !props.session ? `${item.label}（需要登录）` : item.label}
                    className={({ isActive }) => ["nav-item", isActive && target === item.to ? "active" : "", item.requiresAuth && !props.session ? "locked" : ""].filter(Boolean).join(" ")}
                    end={item.to === "/"}
                    key={item.to}
                    to={target}
                  >
                    <span className="nav-item__icon"><Icon size={18} strokeWidth={1.9} /></span>
                    <span>{item.label}</span>
                    {item.to === "/review" && props.session ? <span className="nav-item__dot" aria-label="有待复习内容" /> : null}
                  </NavLink>
                );
              })}
          </section>
        ))}
      </nav>

      <div className="sidebar-tools" aria-label="辅助入口">
        <Link className="sidebar-tool-link" to="/search">
          <Search aria-hidden="true" size={15} />
          <span>全局搜索</span>
          <kbd>⌘K</kbd>
        </Link>
        <Link className="sidebar-tool-link" to={props.session ? "/settings" : "/login"}>
          <SlidersHorizontal aria-hidden="true" size={15} />
          <span>偏好设置</span>
          <kbd>⌘,</kbd>
        </Link>
      </div>

      <div className="primary-sidebar__footer">
        {props.session ? (
          <Link aria-label="打开账户设置" className="sidebar-account" to="/settings">
            <span className="sidebar-account__avatar">{initials}</span>
            <span>
              <strong>{props.session.user.displayName}</strong>
              <small>个人学习空间</small>
            </span>
            <span className="sidebar-account__status" aria-label="已同步" />
          </Link>
        ) : (
          <Link className="sidebar-login" to="/login">
            <strong>登录并同步学习进度</strong>
            <span>跨设备继续你的学习上下文</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
