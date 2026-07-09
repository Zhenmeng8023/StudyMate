import React, { type ButtonHTMLAttributes } from "react";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function IconButton(props: IconButtonProps) {
  const active = props.active ?? false;
  const ariaLabel = props["aria-label"] ?? (typeof props.title === "string" ? props.title : undefined);

  return (
    <button
      {...props}
      aria-label={ariaLabel}
      className={["icon-button", active ? "active" : "", props.className ?? ""].filter(Boolean).join(" ")}
      type={props.type ?? "button"}
    />
  );
}
