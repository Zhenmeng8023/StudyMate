import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { getOfficialVersions, getManagedOfficialVersions, type OfficialVersionHistoryPayload } from "../../api/library";
import { OfficialVersionHistory } from "./OfficialVersionHistory";

vi.mock("../../api/library", () => ({ getOfficialVersions: vi.fn(), getManagedOfficialVersions: vi.fn() }));
const session = { accessToken: "token", user: { id: "admin", role: "admin" } } as AuthSession;
const history: OfficialVersionHistoryPayload = { currentMaterialId: "old", latestPublishedId: "new", items: [
  { id: "new", title: "新版教材", edition: "第二版", status: "approved", changeSummary: "更新练习题", createdAt: "2026-11-17" },
  { id: "old", title: "旧版教材", edition: "第一版", status: "approved", changeSummary: "", createdAt: "2026-11-16" }
] };
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
function view(props: Partial<Parameters<typeof OfficialVersionHistory>[0]> = {}) {
  return render(<MemoryRouter><OfficialVersionHistory materialId="old" session={null} managing={false} busy={false} {...props} /></MemoryRouter>);
}
describe("official PDF versions", () => {
  it("shows the current version and links to the latest published resource without changing its identity", async () => {
    vi.mocked(getOfficialVersions).mockResolvedValue(history);
    view();
    expect(await screen.findByRole("link", { name: "查看最新版本" })).toHaveAttribute("href", "/official-materials?selected=new");
    expect(screen.getByText("当前版本")).toBeInTheDocument();
    expect(screen.getByText("更新练习题")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "发布新版" })).not.toBeInTheDocument();
  });
  it("only offers publishing from the newest chain item and uses the protected management endpoint", async () => {
    vi.mocked(getManagedOfficialVersions).mockResolvedValue({ ...history, currentMaterialId: "new" });
    const publish = vi.fn();
    view({ materialId: "new", session, managing: true, onPublish: publish });
    fireEvent.click(await screen.findByRole("button", { name: "发布新版" }));
    expect(publish).toHaveBeenCalledOnce();
    expect(getManagedOfficialVersions).toHaveBeenCalledWith(session, "new");
    expect(getOfficialVersions).not.toHaveBeenCalled();
  });
  it("retries failures and ignores results after the selected resource changes", async () => {
    vi.mocked(getOfficialVersions).mockRejectedValueOnce(new Error("版本读取失败")).mockResolvedValue(history);
    const rendered = view();
    expect(await screen.findByRole("alert")).toHaveTextContent("版本读取失败");
    fireEvent.click(screen.getByRole("button", { name: "重新加载版本" }));
    expect(await screen.findByText("第二版")).toBeInTheDocument();
    let finish!: (value: OfficialVersionHistoryPayload) => void;
    vi.mocked(getOfficialVersions).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    rendered.rerender(<MemoryRouter><OfficialVersionHistory materialId="pending" session={null} managing={false} busy={false} /></MemoryRouter>);
    rendered.unmount();
    await act(async () => finish(history));
  });
});
