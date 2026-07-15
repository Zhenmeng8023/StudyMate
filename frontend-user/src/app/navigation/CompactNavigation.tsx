import { Plus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { primaryNavItems } from "../appShared";

export function CompactNavigation(props: { session: AuthSession | null }) {
  return (
    <aside className="compact-navigation" aria-label="紧凑主导航">
      <Link aria-label="返回工作台" className="compact-brand" title="返回工作台" to="/">
        S
      </Link>
      <Link aria-label="添加资料" className="compact-create" title="添加资料" to="/materials">
        <Plus aria-hidden="true" size={18} />
      </Link>
      <nav className="compact-nav-list" aria-label="学习功能">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const target = item.requiresAuth && !props.session ? "/login" : item.to;
          return (
            <NavLink
              aria-label={item.requiresAuth && !props.session ? `${item.label}（需要登录）` : item.label}
              className={({ isActive }) => ["compact-nav-item", isActive && target === item.to ? "active" : "", item.requiresAuth && !props.session ? "locked" : ""].filter(Boolean).join(" ")}
              end={item.to === "/"}
              key={item.to}
              title={item.label}
              to={target}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <span className="compact-navigation__rail" aria-hidden="true" />
    </aside>
  );
}
