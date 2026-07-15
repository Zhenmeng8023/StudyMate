import type { ReactNode } from "react";
import { BookOpen, Bot, Compass, FilePlus2, GraduationCap, LayoutGrid, LibraryBig, Network, NotebookPen, Settings } from "lucide-react";
import type { AuthSession, CardDraftPayload, MaterialPayload, NotePayload, PostSummary, ReaderAnnotationPayload } from "../api/client";
import { PageHeader } from "../design-system/primitives";

const sessionStorageKey = "studymate.session";
const suspiciousQuestionPattern = /(\?{2,}|？{2,}|锟斤拷+)/g;

export type ShellNavItem = {
  icon: typeof LayoutGrid;
  label: string;
  to: string;
  requiresAuth?: boolean;
};

export type ContextCard = {
  title: string;
  body: string;
  tone?: "default" | "accent" | "muted";
};

export const primaryNavItems: ShellNavItem[] = [
  { icon: LayoutGrid, label: "工作台", to: "/" },
  { icon: LibraryBig, label: "资料库", to: "/materials" },
  { icon: BookOpen, label: "阅读器", to: "/reader", requiresAuth: true },
  { icon: NotebookPen, label: "笔记", to: "/notes", requiresAuth: true },
  { icon: Network, label: "图谱", to: "/graph", requiresAuth: true },
  { icon: GraduationCap, label: "复习", to: "/review", requiresAuth: true },
  { icon: Bot, label: "AI 学伴", to: "/ai", requiresAuth: true },
  { icon: Compass, label: "社区", to: "/community" },
  { icon: Settings, label: "设置", to: "/settings", requiresAuth: true }
];

export const quickActions = [
  { icon: FilePlus2, label: "添加资料", description: "上传 PDF、讲义或链接，建立可检索的学习来源。", to: "/materials" },
  { icon: BookOpen, label: "继续阅读", description: "回到上次阅读位置，沿着高亮和批注继续理解。", to: "/reader", requiresAuth: true },
  { icon: NotebookPen, label: "整理笔记", description: "把摘要、观点和问题沉淀为可复用的知识卡片。", to: "/notes", requiresAuth: true },
  { icon: Network, label: "连接知识", description: "在画布中组织概念关系，形成可浏览的知识结构。", to: "/graph", requiresAuth: true }
];

export const graphPlaceholderColumns = [
  {
    title: "画布中心",
    description: "这里会承接节点、连线、分组、缩略图和工具条，成为整个产品的知识组织核心。"
  },
  {
    title: "来源引用",
    description: "资料、笔记、批注和卡片会作为可追溯的来源出现在右侧上下文里，方便一键拉入画布。"
  },
  {
    title: "AI 草稿",
    description: "AI 扩图、自动解释和 Mermaid 导入结果会先进待确认区，再由你决定是否落到正式图谱。"
  }
];

export const reviewPlaceholderCards = [
  "今日到期卡片",
  "Deck 总览",
  "复习热力图",
  "错题回看",
  "图谱转卡片",
  "AI 草稿待确认"
];

export const aiPlaceholderCards = [
  "基于资料生成摘要",
  "笔记结构优化建议",
  "图谱扩展建议",
  "复习卡片草稿",
  "学习计划占位",
  "待确认变更区"
];

export function readSession(): AuthSession | null {
  const raw = window.localStorage.getItem(sessionStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(sessionStorageKey);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric"
  });
}

export function normalizeQuestionText(value: string, fallback: string, replacement = fallback) {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^[?？锟斤拷\s]+$/.test(trimmed)) {
    return fallback;
  }

  return trimmed.replace(suspiciousQuestionPattern, replacement);
}

export function displayText(value: string | undefined | null, fallback: string, replacement = fallback) {
  if (!value) {
    return fallback;
  }

  return normalizeQuestionText(value, fallback, replacement);
}

export function displayMaterialTitle(material: MaterialPayload) {
  return displayText(material.title, "未命名资料", "资料");
}

export function displayMaterialDescription(material: MaterialPayload) {
  return displayText(material.description, "这份资料的说明还没有整理好。", "资料说明");
}

export function displayMaterialCategory(material: MaterialPayload) {
  return displayText(material.category, "未分类", "分类");
}

export function displayMaterialOwner(material: MaterialPayload) {
  return displayText(material.ownerName, "匿名用户", "用户");
}

export function displayMaterialTags(material: MaterialPayload) {
  const tags = material.tags ?? [];
  return tags.length
    ? tags.map((tag, index) => displayText(tag, `标签 ${index + 1}`, "标签"))
    : ["待整理标签"];
}

export function displayNoteTitle(note: NotePayload) {
  return displayText(note.title, "未命名笔记", "笔记");
}

export function displayNoteSummary(note: NotePayload) {
  const summary = note.summary || stripHtml(note.content).slice(0, 90);
  return displayText(summary, "这条笔记还没有摘要。", "摘要");
}

export function displayPostTitle(post: PostSummary) {
  return displayText(post.title, "未命名分享", "分享");
}

export function displayPostBody(post: PostSummary) {
  return displayText(post.body, "这条分享还没有正文。", "内容");
}

export function displayAnnotationText(annotation: ReaderAnnotationPayload) {
  return displayText(annotation.quote || annotation.comment, "这条批注还没有内容。", "批注");
}

export function createNoteDraft(materialId = "") {
  return {
    title: "",
    summary: "",
    content: "",
    materialId,
    folderName: "收集箱",
    tags: [] as string[]
  };
}

export function buildCardInputsFromDrafts(drafts: CardDraftPayload[]) {
  return drafts.map((draft) => ({
    cardType: "basic",
    draftId: draft.draftId,
    front: draft.front,
    back: draft.back,
    sourceType: draft.sourceType,
    sourceId: draft.sourceId,
    sourceMetadata: draft.sourceMetadata
  }));
}

export function WorkspaceHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <PageHeader
      actions={props.actions}
      description={props.description}
      eyebrow={props.eyebrow}
      title={props.title}
    />
  );
}

export function MetricTile(props: { label: string; value: string; helper: string }) {
  return (
    <article className="metric-tile">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
      <p>{props.helper}</p>
    </article>
  );
}

export function SectionFrame(props: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
  slim?: boolean;
  className?: string;
}) {
  return (
    <section className={["section-frame", props.slim ? "slim" : "", props.className ?? ""].filter(Boolean).join(" ")}>
      <div className="section-frame-head">
        <div>
          <p className="eyebrow">{props.subtitle}</p>
          <h2>{props.title}</h2>
        </div>
        {props.action}
      </div>
      {props.children}
    </section>
  );
}

export function ContextPanel(props: { cards: ContextCard[] }) {
  return (
    <aside className="context-panel">
      {props.cards.map((card) => (
        <article className={`context-card ${card.tone ?? "default"}`} key={card.title}>
          <strong>{card.title}</strong>
          <p>{card.body}</p>
        </article>
      ))}
    </aside>
  );
}
