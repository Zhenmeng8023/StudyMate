import { Link, NavLink } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { primaryNavItems } from "../appShared";

const navigationGroups = [
  { label: "学习空间", items: ["/", "/materials", "/reader", "/notes", "/graph", "/review"] },
  { label: "探索与设置", items: ["/ai", "/community", "/settings"] }
] as const;

export function PrimaryNavigation(props: { session: AuthSession | null }) {
  const initials = props.session?.user.displayName?.trim().slice(0, 1) || "学";

  return (
    <aside className="primary-sidebar" aria-label="主导航">
      <div className="primary-sidebar__top">
        <Link className="brand-block" to="/">
          <span className="brand-glyph" aria-hidden="true">学</span>
          <span>
            <strong>StudyMate</strong>
            <small>知识学习空间</small>
          </span>
        </Link>
      </div>

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
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </section>
        ))}
      </nav>

      <div className="primary-sidebar__footer">
        {props.session ? (
          <Link aria-label="打开账户设置" className="sidebar-account" to="/settings">
            <span className="sidebar-account__avatar">{initials}</span>
            <span>
              <strong>{props.session.user.displayName}</strong>
              <small>个人学习空间</small>
            </span>
          </Link>
        ) : (
          <Link className="sidebar-login" to="/login">
            <strong>登录后同步学习进度</strong>
            <span>进入个人工作区</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
