import React, { type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid = false, ...inputProps }: InputProps) {
  const ariaInvalid = invalid || inputProps["aria-invalid"] === true || inputProps["aria-invalid"] === "true";

  return (
    <input
      {...inputProps}
      aria-invalid={ariaInvalid ? "true" : undefined}
      className={["ds-input", invalid ? "is-invalid" : "", className ?? ""].filter(Boolean).join(" ")}
      type={inputProps.type ?? "text"}
    />
  );
}
