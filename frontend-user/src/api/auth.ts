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

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}) {
  return request<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function loginUser(input: { login: string; password: string }) {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function logoutUser(session: AuthSession) {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });
}

export async function getProfile(session: AuthSession) {
  return request<ProfilePayload>("/users/me", {
    headers: withAuth(session)
  });
}

export async function updateProfile(
  session: AuthSession,
  input: { displayName: string; email: string }
) {
  return request<ProfilePayload>("/users/me", {
    method: "PUT",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}
