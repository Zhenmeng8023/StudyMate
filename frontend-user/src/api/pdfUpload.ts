export async function validatePdfUpload(file: File): Promise<void> {
  if (!/\.pdf$/i.test(file.name)) throw new Error("仅支持上传 PDF 文件。");
  if (file.size > 50 * 1024 * 1024) throw new Error("文件不能超过 50 MiB，请压缩后重试。");
  const header = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("无法读取文件，请重新选择 PDF。"));
    reader.readAsArrayBuffer(file.slice(0, 5));
  });
  if (String.fromCharCode(...new Uint8Array(header)) !== "%PDF-") {
    throw new Error("文件内容不是有效的 PDF，请勿仅修改扩展名。");
  }
}
