import React, { type HTMLAttributes, type ReactNode } from "react";

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function PageHeader(props: PageHeaderProps) {
  const { actions, className, description, eyebrow, title, ...rest } = props;

  return (
    <header
      {...rest}
      className={["workspace-header", className ?? ""].filter(Boolean).join(" ")}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="header-copy">{description}</p>
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}
