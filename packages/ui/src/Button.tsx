import React, { type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  danger?: boolean;
  variant?: ButtonVariant;
};

function resolveButtonClassName(variant: ButtonVariant) {
  if (variant === "primary") {
    return "primary-button";
  }
  if (variant === "ghost") {
    return "ghost-button";
  }
  return "secondary-button";
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "secondary";

  return (
    <button
      {...props}
      className={[
        resolveButtonClassName(variant),
        props.danger ? "danger" : "",
        props.active ? "active" : "",
        props.className ?? ""
      ].filter(Boolean).join(" ")}
      type={props.type ?? "button"}
    />
  );
}
