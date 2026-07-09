import React, { type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input(props: InputProps) {
  const { className, invalid = false, ...rest } = props;

  return (
    <input
      {...rest}
      aria-invalid={invalid || props["aria-invalid"] ? "true" : undefined}
      className={["ds-input", invalid ? "is-invalid" : "", className ?? ""].filter(Boolean).join(" ")}
      type={rest.type ?? "text"}
    />
  );
}
