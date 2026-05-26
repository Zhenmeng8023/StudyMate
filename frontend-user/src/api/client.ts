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
