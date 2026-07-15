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
  tags?: string[];
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
  rects: PdfRectPayload[];
  createdAt: string;
  updatedAt: string;
}

export interface PdfRectPayload {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
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
  thumbnailFileId?: string;
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

export type GraphLayoutMode = "source-swimlane";

export interface GraphLayoutPreviewPayload {
  mode: GraphLayoutMode;
  statusMessage: string;
  document: GraphDocumentPayload;
  selectedNodeIds: string[];
  laneCount: number;
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
  tags?: string[];
  sourceType?: string;
  sourceId?: string;
  sourceMetadata?: Record<string, unknown>;
  status: string;
  schedule?: CardSchedulePayload;
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

export interface ReviewFeedbackCardPayload {
  cardId: string;
  deckId: string;
  deckTitle: string;
  front: string;
  sourceType?: string;
  sourceId?: string;
  sourceMetadata?: Record<string, unknown>;
  dueAt: string;
  lapseCount: number;
  repetitionCount: number;
  state: string;
}

export interface ReviewFeedbackPayload {
  dueCount: number;
  learningCount: number;
  weakCardCount: number;
  weakCards: ReviewFeedbackCardPayload[];
}

export interface ReviewResultPayload {
  reviewId: string;
  schedule: CardSchedulePayload;
}

export interface UndoReviewResultPayload {
  schedule: CardSchedulePayload;
}

export interface CardDraftPayload {
  id: string;
  draftId?: string;
  sourceType?: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceMetadata?: Record<string, unknown>;
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
  sourceMetadata?: Record<string, unknown>;
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

export type SearchResultType = "material" | "post" | "note" | "graph" | "card";
export type SearchResultSource = "material" | "community" | "note" | "graph" | "card";

export interface SearchResultPayload {
  type: SearchResultType;
  id: string;
  title: string;
  summary: string;
  url: string;
  source: SearchResultSource;
}

export interface SearchGroupPayload {
  type: SearchResultType;
  count: number;
  returnedCount: number;
  nextOffset: number | null;
  results: SearchResultPayload[];
}

export interface SearchResponsePayload {
  query: string;
  limit: number;
  elapsedMs: number;
  total: number;
  groups: SearchGroupPayload[];
}

export interface ShareLinkPayload {
  id: string;
  ownerUserId: string;
  targetType: string;
  targetId: string;
  mode: string;
  token: string;
  status: string;
  url: string;
  expiresAt?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface ShareResolvePayload {
  token: string;
  mode: string;
  targetType: string;
  targetId: string;
  title: string;
  summary: string;
  url: string;
  readOnly: boolean;
  metadata: Record<string, unknown>;
}
