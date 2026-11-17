import type { MaterialPayload } from "../../api/client";

export type LibraryMode = "personal" | "official";
export type LibraryDocumentDraft = {
  materialType?: NonNullable<MaterialPayload["materialType"]>;
  author?: string;
  sourceUrl?: string;
  publicationYear?: string;
  edition?: string;
  licenseStatus?: NonNullable<MaterialPayload["licenseStatus"]>;
  title: string;
  description: string;
  category: string;
  tags: string;
  folderName: string;
};

export function createDocumentDraft(material?: MaterialPayload): LibraryDocumentDraft {
  return {
    materialType: material?.materialType || "other", author: material?.author || "", sourceUrl: material?.sourceUrl || "",
    publicationYear: material?.publicationYear ? String(material.publicationYear) : "", edition: material?.edition || "", licenseStatus: material?.licenseStatus || "unknown",
    title: material?.title || "", description: material?.description || "",
    category: material?.category || "学习资料", tags: material?.tags?.join(", ") || "",
    folderName: material?.folderName || ""
  };
}

export const materialTypeLabels = { book: "书籍", paper: "论文", lecture: "讲义", exercises: "题库", course: "课程资料", other: "其他" } as const;
export const licenseStatusLabels = { unknown: "授权信息未补充", self_owned: "原创／自有", authorized: "已获授权", open_license: "开放许可", public_domain: "公有领域" } as const;
export function safeSourceUrl(value?: string) {
  try { const url = new URL(value || ""); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; }
  catch { return ""; }
}

export function documentFileKind(material: Pick<MaterialPayload, "attachmentName" | "attachmentMime">) {
  if (/\.pdf$/i.test(material.attachmentName) || material.attachmentMime.toLowerCase().includes("pdf")) return "PDF";
  if (/\.docx?$/i.test(material.attachmentName) || /word|officedocument.wordprocessingml/.test(material.attachmentMime)) return "Word";
  return "附件";
}

export function filterLibraryDocuments(items: MaterialPayload[], keyword: string, folder: string) {
  const query = keyword.trim().toLocaleLowerCase();
  return items.filter((item) => (!folder || (item.folderName || "") === folder) &&
    (!query || [item.title, item.description, item.attachmentName, ...(item.tags || [])].join(" ").toLocaleLowerCase().includes(query)));
}
