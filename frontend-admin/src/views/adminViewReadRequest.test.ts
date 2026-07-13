import { describe, expect, it, vi } from "vitest";
import { runAdminViewReadRequest } from "./adminViewReadRequest";

describe("adminViewReadRequest", () => {
  it("returns the loaded data when the request succeeds", async () => {
    const request = vi.fn(async () => ({ id: "admin-1" }));
    const readStatus = vi.fn(() => null);

    const result = await runAdminViewReadRequest({
      fallbackMessage: "读取失败",
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "success",
      data: { id: "admin-1" }
    });
    expect(readStatus).not.toHaveBeenCalled();
  });

  it("keeps the error message and status when the request throws an Error", async () => {
    const error = new Error("管理员资料同步失败");
    const request = vi.fn(async () => {
      throw error;
    });
    const readStatus = vi.fn(() => 500);

    const result = await runAdminViewReadRequest({
      fallbackMessage: "读取管理员资料失败",
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "error",
      message: "管理员资料同步失败",
      status: 500
    });
    expect(readStatus).toHaveBeenCalledWith(error);
  });

  it("falls back to the provided message for unknown thrown values", async () => {
    const request = vi.fn(async () => {
      throw "boom";
    });
    const readStatus = vi.fn(() => 503);

    const result = await runAdminViewReadRequest({
      fallbackMessage: "读取后台概览失败",
      readStatus,
      request
    });

    expect(result).toEqual({
      kind: "error",
      message: "读取后台概览失败",
      status: 503
    });
  });
});
