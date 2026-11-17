import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession, MaterialPayload } from "../../api/client";
import { uploadFile } from "../../api/client";
import * as libraryApi from "../../api/library";
import { LibraryWorkspacePage } from "./LibraryWorkspacePage";
import { getStorageUsage } from "../../api/storage";

vi.mock("../../api/storage", () => ({ getStorageUsage: vi.fn() }));

vi.mock("../../api/library", () => ({
  listLibraryMaterials: vi.fn(), listOfficialMaterials: vi.fn(), listOfficialCatalog: vi.fn(), listManagedOfficialCatalog: vi.fn(), transitionOfficialMaterial: vi.fn(), getPublicOfficialMaterial: vi.fn(),
  createLibraryMaterial: vi.fn(), updateLibraryMaterial: vi.fn(), deleteLibraryMaterial: vi.fn(),
  createOfficialMaterial: vi.fn(), updateOfficialMaterial: vi.fn(), deleteOfficialMaterial: vi.fn(),
  collectOfficialMaterial: vi.fn(), uncollectOfficialMaterial: vi.fn(), downloadLibraryMaterial: vi.fn()
}));
vi.mock("../../api/client", async () => ({
  ...await vi.importActual<typeof import("../../api/client")>("../../api/client"), uploadFile: vi.fn()
}));

const session: AuthSession = {
  accessToken: "token", refreshToken: "refresh", accessTokenExpiresAt: "2099-01-01",
  user: { id: "user-1", username: "alice", email: "a@example.test", displayName: "Alice", role: "student" }
};
const personal: MaterialPayload = {
  id: "private-1", ownerUserId: "user-1", ownerName: "Alice", title: "我的算法讲义", description: "个人使用的数据结构学习讲义",
  category: "讲义", tags: ["算法"], coverFileId: "", attachmentFileId: "file-1", attachmentName: "notes.pdf",
  attachmentMime: "application/pdf", status: "private", favoritesCount: 0, averageRating: 0,
  createdAt: "2026-11-16", updatedAt: "2026-11-16", libraryScope: "personal", folderName: "算法课"
};
const official: MaterialPayload = { ...personal, id: "official-1", ownerUserId: "admin-1", title: "官方学习指南", libraryScope: "official", status: "approved", folderName: "" };

function renderPage(mode: "personal" | "official" = "personal", auth: AuthSession | null = session) {
  return render(<MemoryRouter><LibraryWorkspacePage mode={mode} session={auth} /></MemoryRouter>);
}

