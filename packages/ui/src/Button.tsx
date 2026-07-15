import React, { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  danger?: boolean;
  variant?: ButtonVariant;
};

function resolveButtonClassName(variant: ButtonVariant) {
  if (variant === "primary") return "primary-button";
  if (variant === "ghost") return "ghost-button";
  return "secondary-button";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { active = false, danger = false, variant = "secondary", className, type, ...buttonProps },
  ref
) {
  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-pressed={active ? true : buttonProps["aria-pressed"]}
      className={[
        resolveButtonClassName(variant),
        danger ? "danger" : "",
        active ? "active" : "",
        className ?? ""
      ].filter(Boolean).join(" ")}
      type={type ?? "button"}
    />
  );
});
