import React, { type HTMLAttributes, type ReactNode } from "react";

export type CommandBarProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  breadcrumbSeparator?: ReactNode;
  crumb: string;
  modeLabel?: string;
  search?: ReactNode;
  subtitle?: string;
  title: string;
};

export function CommandBar(props: CommandBarProps) {
  const { actions, breadcrumbSeparator, className, crumb, modeLabel, search, subtitle, title, ...rest } = props;

  return (
    <header
      {...rest}
      className={["topbar", className ?? ""].filter(Boolean).join(" ")}
    >
      <div className="topbar-page-meta">
        {modeLabel ? <span className="topbar-mode-label">{modeLabel}</span> : null}
        <div className="topbar-breadcrumb" aria-label="当前位置">
          <span>{crumb}</span>
          {breadcrumbSeparator}
          <h1 className="topbar-breadcrumb__title">{title}</h1>
        </div>
        {subtitle ? <span className="topbar-subtitle">{subtitle}</span> : null}
      </div>
      {search}
      {actions ? <div className="topbar-actions">{actions}</div> : null}
    </header>
  );
}
