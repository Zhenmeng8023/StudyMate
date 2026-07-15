import React, { type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({ className, invalid = false, ...selectProps }: SelectProps) {
  const ariaInvalid = invalid || selectProps["aria-invalid"] === true || selectProps["aria-invalid"] === "true";

  return (
    <select
      {...selectProps}
      aria-invalid={ariaInvalid ? "true" : undefined}
      className={["ds-select", invalid ? "is-invalid" : "", className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
