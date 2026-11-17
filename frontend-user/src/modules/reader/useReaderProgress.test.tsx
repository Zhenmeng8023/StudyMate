import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { updateReaderProgress } from "../../api/client";
import type { AuthSession, ReaderStatePayload } from "../../api/types";
import { useReaderProgress } from "./useReaderProgress";

vi.mock("../../api/client", () => ({ updateReaderProgress: vi.fn() }));
const session = { accessToken: "token", user: { id: "user-1" } } as AuthSession;
const initial: ReaderStatePayload = { materialId: "m", currentPage: 1, totalPages: 10, progressPercent: 10, bookmarks: [], lastReadAt: "", annotations: [] };
const update = vi.mocked(updateReaderProgress);

function setup() {
  return renderHook(() => {
    const [state, setState] = useState<ReaderStatePayload | null>(initial);
    return { state, ...useReaderProgress(session, "m", state, setState) };
  });
}

describe("reading progress persistence", () => {
  it("serializes writes and coalesces fast page changes without losing bookmarks", async () => {
    let resolveFirst!: (value: ReaderStatePayload) => void;
    update.mockReset().mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; })).mockImplementation(async (_session, _id, request) => ({ ...initial, ...request }));
    const { result } = setup();
    act(() => { result.current.save({ currentPage: 2 }); });
    act(() => { result.current.save({ currentPage: 3 }); result.current.save({ bookmarks: [3] }); });
    expect(update).toHaveBeenCalledTimes(1);
    await act(async () => { resolveFirst({ ...initial, currentPage: 2 }); });
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update.mock.calls[1][2]).toEqual({ currentPage: 3, totalPages: 10, progressPercent: 30, bookmarks: [3] });
    expect(result.current.state?.currentPage).toBe(3);
    act(() => result.current.save({ currentPage: 3 }));
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("keeps local position on failure and retries the unsaved progress", async () => {
    update.mockReset().mockRejectedValueOnce(new Error("连接中断")).mockImplementation(async (_session, _id, request) => ({ ...initial, ...request }));
    const { result } = setup();
    act(() => result.current.save({ currentPage: 4 }));
    await waitFor(() => expect(result.current.error).toContain("连接中断"));
    expect(result.current.state?.currentPage).toBe(4);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.error).toBe(""));
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("preserves failed pending progress when the same user receives a refreshed token", async () => {
    update.mockReset().mockRejectedValueOnce(new Error("网络中断")).mockImplementation(async (_session, _id, request) => ({ ...initial, ...request }));
    const { result, rerender } = renderHook(({ token }) => {
      const [state, setState] = useState<ReaderStatePayload | null>(initial);
      return { state, ...useReaderProgress({ ...session, accessToken: token }, "m", state, setState) };
    }, { initialProps: { token: "old-token" } });
    act(() => result.current.save({ currentPage: 4 }));
    await waitFor(() => expect(result.current.error).toContain("网络中断"));
    rerender({ token: "new-token" });
    expect(result.current.error).toContain("网络中断");
    act(() => result.current.retry());
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update.mock.calls[1][0].accessToken).toBe("new-token");
    expect(update.mock.calls[1][2].currentPage).toBe(4);
  });
});
