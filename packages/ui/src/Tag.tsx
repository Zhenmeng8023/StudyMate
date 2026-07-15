import React, { type HTMLAttributes } from "react";

export type TagTone = "default" | "muted" | "accent" | "success" | "warning" | "danger";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone;
};

export function Tag({ tone = "default", className, ...spanProps }: TagProps) {
  return (
    <span
      {...spanProps}
      className={["chip", tone !== "default" ? `chip--${tone}` : "", className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
