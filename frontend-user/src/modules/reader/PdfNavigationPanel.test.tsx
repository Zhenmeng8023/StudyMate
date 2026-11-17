import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfNavigationPanel } from "./PdfNavigationPanel";
import { usePdfNavigation } from "./usePdfNavigation";
import type { PdfNavigationDocument } from "./pdfNavigation";

afterEach(cleanup);
function Harness({ document }: { document: PdfNavigationDocument | null }) {
  const navigation = usePdfNavigation(document, vi.fn());
  return <><button onClick={() => navigation.setPanel("outline")}>open outline</button><button onClick={() => navigation.setPanel("search")}>open search</button>
    <PdfNavigationPanel navigation={navigation} totalPages={document?.numPages || 0} ready={Boolean(document)} /></>;
}

describe("PDF navigation panel", () => {
  it("explains an absent outline and rejects external directory entries", async () => {
    const document = { numPages: 1, getOutline: vi.fn().mockResolvedValue([]) };
    const user = userEvent.setup();
    render(<Harness document={document} />);
    await user.click(screen.getByRole("button", { name: "open outline" }));
    expect(await screen.findByText(/没有内嵌目录/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "关闭 PDF 导航" }));
    document.getOutline.mockResolvedValue([{ title: "Website", url: "https://example.test" }]);
    await user.click(screen.getByRole("button", { name: "open outline" }));
    expect(await screen.findByRole("button", { name: /Website/ })).toBeDisabled();
  });
  it("shows text failures, retries, and explains image-only documents", async () => {
    const document = { numPages: 1, getPage: vi.fn().mockRejectedValueOnce(new Error("Text failed")).mockResolvedValue({ getTextContent: async () => ({ items: [] }) }) };
    const user = userEvent.setup();
    render(<Harness document={document} />);
    await user.click(screen.getByRole("button", { name: "open search" }));
    await user.type(screen.getByLabelText("查找内容"), "study");
    await user.click(screen.getByRole("button", { name: "开始查找" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Text failed");
    await user.click(screen.getByRole("button", { name: "重试查找" }));
    expect(await screen.findByText(/未检测到可提取文字/)).toBeInTheDocument();
  });
  it("reports no matches and exposes cancellation while extracting pages", async () => {
    let finish!: (value: { items: unknown[] }) => void;
    const document = { numPages: 1, getPage: vi.fn().mockResolvedValueOnce({ getTextContent: async () => ({ items: [{ str: "unrelated" }] }) }).mockResolvedValue({ getTextContent: () => new Promise((resolve) => { finish = resolve; }) }) };
    const user = userEvent.setup();
    const { unmount } = render(<Harness document={document} />);
    await user.click(screen.getByRole("button", { name: "open search" }));
    await user.type(screen.getByLabelText("查找内容"), "study");
    await user.click(screen.getByRole("button", { name: "开始查找" }));
    expect(await screen.findByText(/未找到匹配内容/)).toBeInTheDocument();
    unmount();
    render(<Harness document={document} />);
    await user.click(screen.getByRole("button", { name: "open search" }));
    await user.type(screen.getByLabelText("查找内容"), "study");
    await user.click(screen.getByRole("button", { name: "开始查找" }));
    await waitFor(() => expect(finish).toBeDefined());
    await user.click(screen.getByRole("button", { name: "停止查找" }));
    expect(screen.getByRole("status")).toHaveTextContent("已停止");
    finish({ items: [] });
  });
});
