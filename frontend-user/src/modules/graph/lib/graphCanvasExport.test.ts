import { describe, expect, it, vi } from "vitest";
import { renderGraphPngBlobFromSvg } from "./graphCanvasExport";

function createCanvasStub(blob: Blob | null) {
  const fillRect = vi.fn();
  const drawImage = vi.fn();
  const context = {
    fillStyle: "",
    fillRect,
    drawImage
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: (result: Blob | null) => void) => callback(blob))
  };

  return { canvas, context, fillRect, drawImage };
}

describe("graph canvas export", () => {
  it("renders SVG content into a PNG blob with the requested canvas bounds", async () => {
    const pngBlob = new Blob(["png"], { type: "image/png" });
    const { canvas, fillRect, drawImage } = createCanvasStub(pngBlob);
    const image = {
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
      set src(_value: string) {
        this.onload?.();
      }
    };

    const result = await renderGraphPngBlobFromSvg("<svg />", {
      background: "#fff",
      createCanvas: () => canvas as unknown as HTMLCanvasElement,
      createImage: () => image as unknown as HTMLImageElement,
      createObjectUrl: () => "blob:graph",
      height: 600,
      revokeObjectUrl: vi.fn(),
      width: 800
    });

    expect(result).toBe(pngBlob);
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 800, 600);
  });

  it("revokes the object URL when image loading fails", async () => {
    const revokeObjectUrl = vi.fn();
    const image = {
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
      set src(_value: string) {
        this.onerror?.();
      }
    };

    await expect(
      renderGraphPngBlobFromSvg("<svg />", {
        background: "#fff",
        createCanvas: () => createCanvasStub(new Blob()).canvas as unknown as HTMLCanvasElement,
        createImage: () => image as unknown as HTMLImageElement,
        createObjectUrl: () => "blob:graph",
        height: 600,
        revokeObjectUrl,
        width: 800
      })
    ).rejects.toThrow("png_export_failed");

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:graph");
  });
});
