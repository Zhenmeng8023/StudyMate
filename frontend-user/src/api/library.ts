import { readApiResponse } from "@studymate/api-client";
import { request, withAuth } from "./core";
import type { AuthSession, MaterialPayload } from "./types";

export interface LibraryMaterialInput {
  materialType?: MaterialPayload["materialType"];
  author?: string;
  sourceUrl?: string;
  publicationYear?: number;
  edition?: string;
  licenseStatus?: MaterialPayload["licenseStatus"];
  title: string;
  description: string;
  category: string;
  tags: string[];
  attachmentFileId?: string;
  folderName?: string;
}

const materialPath = (id: string) => `/library/materials/${encodeURIComponent(id)}`;
const officialPath = (id: string) => `/official-materials/${encodeURIComponent(id)}`;

export function listLibraryMaterials(session: AuthSession) {
  return request<MaterialPayload[]>("/library/materials", { headers: withAuth(session) });
}

export function getLibraryMaterial(session: AuthSession, id: string) {
  return request<MaterialPayload>(materialPath(id), { headers: withAuth(session) });
}

export function createLibraryMaterial(session: AuthSession, input: LibraryMaterialInput) {
  return request<MaterialPayload>("/library/materials", { method: "POST", headers: withAuth(session), body: { ...input } });
}

export function updateLibraryMaterial(session: AuthSession, id: string, input: LibraryMaterialInput) {
  return request<MaterialPayload>(materialPath(id), { method: "PUT", headers: withAuth(session), body: { ...input } });
}

export function deleteLibraryMaterial(session: AuthSession, id: string) {
  return request<{ message: string }>(materialPath(id), { method: "DELETE", headers: withAuth(session) });
}

export function listOfficialMaterials() {
  return request<MaterialPayload[]>("/official-materials");
}
export function getPublicOfficialMaterial(id: string) {
  return request<MaterialPayload>(`/materials/${encodeURIComponent(id)}`);
}
export function getManagedOfficialMaterial(session: AuthSession, id: string) {
  return request<MaterialPayload>(`/official-materials/manage/${encodeURIComponent(id)}`, { headers: withAuth(session) });
}

export interface OfficialCatalogQuery {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  materialType?: string;
  sort?: "updated" | "title";
  status?: "all" | "approved" | "archived" | "hidden";
}
export interface OfficialCatalogPage {
  items: MaterialPayload[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}
function catalogQuery(query: OfficialCatalogQuery) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(name, String(value));
  return params.toString();
}
export function listOfficialCatalog(query: OfficialCatalogQuery) {
  return request<OfficialCatalogPage>(`/official-materials?${catalogQuery(query)}`);
}
export function listManagedOfficialCatalog(session: AuthSession, query: OfficialCatalogQuery) {
  return request<OfficialCatalogPage>(`/official-materials/manage?${catalogQuery(query)}`, { headers: withAuth(session) });
}
export function transitionOfficialMaterial(session: AuthSession, id: string, input: { status: "approved" | "archived"; reason: string }) {
  return request<MaterialPayload>(`${officialPath(id)}/status`, { method: "PUT", headers: withAuth(session), body: { ...input } });
}

export function createOfficialMaterial(session: AuthSession, input: LibraryMaterialInput) {
  return request<MaterialPayload>("/official-materials", { method: "POST", headers: withAuth(session), body: { ...input } });
}

export interface OfficialVersionItem {
  id: string;
  title: string;
  edition: string;
  status: string;
  changeSummary: string;
  createdAt: string;
}
export interface OfficialVersionHistoryPayload {
  items: OfficialVersionItem[];
  currentMaterialId: string;
  latestPublishedId: string;
}
export function getOfficialVersions(id: string) {
  return request<OfficialVersionHistoryPayload>(`${officialPath(id)}/versions`);
}
export function getManagedOfficialVersions(session: AuthSession, id: string) {
  return request<OfficialVersionHistoryPayload>(`/official-materials/manage/${encodeURIComponent(id)}/versions`, { headers: withAuth(session) });
}
export function createOfficialVersion(session: AuthSession, previousId: string, input: LibraryMaterialInput & { changeSummary: string }) {
  return request<MaterialPayload>(`${officialPath(previousId)}/versions`, { method: "POST", headers: withAuth(session), body: { ...input } });
}

export function updateOfficialMaterial(session: AuthSession, id: string, input: LibraryMaterialInput) {
  return request<MaterialPayload>(officialPath(id), { method: "PUT", headers: withAuth(session), body: { ...input } });
}

export function deleteOfficialMaterial(session: AuthSession, id: string) {
  return request<{ message: string }>(officialPath(id), { method: "DELETE", headers: withAuth(session) });
}

export function collectOfficialMaterial(session: AuthSession, id: string) {
  return request<{ message: string }>(`/library/collections/${encodeURIComponent(id)}`, { method: "PUT", headers: withAuth(session) });
}

export function uncollectOfficialMaterial(session: AuthSession, id: string) {
  return request<{ message: string }>(`/library/collections/${encodeURIComponent(id)}`, { method: "DELETE", headers: withAuth(session) });
}

export function getMaterialAttachmentUrl(id: string, download = false) {
  return `/api/v1${materialPath(id)}/attachment${download ? "?download=1" : ""}`;
}

export async function downloadLibraryMaterial(session: AuthSession | null, material: MaterialPayload): Promise<void> {
  const url = session ? getMaterialAttachmentUrl(material.id, true) : `/api/v1/materials/${encodeURIComponent(material.id)}/attachment?download=1`;
  let response = await fetch(url, { headers: withAuth(session), cache: "no-store" });
  if (response.status === 401 && session) {
    // The JSON request shares the app's refresh/replay and invalidation handling.
    await getLibraryMaterial(session, material.id);
    response = await fetch(url, { headers: withAuth(session), cache: "no-store" });
  }
  if (!response.ok) {
    await readApiResponse(response);
    throw new Error("下载原文件失败，请稍后重试。");
  }
  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = material.attachmentName || material.title;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser time to consume the download URL before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
