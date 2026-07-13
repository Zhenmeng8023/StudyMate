import { describe, expect, it, vi } from "vitest";
import { runAdminViewLoadRequest } from "./adminViewLoadRequest";

describe("adminViewLoadRequest", () => {
  it("returns the loaded data when the request succeeds", async () => {
    const request = vi.fn(async () => ["row-1", "row-2"]);
    const readStatus = vi.fn(() => null);
    const onForbidden = vi.fn();

    const result = await runAdminViewLoadRequest({
      onForbidden,
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "success",
      data: ["row-1", "row-2"]
    });
    expect(readStatus).not.toHaveBeenCalled();
    expect(onForbidden).not.toHaveBeenCalled();
  });

  it("returns the error status and runs the forbidden callback on 403", async () => {
    const error = new Error("forbidden");
    const request = vi.fn(async () => {
      throw error;
    });
    const readStatus = vi.fn(() => 403);
    const onForbidden = vi.fn();

    const result = await runAdminViewLoadRequest({
      onForbidden,
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "error",
      error,
      status: 403
    });
    expect(readStatus).toHaveBeenCalledWith(error);
    expect(onForbidden).toHaveBeenCalledTimes(1);
  });

  it("does not run the forbidden callback for non-403 failures", async () => {
    const error = new Error("failed");
    const request = vi.fn(async () => {
      throw error;
    });
    const readStatus = vi.fn(() => 500);
    const onForbidden = vi.fn();

    const result = await runAdminViewLoadRequest({
      onForbidden,
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "error",
      error,
      status: 500
    });
    expect(onForbidden).not.toHaveBeenCalled();
  });
});
