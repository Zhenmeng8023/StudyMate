import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { getStorageUsage, type StorageUsage } from "../../api/storage";
import { LibraryStoragePanel } from "./LibraryStoragePanel";
vi.mock("../../api/storage", () => ({ getStorageUsage: vi.fn() }));
const session = { user: { id: "owner" }, accessToken: "token" } as AuthSession;
const usage: StorageUsage = { usedBytes: 512 * 1024, quotaBytes: 1024 * 1024, remainingBytes: 512 * 1024, fileCount: 3, unlinkedFileCount: 1, unlinkedBytes: 256, unlinkedFiles: [{ id: "f", originalName: "未完成上传.pdf", size: 256, createdAt: "2026-11-17T00:00:00Z" }] };
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
describe("library storage summary", () => {
  it("shows actual usage and clearly labels unlinked files without a delete action", async () => {
    vi.mocked(getStorageUsage).mockResolvedValue(usage);
    render(<LibraryStoragePanel session={session} revision={0} />);
    expect(await screen.findByText("512 KiB / 1 MiB")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "存储空间使用率" })).toHaveAttribute("value", "50");
    fireEvent.click(screen.getByText(/待核查文件/));
    expect(screen.getByText("未完成上传.pdf")).toBeInTheDocument();
    expect(screen.getByText(/旧链接/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /删除|清理/ })).not.toBeInTheDocument();
  });
  it("shows a recoverable error, then refreshes to a full-capacity warning", async () => {
    vi.mocked(getStorageUsage).mockRejectedValueOnce(new Error("容量暂不可用")).mockResolvedValue({ ...usage, usedBytes: usage.quotaBytes, remainingBytes: 0 });
    render(<LibraryStoragePanel session={session} revision={0} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("容量暂不可用");
    fireEvent.click(screen.getByRole("button", { name: "刷新容量" }));
    expect(await screen.findByText(/容量已用尽/)).toBeInTheDocument();
  });
  it("ignores old account results and reloads after the upload revision changes", async () => {
    let resolve!: (value: StorageUsage) => void;
    vi.mocked(getStorageUsage).mockImplementationOnce(() => new Promise((done) => { resolve = done; })).mockResolvedValue({ ...usage, fileCount: 0, unlinkedFiles: [], unlinkedFileCount: 0 });
    const view = render(<LibraryStoragePanel session={session} revision={0} />);
    view.rerender(<LibraryStoragePanel session={{ ...session, user: { ...session.user, id: "other" } }} revision={1} />);
    await act(async () => resolve(usage));
    expect(screen.queryByText("未完成上传.pdf")).not.toBeInTheDocument();
    expect(getStorageUsage).toHaveBeenCalledTimes(2);
  });
});
