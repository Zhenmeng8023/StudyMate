export interface GraphPngRenderOptions {
  background: string;
  createCanvas?: () => HTMLCanvasElement;
  createImage?: () => HTMLImageElement;
  createObjectUrl?: (blob: Blob) => string;
  height: number;
  revokeObjectUrl?: (url: string) => void;
  width: number;
}

export async function renderGraphPngBlobFromSvg(svg: string, options: GraphPngRenderOptions) {
  const createObjectUrl = options.createObjectUrl ?? URL.createObjectURL.bind(URL);
  const revokeObjectUrl = options.revokeObjectUrl ?? URL.revokeObjectURL.bind(URL);
  const createImage = options.createImage ?? (() => new Image());
  const createCanvas = options.createCanvas ?? (() => window.document.createElement("canvas"));
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = createObjectUrl(svgBlob);

  try {
    const image = createImage();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("png_export_failed"));
      image.src = url;
    });

    const canvas = createCanvas();
    canvas.width = options.width;
    canvas.height = options.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("png_export_failed");
    }

    context.fillStyle = options.background;
    context.fillRect(0, 0, options.width, options.height);
    context.drawImage(image, 0, 0, options.width, options.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("png_export_failed"));
      }, "image/png");
    });
  } finally {
    revokeObjectUrl(url);
  }
}
