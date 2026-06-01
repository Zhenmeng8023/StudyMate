export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
}

export interface ProfilePayload {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export interface FilePayload {
  id: string;
  ownerUserId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

export interface PostSummary {
  id: string;
  title: string;
  body: string;
  kind: string;
  status: string;
  authorUserId: string;
  authorName: string;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPayload {
  id: string;
  postId: string;
  authorUserId: string;
  authorName: string;
  body: string;
  status: string;
  createdAt: string;
}

export interface PostDetailPayload extends PostSummary {
  comments: CommentPayload[];
}

export interface TogglePayload {
  active: boolean;
  count: number;
}

export interface MaterialPayload {
  id: string;
  ownerUserId: string;
  ownerName: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverFileId: string;
  attachmentFileId: string;
  attachmentName: string;
  attachmentMime: string;
  status: string;
  favoritesCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialFavoritePayload {
  active: boolean;
  count: number;
}

export interface MaterialRatingPayload {
  averageRating: number;
  userScore: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
}

export interface NotePayload {
  id: string;
  ownerUserId: string;
  title: string;
  summary: string;
  content: string;
  materialId: string;
  folderName: string;
  tags: string[];
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteVersionPayload {
  id: string;
  noteId: string;
  versionNumber: number;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface ReaderAnnotationPayload {
  id: string;
  materialId: string;
  page: number;
  quote: string;
  comment: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReaderStatePayload {
  materialId: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  bookmarks: number[];
  lastReadAt: string;
  annotations: ReaderAnnotationPayload[];
}

export interface GraphNodeSourcePayload {
  type: string;
  id: string;
  label?: string;
  excerpt?: string;
}

export type GraphNodeTone = "neutral" | "sage" | "sky" | "amber" | "rose";

export type GraphNodeEmphasis = "default" | "strong" | "muted";

export interface GraphNodeAppearancePayload {
  tone?: GraphNodeTone;
  emphasis?: GraphNodeEmphasis;
}

export interface GraphNodeMetadataPayload extends Record<string, unknown> {
  detail?: string;
  appearance?: GraphNodeAppearancePayload | null;
}

export interface GraphNodePayload {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source?: GraphNodeSourcePayload | null;
  metadata?: GraphNodeMetadataPayload;
}

export interface GraphEdgePayload {
  id: string;
  kind?: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphGroupPayload {
  id: string;
  title: string;
  nodeIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  metadata?: Record<string, unknown>;
}

export interface GraphViewportPayload {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphDocumentPayload {
  graphId: string;
  version: number;
  schemaVersion: number;
  viewport: GraphViewportPayload;
  nodes: GraphNodePayload[];
  edges: GraphEdgePayload[];
  groups: GraphGroupPayload[];
  theme?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}

export interface GraphSummaryPayload {
  id: string;
  ownerUserId: string;
  title: string;
  description: string;
  visibility: string;
  status: string;
  graphType: string;
  mode: string;
  currentVersion: number;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphDetailPayload extends GraphSummaryPayload {
  document: GraphDocumentPayload;
}

export interface GraphSnapshotPayload {
  id: string;
  graphId: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
}

export interface GraphValidationIssuePayload {
  ruleType: string;
  message: string;
  targetId?: string;
  severity: string;
}

export interface GraphValidationResponse {
  issues: GraphValidationIssuePayload[];
}

export interface GraphCardDraftPayload {
  id: string;
  draftId?: string;
  sourceNodeId: string;
  front: string;
  back: string;
  explanation?: string;
}

export interface DiagramTemplatePayload {
  id: string;
  name: string;
  category: string;
  description: string;
  mode: string;
  sampleLines: string[];
}

export interface DeckPayload {
  id: string;
  ownerUserId: string;
  title: string;
  description: string;
  visibility: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardPayload {
  id: string;
  deckId: string;
  ownerUserId: string;
  cardType: string;
  front: string;
  back: string;
  sourceType?: string;
  sourceId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardSchedulePayload {
  cardId: string;
  userId: string;
  dueAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapseCount: number;
  state: string;
  updatedAt: string;
}

export interface ReviewQueueItemPayload {
  deckTitle: string;
  card: CardPayload;
  schedule: CardSchedulePayload;
}

export interface ReviewQueuePayload {
  dueCount: number;
  items: ReviewQueueItemPayload[];
}

export interface ReviewResultPayload {
  reviewId: string;
  schedule: CardSchedulePayload;
}

export interface CardDraftPayload {
  id: string;
  draftId?: string;
  sourceType?: string;
  sourceId?: string;
  sourceLabel?: string;
  front: string;
  back: string;
  explanation?: string;
}

export interface AiTaskPayload {
  id: string;
  userId: string;
  taskType: string;
  sourceType?: string;
  sourceId?: string;
  status: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUnits: number;
  resultRefType?: string;
  resultRefId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiUsageSummaryPayload {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUnits: number;
  lastTaskAt?: string;
}

export interface AiDraftPayload {
  id: string;
  taskId: string;
  draftType: string;
  targetType: string;
  targetId: string;
  status: string;
  sourceType?: string;
  sourceId?: string;
  sourceLabel?: string;
  front: string;
  back: string;
  explanation?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function withAuth(session: AuthSession | null) {
  const headers: Record<string, string> = {};
  if (session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;
  if (!response.ok || !payload.success) {
    const message = "error" in payload ? payload.error.message : "请求失败";
    throw new Error(message);
  }

  return payload.data;
}

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

export async function uploadFile(session: AuthSession, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return request<FilePayload>("/files", {
    method: "POST",
    headers: withAuth(session),
    body: formData
  });
}

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
    body: JSON.stringify(input)
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
    body: JSON.stringify(input)
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
    body: JSON.stringify({ score })
  });
}

export async function listNotes(session: AuthSession, materialId?: string) {
  const search = materialId ? `?materialId=${encodeURIComponent(materialId)}` : "";
  return request<NotePayload[]>(`/notes${search}`, {
    headers: withAuth(session)
  });
}

export async function getNote(session: AuthSession, noteId: string) {
  return request<NotePayload>(`/notes/${noteId}`, {
    headers: withAuth(session)
  });
}

export async function createNote(
  session: AuthSession,
  input: {
    title: string;
    summary: string;
    content: string;
    materialId: string;
    folderName: string;
    tags: string[];
  }
) {
  return request<NotePayload>("/notes", {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function updateNote(
  session: AuthSession,
  noteId: string,
  input: {
    title: string;
    summary: string;
    content: string;
    folderName: string;
    tags: string[];
  }
) {
  return request<NotePayload>(`/notes/${noteId}`, {
    method: "PUT",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function deleteNote(session: AuthSession, noteId: string) {
  return request<{ message: string }>(`/notes/${noteId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function listNoteVersions(session: AuthSession, noteId: string) {
  return request<NoteVersionPayload[]>(`/notes/${noteId}/versions`, {
    headers: withAuth(session)
  });
}

export async function restoreNoteVersion(session: AuthSession, noteId: string, versionId: string) {
  return request<NotePayload>(`/notes/${noteId}/versions/${versionId}/restore`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function getReaderState(session: AuthSession, materialId: string) {
  return request<ReaderStatePayload>(`/materials/${materialId}/reader`, {
    headers: withAuth(session)
  });
}

export async function updateReaderProgress(
  session: AuthSession,
  materialId: string,
  input: {
    currentPage: number;
    totalPages: number;
    progressPercent: number;
    bookmarks: number[];
  }
) {
  return request<ReaderStatePayload>(`/materials/${materialId}/reader/progress`, {
    method: "PUT",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function createReaderAnnotation(
  session: AuthSession,
  materialId: string,
  input: {
    page: number;
    quote: string;
    comment: string;
    color: string;
  }
) {
  return request<ReaderAnnotationPayload>(`/materials/${materialId}/reader/annotations`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function deleteReaderAnnotation(
  session: AuthSession,
  materialId: string,
  annotationId: string
) {
  return request<{ message: string }>(
    `/materials/${materialId}/reader/annotations/${annotationId}`,
    {
      method: "DELETE",
      headers: withAuth(session)
    }
  );
}

export async function listGraphs(session: AuthSession) {
  return request<GraphSummaryPayload[]>("/graphs", {
    headers: withAuth(session)
  });
}

export async function createGraph(
  session: AuthSession,
  input: {
    title: string;
    description: string;
    visibility: "private" | "public";
  }
) {
  return request<GraphDetailPayload>("/graphs", {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function getGraph(session: AuthSession, graphId: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}`, {
    headers: withAuth(session)
  });
}

export async function updateGraph(
  session: AuthSession,
  graphId: string,
  input: {
    title: string;
    description: string;
    visibility: "private" | "public";
  }
) {
  return request<GraphSummaryPayload>(`/graphs/${graphId}`, {
    method: "PUT",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function deleteGraph(session: AuthSession, graphId: string) {
  return request<{ message: string }>(`/graphs/${graphId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function batchSaveGraph(
  session: AuthSession,
  graphId: string,
  input: {
    title: string;
    description: string;
    summary: string;
    document: GraphDocumentPayload;
  }
) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/batch-save`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function listGraphSnapshots(session: AuthSession, graphId: string) {
  return request<GraphSnapshotPayload[]>(`/graphs/${graphId}/snapshots`, {
    headers: withAuth(session)
  });
}

export async function restoreGraphSnapshot(session: AuthSession, graphId: string, versionNumber: number) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/restore`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ versionNumber })
  });
}

export async function importGraphMarkdown(session: AuthSession, graphId: string, source: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/import/markdown`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ source })
  });
}

export async function importGraphMermaid(session: AuthSession, graphId: string, source: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/import/mermaid`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ source })
  });
}

export async function validateGraph(session: AuthSession, graphId: string) {
  return request<GraphValidationResponse>(`/graphs/${graphId}/validate`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function generateGraphCardDrafts(session: AuthSession, graphId: string, nodeIds: string[]) {
  return request<GraphCardDraftPayload[]>(`/graphs/${graphId}/ai/generate-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ nodeIds })
  });
}

export async function commitGraphCardDrafts(
  session: AuthSession,
  graphId: string,
  input: {
    deckId: string;
    drafts: GraphCardDraftPayload[];
  }
) {
  return request<CardPayload[]>(`/graphs/${graphId}/ai/commit-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function listDiagramTemplates(session: AuthSession) {
  return request<DiagramTemplatePayload[]>("/diagram/templates", {
    headers: withAuth(session)
  });
}

export async function listDecks(session: AuthSession) {
  return request<DeckPayload[]>("/decks", {
    headers: withAuth(session)
  });
}

export async function createDeck(
  session: AuthSession,
  input: { title: string; description: string; visibility: "private" | "public" }
) {
  return request<DeckPayload>("/decks", {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function listDeckCards(session: AuthSession, deckId: string) {
  return request<CardPayload[]>(`/decks/${deckId}/cards`, {
    headers: withAuth(session)
  });
}

export async function createDeckCard(
  session: AuthSession,
  deckId: string,
  input: {
    cardType: string;
    front: string;
    back: string;
    sourceType?: string;
    sourceId?: string;
  }
) {
  return request<CardPayload>(`/decks/${deckId}/cards`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function bulkCreateDeckCards(
  session: AuthSession,
  deckId: string,
  cards: Array<{
    cardType: string;
    draftId?: string;
    front: string;
    back: string;
    sourceType?: string;
    sourceId?: string;
  }>
) {
  return request<CardPayload[]>(`/decks/${deckId}/cards/bulk`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ cards })
  });
}

export async function listAiTasks(session: AuthSession) {
  return request<AiTaskPayload[]>("/ai/tasks", {
    headers: withAuth(session)
  });
}

export async function getAiUsageSummary(session: AuthSession) {
  return request<AiUsageSummaryPayload>("/ai/usage", {
    headers: withAuth(session)
  });
}

export async function listAiDrafts(session: AuthSession) {
  return request<AiDraftPayload[]>("/ai/drafts", {
    headers: withAuth(session)
  });
}

export async function commitGraphChangeDrafts(session: AuthSession, graphId: string, draftIds: string[]) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/ai/commit-changes`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ draftIds })
  });
}

export async function commitGraphChangeDraftSelection(
  session: AuthSession,
  graphId: string,
  input: {
    draftIds: string[];
    nodeSelections: Array<{
      draftId: string;
      nodeIds: string[];
    }>;
  }
) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/ai/commit-changes`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}

export async function generateNoteCardDrafts(session: AuthSession, noteId: string) {
  return request<CardDraftPayload[]>(`/notes/${noteId}/ai/generate-cards`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function generateNoteGraphDrafts(session: AuthSession, noteId: string) {
  return request<AiDraftPayload[]>(`/notes/${noteId}/ai/generate-graph-drafts`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function generateAnnotationCardDrafts(
  session: AuthSession,
  materialId: string,
  annotationIds: string[]
) {
  return request<CardDraftPayload[]>(`/materials/${materialId}/reader/annotations/generate-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ annotationIds })
  });
}

export async function generateAnnotationGraphDrafts(
  session: AuthSession,
  materialId: string,
  annotationIds: string[]
) {
  return request<AiDraftPayload[]>(`/materials/${materialId}/reader/annotations/generate-graph-drafts`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify({ annotationIds })
  });
}

export async function getTodayReviewQueue(session: AuthSession) {
  return request<ReviewQueuePayload>("/review/today", {
    headers: withAuth(session)
  });
}

export async function reviewCard(
  session: AuthSession,
  cardId: string,
  input: {
    rating: "again" | "hard" | "good" | "easy";
    elapsedMs: number;
  }
) {
  return request<ReviewResultPayload>(`/cards/${cardId}/review`, {
    method: "POST",
    headers: withAuth(session),
    body: JSON.stringify(input)
  });
}
