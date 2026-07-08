import { request, withAuth } from "./core";
import type {
  AiDraftPayload,
  AiTaskPayload,
  AiUsageSummaryPayload,
  AuthPayload,
  AuthSession,
  CardDraftPayload,
  CardPayload,
  DeckPayload,
  DiagramTemplatePayload,
  FilePayload,
  GraphCardDraftPayload,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphSnapshotPayload,
  GraphSummaryPayload,
  GraphValidationResponse,
  MaterialFavoritePayload,
  MaterialPayload,
  MaterialRatingPayload,
  NotePayload,
  NoteVersionPayload,
  PostDetailPayload,
  PostSummary,
  ProfilePayload,
  ReaderAnnotationPayload,
  ReaderStatePayload,
  ReviewQueuePayload,
  ReviewResultPayload,
  TogglePayload
} from "./types";

export async function listMaterials() {
  return request<MaterialPayload[]>("/materials");
}

export async function getMaterial(materialId: string) {
  return request<MaterialPayload>(`/materials/${materialId}`);
}

export async function createMaterial(
  session: AuthSession,
  input: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    coverFileId: string;
    attachmentFileId: string;
  }
) {
  return request<MaterialPayload>("/materials", {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function updateMaterial(
  session: AuthSession,
  materialId: string,
  input: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    coverFileId: string;
    attachmentFileId: string;
  }
) {
  return request<MaterialPayload>(`/materials/${materialId}`, {
    method: "PUT",
    headers: withAuth(session),
    body: input
  });
}

export async function deleteMaterial(session: AuthSession, materialId: string) {
  return request<{ message: string }>(`/materials/${materialId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function toggleMaterialFavorite(session: AuthSession, materialId: string) {
  return request<MaterialFavoritePayload>(`/materials/${materialId}/favorite`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function rateMaterial(session: AuthSession, materialId: string, score: number) {
  return request<MaterialRatingPayload>(`/materials/${materialId}/rating`, {
    method: "POST",
    headers: withAuth(session),
    body: { score }
  });
}
