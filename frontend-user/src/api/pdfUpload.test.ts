import { afterEach, describe, expect, it, vi } from "vitest";
import { validatePdfUpload } from "./pdfUpload";
import { uploadFile } from "./files";
import type { AuthSession } from "./types";

afterEach(() => vi.restoreAllMocks());
describe("PDF upload validation", () => {
  it("accepts an actual PDF even without a browser MIME value", async () => {
    await expect(validatePdfUpload(new File(["%PDF-1.7\n"], "LECTURE.PDF", { type: "" }))).resolves.toBeUndefined();
  });
  it("rejects Word, images and disguised PDF files before issuing a network request", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    for (const name of ["lecture.doc", "lecture.docx", "cover.png", "fake.pdf"]) {
      await expect(uploadFile({} as AuthSession, new File(["not a PDF"], name, { type: "application/pdf" }))).rejects.toThrow(/PDF/);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects oversized and empty files", async () => {
    const file = new File(["%PDF-"], "big.pdf");
    Object.defineProperty(file, "size", { value: 50 * 1024 * 1024 + 1 });
    await expect(validatePdfUpload(file)).rejects.toThrow("50 MiB");
    await expect(validatePdfUpload(new File([], "empty.pdf"))).rejects.toThrow(/PDF/);
  });
});