describe("LibraryWorkspacePage", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getStorageUsage).mockResolvedValue({ usedBytes: 0, quotaBytes: 1024 ** 3, remainingBytes: 1024 ** 3, fileCount: 0, unlinkedFileCount: 0, unlinkedBytes: 0, unlinkedFiles: [] });
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([personal]);
    vi.mocked(libraryApi.listOfficialMaterials).mockResolvedValue([official]);
    vi.mocked(libraryApi.listOfficialCatalog).mockResolvedValue({ items: [official], total: 1, page: 1, pageSize: 20, categories: ["讲义"] });
    vi.mocked(libraryApi.listManagedOfficialCatalog).mockResolvedValue({ items: [official], total: 1, page: 1, pageSize: 20, categories: ["讲义"] });
    vi.mocked(libraryApi.transitionOfficialMaterial).mockResolvedValue({ ...official, status: "archived" });
    vi.mocked(uploadFile).mockResolvedValue({ id: "uploaded-1", ownerUserId: "user-1", originalName: "课程资料.pdf", mimeType: "application/pdf", size: 100, path: "", createdAt: "2026-11-16" });
    vi.mocked(libraryApi.createLibraryMaterial).mockResolvedValue({ ...personal, id: "new-1", attachmentFileId: "uploaded-1" });
    vi.mocked(libraryApi.createOfficialMaterial).mockResolvedValue({ ...official, id: "published-1" });
    vi.mocked(libraryApi.updateLibraryMaterial).mockResolvedValue({ ...personal, title: "重命名后的资料", tags: [] });
    vi.mocked(libraryApi.collectOfficialMaterial).mockResolvedValue({ message: "已收藏" });
    vi.mocked(libraryApi.uncollectOfficialMaterial).mockResolvedValue({ message: "已移出" });
  });

  it("shows real reading progress, resumes the saved page and filters reading states", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([
      { ...personal, readingProgress: { currentPage: 7, totalPages: 20, progressPercent: 35, lastReadAt: "2026-11-17T08:00:00Z" } },
      { ...personal, id: "unread-1", title: "未读的资料" }
    ]);
    renderPage();
    expect(await screen.findByRole("link", { name: "继续阅读" })).toHaveAttribute("href", "/reader/private-1?page=7");
    expect(screen.getByRole("progressbar", { name: "我的算法讲义阅读进度" })).toHaveAttribute("value", "35");
    await userEvent.selectOptions(screen.getByLabelText("阅读状态"), "unread");
    expect(screen.queryByRole("button", { name: "查看《我的算法讲义》详情" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看《未读的资料》详情" })).toBeInTheDocument();
  });

  it("uses server filters and pagination while never requesting management for readers", async () => {
    vi.mocked(libraryApi.listOfficialCatalog).mockResolvedValue({ items: [official], total: 45, page: 1, pageSize: 20, categories: ["讲义", "数学"] });
    renderPage("official");
    await screen.findByRole("link", { name: "开始阅读" });
    await userEvent.selectOptions(screen.getByLabelText("分类筛选"), "数学");
    await waitFor(() => expect(libraryApi.listOfficialCatalog).toHaveBeenLastCalledWith(expect.objectContaining({ category: "数学", page: 1 })));
    await userEvent.click(screen.getByRole("button", { name: "下一页资料" }));
    await waitFor(() => expect(libraryApi.listOfficialCatalog).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
    expect(libraryApi.listManagedOfficialCatalog).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "管理官方资料" })).not.toBeInTheDocument();
  });

  it("manages archived resources and confirms restoring their existing identity", async () => {
    const admin = { ...session, user: { ...session.user, role: "admin" } };
    vi.mocked(libraryApi.listManagedOfficialCatalog).mockResolvedValue({ items: [{ ...official, status: "archived", archiveReason: "资料需要更新" }], total: 1, page: 1, pageSize: 20, categories: [] });
    renderPage("official", admin);
    await userEvent.click(screen.getByRole("button", { name: "管理官方资料" }));
    await userEvent.click(await screen.findByRole("button", { name: "重新上架" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("原有收藏、阅读进度与批注");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "确认重新上架" }));
    await waitFor(() => expect(libraryApi.transitionOfficialMaterial).toHaveBeenCalledWith(admin, official.id, { status: "approved", reason: "" }));
  });

  it("displays official metadata and does not create unsafe source links", async () => {
    vi.mocked(libraryApi.listOfficialCatalog).mockResolvedValue({ items: [{ ...official, author: "公开课程组", sourceUrl: "javascript:alert(1)", materialType: "lecture", edition: "2026版", licenseStatus: "authorized" }], total: 1, page: 1, pageSize: 20, categories: [] });
    renderPage("official", null);
    expect(await screen.findByText("公开课程组")).toBeInTheDocument();
    expect(screen.getByText("2026版")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看来源" })).not.toBeInTheDocument();
  });

  it("loads a linked official document outside the first page without selecting another item", async () => {
    vi.mocked(libraryApi.getPublicOfficialMaterial).mockResolvedValue({ ...official, id: "linked", title: "链接指向的课程资料" });
    render(<MemoryRouter initialEntries={["/official-materials?selected=linked"]}><LibraryWorkspacePage mode="official" session={null} /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "链接指向的课程资料" })).toBeInTheDocument();
    expect(libraryApi.getPublicOfficialMaterial).toHaveBeenCalledExactlyOnceWith("linked");
    expect(screen.queryByRole("heading", { name: official.title })).not.toBeInTheDocument();
  });

  it("ignores late catalog responses after filters change", async () => {
    let resolve!: (value: libraryApi.OfficialCatalogPage) => void;
    vi.mocked(libraryApi.listOfficialCatalog).mockImplementationOnce(() => new Promise((done) => { resolve = done; })).mockResolvedValue({ items: [{ ...official, title: "最新筛选结果资料" }], total: 1, page: 1, pageSize: 20, categories: [] });
    renderPage("official", null);
    await userEvent.type(screen.getByLabelText("搜索官方资料"), "math");
    expect(await screen.findByRole("heading", { name: "最新筛选结果资料" })).toBeInTheDocument();
    await act(async () => resolve({ items: [official], total: 1, page: 1, pageSize: 20, categories: [] }));
    expect(screen.queryByRole("heading", { name: official.title })).not.toBeInTheDocument();
  });

  it("shows private documents with reading and authenticated download actions", async () => {
    renderPage();
    expect(await screen.findByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/private-1");
    expect(screen.getByText("仅自己可见")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "下载原文件" }));
    expect(libraryApi.downloadLibraryMaterial).toHaveBeenCalledWith(session, personal);
    expect(screen.queryByText("提交审核")).not.toBeInTheDocument();
  });

  it("keeps the user's saved reading position after editing book metadata", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([{ ...personal, readingProgress: { currentPage: 4, totalPages: 8, progressPercent: 50, lastReadAt: "2026-11-17T08:00:00Z" } }]);
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "编辑资料" }));
    await userEvent.click(screen.getByRole("button", { name: "保存资料信息" }));
    await waitFor(() => expect(libraryApi.updateLibraryMaterial).toHaveBeenCalled());
    expect(await screen.findByRole("link", { name: "继续阅读" })).toHaveAttribute("href", "/reader/private-1?page=4");
    expect(screen.getByRole("progressbar", { name: "重命名后的资料阅读进度" })).toHaveAttribute("value", "50");
  });

  it("uploads and creates a private document without community moderation", async () => {
    renderPage();
    await screen.findByText("我的算法讲义", { selector: "strong" });
    await userEvent.click(screen.getByRole("button", { name: "上传资料" }));
    await userEvent.upload(screen.getByLabelText("选择文件"), new File(["%PDF-1.7\n"], "课程资料.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: "上传并保存" }));
    await waitFor(() => expect(libraryApi.createLibraryMaterial).toHaveBeenCalledWith(session, expect.objectContaining({ attachmentFileId: "uploaded-1", title: "课程资料" })));
    expect(await screen.findByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/new-1");
  });

  it("filters personal documents by folder and keyword", async () => {
    renderPage();
    await screen.findByRole("link", { name: "开始阅读" });
    await userEvent.selectOptions(screen.getByLabelText("文件夹筛选"), "算法课");
    await userEvent.type(screen.getByLabelText("搜索资料"), "不存在");
    expect(screen.getByText("没有匹配的资料")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "开始阅读" })).not.toBeInTheDocument();
  });

  it("removes an official collection without deleting its original file", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([{ ...official, isCollected: true }]);
    renderPage();
    await screen.findByRole("link", { name: "开始阅读" });
    expect(screen.queryByRole("button", { name: "删除资料" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "移出个人知识库" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "确认移出" }));
    await waitFor(() => expect(libraryApi.uncollectOfficialMaterial).toHaveBeenCalledWith(session, official.id));
    expect(libraryApi.deleteLibraryMaterial).not.toHaveBeenCalled();
  });

  it("lets a signed-in user collect official documents and hides publishing controls", async () => {
    renderPage("official");
    await userEvent.click(await screen.findByRole("button", { name: "加入个人知识库" }));
    await waitFor(() => expect(libraryApi.collectOfficialMaterial).toHaveBeenCalledWith(session, official.id));
    expect(await screen.findByRole("button", { name: "移出个人知识库" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "发布官方资料" })).not.toBeInTheDocument();
  });

  it("offers public download and login links to anonymous official visitors", async () => {
    renderPage("official", null);
    expect(await screen.findByRole("link", { name: "下载原文件" })).toHaveAttribute("href", "/api/v1/materials/official-1/attachment?download=1");
    expect(screen.getByRole("link", { name: "登录后加入知识库" })).toHaveAttribute("href", "/login");
    expect(libraryApi.listLibraryMaterials).not.toHaveBeenCalled();
  });

  it("shows Word download guidance instead of claiming PDF preview support", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([{ ...personal, attachmentName: "notes.docx", attachmentMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }]);
    renderPage();
    expect(await screen.findByText("Word 文件暂不支持在线预览，请下载原文件查看。" )).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下载原文件" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "开始阅读" })).not.toBeInTheDocument();
  });

  it("only exposes official publishing to administrators", async () => {
    renderPage("official", { ...session, user: { ...session.user, role: "admin" } });
    expect(await screen.findByRole("button", { name: "发布官方资料" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "下架官方资料" })).toBeInTheDocument();
  });

  it("retains uploaded files when a private save fails and retries only the metadata write", async () => {
    vi.mocked(libraryApi.createLibraryMaterial).mockRejectedValueOnce(new Error("保存暂时失败"));
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "上传资料" }));
    await userEvent.upload(screen.getByLabelText("选择文件"), new File(["%PDF-1.7\n"], "课程资料.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: "上传并保存" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("保存暂时失败");
    await waitFor(() => expect(getStorageUsage).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("资料标题")).toHaveValue("课程资料");
    await userEvent.click(screen.getByRole("button", { name: "上传并保存" }));
    await waitFor(() => expect(libraryApi.createLibraryMaterial).toHaveBeenCalledTimes(2));
    expect(uploadFile).toHaveBeenCalledTimes(1);
  });

  it("edits private metadata and allows clearing tags without replacing the attachment", async () => {
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "编辑资料" }));
    expect(screen.queryByLabelText("选择文件")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("资料标题"));
    await userEvent.type(screen.getByLabelText("资料标题"), "重命名后的资料");
    await userEvent.clear(screen.getByLabelText("标签"));
    await userEvent.click(screen.getByRole("button", { name: "保存资料信息" }));
    await waitFor(() => expect(libraryApi.updateLibraryMaterial).toHaveBeenCalledWith(session, personal.id, expect.objectContaining({ title: "重命名后的资料", tags: [], attachmentFileId: personal.attachmentFileId })));
  });

  it("preserves the deletion confirmation after a failed request and lets the user retry", async () => {
    vi.mocked(libraryApi.deleteLibraryMaterial).mockRejectedValueOnce(new Error("删除失败，请重试")).mockResolvedValueOnce({ message: "已删除" });
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "删除资料" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "确认删除" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("删除失败，请重试");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "确认删除" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("link", { name: "开始阅读" })).not.toBeInTheDocument();
  });

  it("retries loading after a server failure", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockRejectedValueOnce(new Error("服务暂不可用"));
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "重新加载" }));
    expect(await screen.findByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/private-1");
  });

  it("requires login before loading private documents", () => {
    renderPage("personal", null);
    expect(screen.getByRole("link", { name: "登录" })).toHaveAttribute("href", "/login");
    expect(libraryApi.listLibraryMaterials).not.toHaveBeenCalled();
  });

  it("publishes an official document and confirms before taking it down", async () => {
    const admin = { ...session, user: { ...session.user, role: "admin" } };
    vi.mocked(libraryApi.listOfficialCatalog).mockResolvedValueOnce({ items: [official], total: 1, page: 1, pageSize: 20, categories: [] }).mockResolvedValue({ items: [{ ...official, id: "published-1" }, official], total: 2, page: 1, pageSize: 20, categories: [] });
    renderPage("official", admin);
    await userEvent.click(screen.getByRole("button", { name: "发布官方资料" }));
    await userEvent.upload(screen.getByLabelText("选择文件"), new File(["%PDF-1.7\n"], "官方学习.pdf", { type: "application/pdf" }));
    await userEvent.selectOptions(screen.getByLabelText("资料类型"), "lecture");
    await userEvent.type(screen.getByLabelText("作者／机构"), "课程组");
    await userEvent.type(screen.getByLabelText("来源链接"), "https://example.test/course");
    await userEvent.type(screen.getByLabelText("出版年份"), "2026");
    await userEvent.type(screen.getByLabelText("版本说明"), "第一版");
    await userEvent.selectOptions(screen.getByLabelText("授权状态"), "authorized");
    await userEvent.click(screen.getByRole("button", { name: "确认发布" }));
    await waitFor(() => expect(libraryApi.createOfficialMaterial).toHaveBeenCalledWith(admin, expect.objectContaining({ title: "官方学习", attachmentFileId: "uploaded-1", materialType: "lecture", author: "课程组", sourceUrl: "https://example.test/course", publicationYear: 2026, edition: "第一版", licenseStatus: "authorized" })));
    await userEvent.click(screen.getByRole("button", { name: "下架官方资料" }));
    expect(libraryApi.deleteOfficialMaterial).not.toHaveBeenCalled();
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "确认下架" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("下架原因"), "资料需要修订");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "确认下架" }));
    await waitFor(() => expect(libraryApi.transitionOfficialMaterial).toHaveBeenCalledWith(admin, "published-1", { status: "archived", reason: "资料需要修订" }));
  });

  it("selects the document requested by a search result deep link", async () => {
    vi.mocked(libraryApi.listLibraryMaterials).mockResolvedValue([personal, { ...personal, id: "private-2", title: "第二份课程讲义" }]);
    render(<MemoryRouter initialEntries={["/library?selected=private-2"]}><LibraryWorkspacePage mode="personal" session={session} /></MemoryRouter>);
    expect(await screen.findByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/private-2");
  });

  it("rejects Word and renamed non-PDF files before uploading", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderPage();
    await user.click(screen.getByRole("button", { name: "上传资料" }));
    expect(screen.getByLabelText("选择文件")).toHaveAttribute("accept", ".pdf,application/pdf");
    for (const name of ["lecture.docx", "disguised.pdf"]) {
      await user.upload(screen.getByLabelText("选择文件"), new File(["not a PDF"], name, { type: "application/octet-stream" }));
      await user.click(screen.getByRole("button", { name: "上传并保存" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("PDF");
      expect(uploadFile).not.toHaveBeenCalled();
    }
  });

  it("rejects files exceeding 50 MiB before uploading", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "上传资料" }));
    const file = new File(["%PDF-1.7\n"], "超大资料.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 50 * 1024 * 1024 + 1 });
    await userEvent.upload(screen.getByLabelText("选择文件"), file);
    await userEvent.click(screen.getByRole("button", { name: "上传并保存" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("文件不能超过 50 MiB");
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
