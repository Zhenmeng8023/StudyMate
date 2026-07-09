// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("keeps the frontend-user compatibility export working", () => {
    render(
      <Select aria-label="资料来源" value="material-2" onChange={() => undefined}>
        <option value="">暂不关联资料</option>
        <option value="material-2">线性代数</option>
      </Select>,
    );

    const select = screen.getByLabelText("资料来源");
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("aria-invalid")).toBeNull();
    expect(select.className).toContain("ds-select");
  });
});
