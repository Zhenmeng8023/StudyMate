import { describe, expect, it } from "vitest";
import { getAdminRequestErrorMessage, getAdminRequestErrorStatus } from "./adminRequestError";

describe("adminRequestError", () => {
  it("reads the numeric status from request-like errors", () => {
    expect(getAdminRequestErrorStatus({ status: 403 })).toBe(403);
    expect(getAdminRequestErrorStatus({ status: "403" })).toBeNull();
    expect(getAdminRequestErrorStatus(null)).toBeNull();
  });

  it("uses Error.message when present and falls back otherwise", () => {
    expect(getAdminRequestErrorMessage(new Error("读取失败"), "后备文案")).toBe("读取失败");
    expect(getAdminRequestErrorMessage("boom", "后备文案")).toBe("后备文案");
  });
});
