import React, { type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select(props: SelectProps) {
  const { className, invalid = false, ...rest } = props;

  return (
    <select
      {...rest}
      aria-invalid={invalid || props["aria-invalid"] ? "true" : undefined}
      className={["ds-select", invalid ? "is-invalid" : "", className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
