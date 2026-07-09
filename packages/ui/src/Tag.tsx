import React, { type HTMLAttributes } from "react";

export type TagTone = "default" | "muted";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone;
};

export function Tag(props: TagProps) {
  const tone = props.tone ?? "default";

  return (
    <span
      {...props}
      className={["chip", tone === "muted" ? "muted" : "", props.className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
