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

export async function listPosts() {
  return request<PostSummary[]>("/posts");
}

export async function getPost(postId: string) {
  return request<PostDetailPayload>(`/posts/${postId}`);
}

export async function createPost(
  session: AuthSession,
  input: { title: string; body: string; kind: "text" | "article" | "material" }
) {
  return request<PostDetailPayload>("/posts", {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function createComment(session: AuthSession, postId: string, body: string) {
  return request<PostDetailPayload>(`/posts/${postId}/comments`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ body })
  });
}

export async function togglePostLike(session: AuthSession, postId: string) {
  return request<TogglePayload>(`/posts/${postId}/like`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function togglePostFavorite(session: AuthSession, postId: string) {
  return request<TogglePayload>(`/posts/${postId}/favorite`, {
    method: "POST",
    headers: withAuth(session)
  });
}
