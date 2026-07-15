import React, { forwardRef, type ButtonHTMLAttributes } from "react";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { active = false, className, type, ...buttonProps },
  ref
) {
  const ariaLabel = buttonProps["aria-label"] ?? (typeof buttonProps.title === "string" ? buttonProps.title : undefined);

  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-label={ariaLabel}
      aria-pressed={active ? true : buttonProps["aria-pressed"]}
      className={["icon-button", active ? "active" : "", className ?? ""].filter(Boolean).join(" ")}
      type={type ?? "button"}
    />
  );
});
