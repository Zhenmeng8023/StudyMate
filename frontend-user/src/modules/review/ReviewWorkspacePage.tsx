import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ChevronLeft, ChevronRight, Layers3, PanelRightClose, PanelRightOpen, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  AuthSession,
  CardPayload,
  DeckImportPayload,
  DeckPayload,
  ReviewQueueItemPayload,
  createDeck,
  createDeckCard,
  exportDeckCards,
  getTodayReviewQueue,
  importDeckCards,
  listDeckCards,
  listDecks,
  reviewCard,
  undoReviewCard,
  updateCardTags,
  updateCardStatus
} from "../../api/client";
import { ConfirmDialog, DataState, Select } from "../../design-system/primitives";
import { buildReviewSourceBacklink, formatReviewSourceReference } from "./reviewSourceBacklinks";

type ReviewWorkspacePageProps = {
  session: AuthSession;
};

type ReviewManagementTab = "decks" | "create" | "cards";
type ReviewWorkspaceState =
  | {
      kind: "loading" | "error" | "empty" | "stale";
      title: string;
      description: string;
    }
  | null;

type UndoableReviewState = {
  reviewId: string;
  item: ReviewQueueItemPayload;
  previousDueCount: number;
  previousCompletedCount: number;
};

type PendingDeckImportState = {
  content: string;
  deckId: string;
  filename: string;
  preview: DeckImportPayload;
};

type DeckImportResultState = {
  filename: string;
  result: DeckImportPayload;
};

type DeckImportPreviewDetail = {
  heading: string;
  items: Array<{
    label: string;
    message?: string;
  }>;
};

type ManagedCardStatusFilter = "all" | "active" | "suspended" | "buried";
type ManagedCardSourceFilter = "all" | "none" | string;
type ManagedCardDueFilter = "all" | "due" | "upcoming";

const ratingOptions = [
  { value: "again", label: "重来", shortcut: "1", accessibilityLabel: "Again 重来" },
  { value: "hard", label: "困难", shortcut: "2", accessibilityLabel: "Hard 困难" },
  { value: "good", label: "记得", shortcut: "3", accessibilityLabel: "Good 记得" },
  { value: "easy", label: "轻松", shortcut: "4", accessibilityLabel: "Easy 轻松" }
] as const;

async function readImportedTextFile(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("读取导入文件失败"));
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsText(file);
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatRelativeInterval(days: number) {
  if (days <= 0) return "短期复习";
  if (days === 1) return "1 天后";
  return `${days} 天后`;
}

function formatCardStatusLabel(status: string) {
  switch (status) {
    case "buried":
      return "已埋藏";
    case "suspended":
      return "已暂停";
    case "active":
    default:
      return "进行中";
  }
}

function formatCardSourceTypeLabel(sourceType?: string) {
  switch (sourceType) {
    case "graph":
      return "图谱";
    case "note":
      return "笔记";
    case "material":
      return "资料";
    case "reader":
      return "阅读";
    case "ai":
      return "AI";
    case "card":
      return "卡片";
    case "community":
      return "社区";
    case "none":
      return "未绑定来源";
    default:
      return sourceType || "未绑定来源";
  }
}

function formatScheduleStateLabel(state?: string) {
  switch (state) {
    case "learning":
      return "学习中";
    case "review":
      return "复习中";
    case "relearning":
      return "重新学习";
    case "new":
    default:
      return "新卡";
  }
}

function parseCardTags(value: string) {
  if (!value.trim()) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function mergeCardTags(existing: string[] | undefined, incoming: string[]) {
  return Array.from(new Set([...(existing ?? []), ...incoming]));
}

function removeCardTags(existing: string[] | undefined, removing: string[]) {
  if (!existing?.length) {
    return [];
  }
  const removingSet = new Set(removing);
  return existing.filter((tag) => !removingSet.has(tag));
}

function sameCardTags(left: string[] | undefined, right: string[]) {
  const normalizedLeft = left ?? [];
  if (normalizedLeft.length !== right.length) {
    return false;
  }
  return normalizedLeft.every((tag, index) => tag === right[index]);
}

function prioritizeRequestedQueueItem(items: ReviewQueueItemPayload[], cardId: string) {
  const index = items.findIndex((item) => item.card.id === cardId);
  if (index <= 0) {
    return index === 0 ? items : null;
  }

  const nextItems = items.slice();
  const [requested] = nextItems.splice(index, 1);
  nextItems.unshift(requested);
  return nextItems;
}

function cloneQueueItem(item: ReviewQueueItemPayload): ReviewQueueItemPayload {
  return {
    ...item,
    card: { ...item.card },
    schedule: { ...item.schedule }
  };
}

function downloadArtifact(artifact: { filename: string; mimeType: string; content: string }) {
  const blob = new Blob([artifact.content], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = artifact.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildDeckImportPreviewTitle(preview: DeckImportPayload) {
  if (preview.readyCount <= 0) {
    return "没有可导入的卡片";
  }
  return `确认导入 ${preview.readyCount} 张卡片？`;
}

function formatDeckImportIssueLabel(rowNumber: number, front?: string) {
  const normalizedFront = front?.trim();
  return `\u7b2c ${rowNumber} \u884c \u00b7 ${normalizedFront || "\u672a\u547d\u540d\u5361\u7247"}`;
}

function buildDeckImportPreviewDetails(preview: DeckImportPayload): DeckImportPreviewDetail[] {
  const details: DeckImportPreviewDetail[] = [];

  if (preview.duplicateSamples?.length) {
    details.push({
      heading: `\u91cd\u590d\u5361\u7247 ${preview.duplicateCount} \u6761`,
      items: preview.duplicateSamples.map((sample) => ({
        label: formatDeckImportIssueLabel(sample.rowNumber, sample.front),
        message: sample.message
      }))
    });
  }

  if (preview.failureSamples?.length) {
    details.push({
      heading: `\u5931\u8d25\u8bb0\u5f55 ${preview.failedCount} \u6761`,
      items: preview.failureSamples.map((sample) => ({
        label: formatDeckImportIssueLabel(sample.rowNumber, sample.front),
        message: sample.message
      }))
    });
  }

  return details;
}

function buildDeckImportPreviewDescription(preview: DeckImportPayload) {
  const details = buildDeckImportPreviewDetails(preview);

  return (
    <div className="review-import-preview">
      <p className="review-import-preview__summary">{preview.statusMessage}</p>
      {details.map((detail) => (
        <section className="review-import-preview__section" key={detail.heading}>
          <h3>{detail.heading}</h3>
          <ul className="review-import-preview__list">
            {detail.items.map((item) => (
              <li key={`${detail.heading}-${item.label}`}>
                <span className="review-import-preview__item-label">{item.label}</span>
                {item.message ? <span className="review-import-preview__item-message">{item.message}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function buildDeckImportResultLabel(importResult: DeckImportResultState) {
  return `${importResult.filename} · ${importResult.result.preview ? "预检结果" : "导入结果"}`;
}

function buildDeckImportResultSummary(result: DeckImportPayload) {
  const primaryLabel = result.preview ? "可导入" : "已导入";
  const primaryCount = result.preview ? result.readyCount : result.importedCount;
  return `总计 ${result.totalCount} 张 · ${primaryLabel} ${primaryCount} 张 · 重复 ${result.duplicateCount} 张 · 失败 ${result.failedCount} 行`;
}

function ReviewSourceSummary(props: { card: Pick<CardPayload, "sourceType" | "sourceId">; compact?: boolean }) {
  const sourceReference = formatReviewSourceReference(props.card);
  if (!sourceReference) {
    return null;
  }

  const backlink = buildReviewSourceBacklink(props.card);
  const compact = props.compact ?? false;

  return (
    <div className={compact ? "review-source-summary review-source-summary--compact" : "review-source-summary"}>
      <span>{`来源：${sourceReference}`}</span>
      {backlink ? (
        <Link className="review-source-link" to={backlink.target}>
          {backlink.actionLabel}
        </Link>
      ) : (
        <small className="review-source-hint">
          {compact ? "当前来源暂不支持直达" : "当前来源还缺少直达上下文，可先回到对应工作台继续定位。"}
        </small>
      )}
    </div>
  );
}

export function ReviewWorkspacePage(props: ReviewWorkspacePageProps) {
  const location = useLocation();
  const routeSearch = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedCardId = useMemo(() => routeSearch.get("card")?.trim() || "", [routeSearch]);
  const requestedSourceType = useMemo(() => routeSearch.get("sourceType")?.trim() || "", [routeSearch]);
  const requestedSourceId = useMemo(() => routeSearch.get("sourceId")?.trim() || "", [routeSearch]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [cards, setCards] = useState<CardPayload[]>([]);
  const [focusedManagedCardId, setFocusedManagedCardId] = useState("");
  const [queue, setQueue] = useState<ReviewQueueItemPayload[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [workspaceErrorMessage, setWorkspaceErrorMessage] = useState("");
  const [undoableReview, setUndoableReview] = useState<UndoableReviewState | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingDeckImportState | null>(null);
  const [latestImportResult, setLatestImportResult] = useState<DeckImportResultState | null>(null);
  const [importConfirmError, setImportConfirmError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState<"workspace" | "focus">("workspace");
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementTab, setManagementTab] = useState<ReviewManagementTab>("decks");
  const [cardSearchQuery, setCardSearchQuery] = useState("");
  const [cardStatusFilter, setCardStatusFilter] = useState<ManagedCardStatusFilter>("all");
  const [cardSourceFilter, setCardSourceFilter] = useState<ManagedCardSourceFilter>(requestedSourceType || "all");
  const [cardSourceIdFilter, setCardSourceIdFilter] = useState(requestedSourceId);
  const [cardDueFilter, setCardDueFilter] = useState<ManagedCardDueFilter>("all");
  const [cardTagFilter, setCardTagFilter] = useState("");
  const [batchAddTagsInput, setBatchAddTagsInput] = useState("");
  const [batchRemoveTagsInput, setBatchRemoveTagsInput] = useState("");
  const [selectedManagedCardIds, setSelectedManagedCardIds] = useState<string[]>([]);
  const [deckForm, setDeckForm] = useState({
    title: "",
    description: "",
    visibility: "private" as "private" | "public"
  });
  const [cardForm, setCardForm] = useState({
    front: "",
    back: "",
    cardType: "basic",
    tags: ""
  });

  const currentItem = queue[0] ?? null;
  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );
  const selectedManagedCardIdSet = useMemo(() => new Set(selectedManagedCardIds), [selectedManagedCardIds]);
  const managedSourceOptions = useMemo(
    () =>
      Array.from(new Set(cards.map((card) => card.sourceType).filter((value): value is string => Boolean(value))))
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ value, label: formatCardSourceTypeLabel(value) })),
    [cards]
  );
  const managedTagOptions = useMemo(
    () =>
      Array.from(
        new Set(
          cards
            .flatMap((card) => card.tags ?? [])
            .filter((value) => Boolean(value))
        )
      ).sort((left, right) => left.localeCompare(right)),
    [cards]
  );
  const visibleCards = cards;
  const selectedManagedCards = useMemo(
    () => cards.filter((card) => selectedManagedCardIdSet.has(card.id)),
    [cards, selectedManagedCardIdSet]
  );
  const selectedVisibleCount = useMemo(
    () => visibleCards.filter((card) => selectedManagedCardIdSet.has(card.id)).length,
    [selectedManagedCardIdSet, visibleCards]
  );
  const allVisibleSelected = visibleCards.length > 0 && selectedVisibleCount === visibleCards.length;
  const reviewedCount = completedCount;
  const queuePreview = useMemo(() => queue.slice(0, 3), [queue]);
  const canStartReview = Boolean(currentItem) && !loading;
  const latestReviewedCard = useMemo(() => {
    if (!undoableReview) {
      return null;
    }

    const reviewedCard = undoableReview.item.card;
    if (reviewedCard.sourceType?.trim() && reviewedCard.sourceId?.trim()) {
      return reviewedCard;
    }

    return cards.find((card) => card.id === reviewedCard.id) ?? reviewedCard;
  }, [cards, undoableReview]);
  const latestReviewBacklink = useMemo(
    () => buildReviewSourceBacklink(latestReviewedCard),
    [latestReviewedCard]
  );
  const latestReviewBacklinkLabel = useMemo(() => {
    if (!latestReviewBacklink) {
      return "";
    }

    const sourceType = latestReviewedCard?.sourceType?.trim().toLowerCase();
    return sourceType === "graph" ? "回到图谱查看反馈" : latestReviewBacklink.actionLabel;
  }, [latestReviewBacklink, latestReviewedCard]);
  const reviewState: ReviewWorkspaceState = useMemo(() => {
    if (loading && queue.length === 0) {
      return {
        kind: "loading",
        title: "准备复习队列",
        description: "正在加载今日到期卡片与卡组信息。"
      };
    }

    if (workspaceErrorMessage && queue.length > 0) {
      return {
        kind: "stale",
        title: "复习队列需要刷新",
        description: workspaceErrorMessage
      };
    }

    if (workspaceErrorMessage) {
      return {
        kind: "error",
        title: "复习工作台暂时不可用",
        description: workspaceErrorMessage
      };
    }

    if (!currentItem) {
      return {
        kind: "empty",
        title: "今天的队列已经清空",
        description: "今天没有需要处理的卡片。可以补充卡片，或从阅读、笔记和图谱继续生成草稿。"
      };
    }

    return null;
  }, [currentItem, loading, queue.length, workspaceErrorMessage]);
  const showCurrentCard = reviewMode === "focus" && currentItem && (!reviewState || reviewState.kind === "stale");

  useEffect(() => {
    void refreshAll();
    // The session is stable for the lifetime of a protected route.
    // Query parameters intentionally steer the current review focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedCardId, requestedSourceId, requestedSourceType]);

  useEffect(() => {
    setCardSourceFilter(requestedSourceType || "all");
    setCardSourceIdFilter(requestedSourceId);
  }, [requestedSourceId, requestedSourceType]);

  useEffect(() => {
    if (!selectedDeckId) {
      setCards([]);
      return;
    }
    void refreshCards(selectedDeckId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDueFilter, cardSearchQuery, cardSourceFilter, cardSourceIdFilter, cardStatusFilter, cardTagFilter, selectedDeckId]);

  useEffect(() => {
    setSelectedManagedCardIds((current) => current.filter((id) => cards.some((card) => card.id === id)));
  }, [cards]);

  useEffect(() => {
    setShownAt(Date.now());
    setShowAnswer(false);
  }, [currentItem?.card.id]);

  useEffect(() => {
    if (reviewMode !== "focus") {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        if (currentItem && !busy) {
          event.preventDefault();
          setShowAnswer((current) => !current);
        }
        return;
      }

      if (event.key.toLowerCase() === "s") {
        if (currentItem && !busy && queue.length > 1) {
          event.preventDefault();
          handleSkipCurrent();
        }
        return;
      }

      if (event.key.toLowerCase() === "p") {
        if (currentItem && !busy) {
          event.preventDefault();
          void handleSuspendCurrent();
        }
        return;
      }

      if (event.key.toLowerCase() === "b") {
        if (currentItem && !busy) {
          event.preventDefault();
          void handleBuryCurrent();
        }
        return;
      }

      if (!showAnswer || busy || !currentItem) return;
      const option = ratingOptions.find((candidate) => candidate.shortcut === event.key);
      if (option) {
        event.preventDefault();
        void handleRate(option.value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, currentItem, queue.length, reviewMode, showAnswer]);

  async function refreshAll() {
    setBusy(true);
    setLoading(true);
    setMessage("");
    setWorkspaceErrorMessage("");
    setUndoableReview(null);
    try {
      const [nextDecks, reviewQueue] = await Promise.all([
        listDecks(props.session),
        getTodayReviewQueue(props.session)
      ]);
      let nextQueue = reviewQueue.items;
      let nextSelectedDeckId = "";
      let nextDeckCards: CardPayload[] | null = null;
      let nextManagementTab: ReviewManagementTab = "decks";
      let nextManagementOpen = false;
      let nextMessage = "";
      let nextFocusedCardId = "";
      let nextReviewMode: "workspace" | "focus" = "workspace";

      if (requestedCardId) {
        const prioritizedQueue = prioritizeRequestedQueueItem(reviewQueue.items, requestedCardId);
        if (prioritizedQueue) {
          nextQueue = prioritizedQueue;
          nextSelectedDeckId = prioritizedQueue[0]?.card.deckId || "";
          nextManagementTab = "cards";
          nextManagementOpen = true;
          nextMessage = "已定位来源卡片，可直接继续复习。";
          nextFocusedCardId = requestedCardId;
          nextReviewMode = "focus";
        } else {
          for (const deck of nextDecks) {
            const deckCards = await listDeckCards(props.session, deck.id);
            if (deckCards.some((card) => card.id === requestedCardId)) {
              nextSelectedDeckId = deck.id;
              nextDeckCards = deckCards;
              nextManagementTab = "cards";
              nextManagementOpen = true;
              nextMessage = "已定位来源卡片，可先回看卡片内容，再继续复习。";
              nextFocusedCardId = requestedCardId;
              break;
            }
          }

          if (!nextFocusedCardId) {
            nextMessage = "没有找到请求的来源卡片，已回到今日复习队列。";
          }
        }
      } else if (requestedSourceType && requestedSourceId) {
        for (const deck of nextDecks) {
          const deckCards = await listDeckCards(props.session, deck.id, {
            sourceType: requestedSourceType,
            sourceId: requestedSourceId
          });
          if (deckCards.length > 0) {
            nextSelectedDeckId = deck.id;
            nextDeckCards = deckCards;
            nextManagementTab = "cards";
            nextManagementOpen = true;
            nextMessage = "已按图谱来源定位到复习卡片，可直接回补薄弱项。";
            nextFocusedCardId = deckCards[0]?.id || "";
            break;
          }
        }

        if (!nextSelectedDeckId) {
          nextMessage = "没有找到该来源下对应的卡片，已回到今日复习队列。";
        }
      }

      setDecks(nextDecks);
      setDueCount(reviewQueue.dueCount);
      setCompletedCount(0);
      setQueue(nextQueue);
      setFocusedManagedCardId(nextFocusedCardId);
      setManagementTab(nextManagementTab);
      if (nextDeckCards) {
        setCards(nextDeckCards);
      }
      setManagementOpen(nextReviewMode === "focus" ? nextManagementOpen : false);
      setReviewMode((current) => {
        if (nextReviewMode === "focus") {
          return "focus";
        }
        if (!nextQueue.length) {
          return "workspace";
        }
        return current;
      });
      if (nextMessage) {
        setMessage(nextMessage);
      }
      setSelectedDeckId((current) => nextSelectedDeckId || current || nextDecks[0]?.id || "");
    } catch (error) {
      setWorkspaceErrorMessage(error instanceof Error ? error.message : "加载复习工作台失败");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }

  async function refreshCards(deckId: string) {
    try {
      setCards(
        await listDeckCards(props.session, deckId, {
          query: cardSearchQuery,
          status: cardStatusFilter,
          sourceType: cardSourceFilter,
          sourceId: cardSourceIdFilter,
          dueBucket: cardDueFilter,
          tag: cardTagFilter
        })
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取卡片失败");
    }
  }

  async function handleCreateDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const created = await createDeck(props.session, deckForm);
      setDecks((current) => [created, ...current]);
      setSelectedDeckId(created.id);
      setDeckForm({ title: "", description: "", visibility: "private" });
      setManagementTab("cards");
      setManagementOpen(true);
      setMessage("卡组已创建。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建卡组失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDeckId) {
      setMessage("请先选择一个卡组。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await createDeckCard(props.session, selectedDeckId, {
        cardType: cardForm.cardType,
        front: cardForm.front,
        back: cardForm.back,
        tags: parseCardTags(cardForm.tags)
      });
      await Promise.all([refreshCards(selectedDeckId), refreshAll()]);
      setCardForm({ front: "", back: "", cardType: "basic", tags: "" });
      setShowAnswer(false);
      setMessage("卡片已加入复习队列。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建卡片失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(rating: (typeof ratingOptions)[number]["value"]) {
    if (!currentItem) return;

    setBusy(true);
    setMessage("");
    try {
      const reviewedItem = cloneQueueItem(currentItem);
      const result = await reviewCard(props.session, currentItem.card.id, {
        rating,
        elapsedMs: Date.now() - shownAt
      });
      setUndoableReview({
        reviewId: result.reviewId,
        item: reviewedItem,
        previousDueCount: dueCount,
        previousCompletedCount: completedCount
      });
      setQueue((items) => items.slice(1));
      if (queue.length <= 1) {
        setReviewMode("workspace");
      }
      setDueCount((count) => Math.max(0, count - 1));
      setCompletedCount((count) => count + 1);
      setMessage(`已记录复习，下次 ${formatDateTime(result.schedule.dueAt)}。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交复习结果失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleUndoLastReview() {
    if (!undoableReview) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const result = await undoReviewCard(props.session, undoableReview.item.card.id, {
        reviewId: undoableReview.reviewId,
        previousSchedule: undoableReview.item.schedule
      });
      const restoredItem = {
        ...cloneQueueItem(undoableReview.item),
        schedule: result.schedule
      };
      setQueue((items) => [restoredItem, ...items.filter((item) => item.card.id !== restoredItem.card.id)]);
      setReviewMode("focus");
      setDueCount(undoableReview.previousDueCount);
      setCompletedCount(undoableReview.previousCompletedCount);
      setUndoableReview(null);
      setMessage("已撤销上一条评分，卡片已回到今日队列。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "撤销上一条评分失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleSuspendCurrent() {
    if (!currentItem) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await updateCardStatus(props.session, currentItem.card.id, { status: "suspended" });
      setFocusedManagedCardId(currentItem.card.id);
      setQueue((items) => items.filter((item) => item.card.id !== currentItem.card.id));
      if (queue.length <= 1) {
        setReviewMode("workspace");
      }
      setCards((items) =>
        items.map((card) => (card.id === currentItem.card.id ? { ...card, status: "suspended" } : card))
      );
      setDueCount((count) => Math.max(0, count - 1));
      setMessage("已暂停当前卡片，可在管理面板恢复。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂停卡片失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleBuryCurrent() {
    if (!currentItem) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await updateCardStatus(props.session, currentItem.card.id, { status: "buried" });
      setFocusedManagedCardId(currentItem.card.id);
      setQueue((items) => items.filter((item) => item.card.id !== currentItem.card.id));
      if (queue.length <= 1) {
        setReviewMode("workspace");
      }
      setCards((items) =>
        items.map((card) => (card.id === currentItem.card.id ? { ...card, status: "buried" } : card))
      );
      setDueCount((count) => Math.max(0, count - 1));
      setMessage("已埋藏当前卡片，今天不会再出现。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "埋藏卡片失败");
    } finally {
      setBusy(false);
    }
  }

  function handleSkipCurrent() {
    if (!currentItem || queue.length <= 1) {
      return;
    }

    setMessage("已跳过当前卡片，稍后会回到这张卡。");
    setQueue((items) => {
      if (items.length <= 1) {
        return items;
      }
      return [...items.slice(1), items[0]];
    });
  }

  async function handleManagedCardStatus(card: CardPayload, nextStatus: "active" | "suspended" | "buried") {

    setBusy(true);
    setMessage("");
    try {
      await updateCardStatus(props.session, card.id, { status: nextStatus });
      setFocusedManagedCardId(card.id);
      if (nextStatus === "active") {
        await Promise.all([refreshCards(card.deckId), refreshAll()]);
        setMessage("已恢复卡片，今日队列已同步更新。");
        return;
      }

      setCards((items) => items.map((item) => (item.id === card.id ? { ...item, status: nextStatus } : item)));
      setQueue((items) => items.filter((item) => item.card.id !== card.id));
      if (queue.length <= 1 && queue.some((item) => item.card.id === card.id)) {
        setReviewMode("workspace");
      }
      setDueCount((count) => Math.max(0, count - 1));
      setMessage(nextStatus === "buried" ? "已埋藏卡片，今日队列已同步移除。" : "已暂停卡片，今日队列已同步移除。");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : nextStatus === "active"
            ? "恢复卡片失败"
            : nextStatus === "buried"
              ? "埋藏卡片失败"
              : "暂停卡片失败"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleImportCards(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!selectedDeckId) {
      setMessage("请先选择一个卡组。");
      return;
    }

    setBusy(true);
    setMessage("");
    setImportConfirmError("");
    setPendingImport(null);
    try {
      const content = await readImportedTextFile(file);
      const result = await importDeckCards(props.session, selectedDeckId, {
        filename: file.name,
        content,
        previewOnly: true
      });
      setLatestImportResult({
        filename: file.name,
        result
      });
      if (result.readyCount <= 0) {
        setMessage(result.statusMessage);
        return;
      }
      setPendingImport({
        deckId: selectedDeckId,
        filename: file.name,
        content,
        preview: result
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入卡片失败");
    } finally {
      setBusy(false);
    }
  }

  function handleCancelImportPreview() {
    if (busy) {
      return;
    }
    setImportConfirmError("");
    setPendingImport(null);
  }

  async function handleConfirmImportPreview() {
    if (!pendingImport) {
      return;
    }

    setBusy(true);
    setImportConfirmError("");
    try {
      const result = await importDeckCards(props.session, pendingImport.deckId, {
        filename: pendingImport.filename,
        content: pendingImport.content,
        previewOnly: false
      });
      setLatestImportResult({
        filename: pendingImport.filename,
        result
      });
      await Promise.all([refreshCards(pendingImport.deckId), refreshAll()]);
      setPendingImport(null);
      setMessage(result.statusMessage);
    } catch (error) {
      setImportConfirmError(error instanceof Error ? error.message : "导入卡片失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportCards(format: "json" | "csv") {
    if (!selectedDeckId) {
      setMessage("请先选择一个卡组。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const artifact = await exportDeckCards(props.session, selectedDeckId, format);
      if (artifact.cardCount === 0) {
        setMessage("当前卡组还没有卡片可导出。");
        return;
      }

      downloadArtifact(artifact);
      setMessage(`已导出 ${artifact.cardCount} 张卡片到 ${format.toUpperCase()}。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出卡片失败");
    } finally {
      setBusy(false);
    }
  }

  function toggleManagedCardSelection(cardId: string) {
    setSelectedManagedCardIds((current) =>
      current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]
    );
  }

  function toggleAllVisibleManagedCards() {
    const visibleIds = visibleCards.map((card) => card.id);
    if (!visibleIds.length) {
      return;
    }

    setSelectedManagedCardIds((current) => {
      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleBatchManagedCardStatus(nextStatus: "active" | "suspended" | "buried") {
    if (!selectedManagedCards.length) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await Promise.all(
        selectedManagedCards.map((card) => updateCardStatus(props.session, card.id, { status: nextStatus }))
      );

      const selectedIds = new Set(selectedManagedCards.map((card) => card.id));
      const removedFromQueueCount = queue.filter((item) => selectedIds.has(item.card.id)).length;
      setFocusedManagedCardId(selectedManagedCards[0]?.id ?? "");

      if (nextStatus === "active") {
        setSelectedManagedCardIds([]);
        await Promise.all([refreshCards(selectedDeckId), refreshAll()]);
        setMessage(`已批量恢复 ${selectedManagedCards.length} 张卡片，今日队列已同步更新。`);
        return;
      }

      setCards((items) =>
        items.map((card) => (selectedIds.has(card.id) ? { ...card, status: nextStatus } : card))
      );
      setQueue((items) => items.filter((item) => !selectedIds.has(item.card.id)));
      setDueCount((count) => Math.max(0, count - removedFromQueueCount));
      setSelectedManagedCardIds([]);
      setMessage(
        nextStatus === "buried"
          ? `已批量埋藏 ${selectedManagedCards.length} 张卡片，今日队列已同步移除。`
          : `已批量暂停 ${selectedManagedCards.length} 张卡片，今日队列已同步移除。`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : nextStatus === "active"
            ? "批量恢复卡片失败"
            : nextStatus === "buried"
              ? "批量埋藏卡片失败"
              : "批量暂停卡片失败"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleBatchAddManagedCardTags() {
    if (!selectedManagedCards.length) {
      return;
    }

    const tagsToAdd = parseCardTags(batchAddTagsInput);
    if (!tagsToAdd.length) {
      setMessage("请至少输入一个要添加的标签。");
      return;
    }

    const updates = selectedManagedCards
      .map((card) => ({
        card,
        tags: mergeCardTags(card.tags, tagsToAdd)
      }))
      .filter(({ card, tags }) => !sameCardTags(card.tags, tags));
    if (!updates.length) {
      setMessage("选中的卡片已经包含这些标签。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await Promise.all(
        updates.map(({ card, tags }) => updateCardTags(props.session, card.id, { tags }))
      );

      const updatedTagsById = new Map(updates.map(({ card, tags }) => [card.id, tags]));
      setCards((items) =>
        items.map((card) =>
          updatedTagsById.has(card.id)
            ? { ...card, tags: updatedTagsById.get(card.id) }
            : card
        )
      );
      setFocusedManagedCardId(updates[0]?.card.id ?? "");
      setSelectedManagedCardIds([]);
      setBatchAddTagsInput("");
      setMessage(`已为 ${updates.length} 张卡片添加标签。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "批量添加标签失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleBatchRemoveManagedCardTags() {
    if (!selectedManagedCards.length) {
      return;
    }

    const tagsToRemove = parseCardTags(batchRemoveTagsInput);
    if (!tagsToRemove.length) {
      setMessage("请至少输入一个要移除的标签。");
      return;
    }

    const updates = selectedManagedCards
      .map((card) => ({
        card,
        tags: removeCardTags(card.tags, tagsToRemove)
      }))
      .filter(({ card, tags }) => !sameCardTags(card.tags, tags));
    if (!updates.length) {
      setMessage("选中的卡片里没有这些标签。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await Promise.all(
        updates.map(({ card, tags }) => updateCardTags(props.session, card.id, { tags }))
      );

      const updatedTagsById = new Map(updates.map(({ card, tags }) => [card.id, tags]));
      setCards((items) =>
        items.map((card) =>
          updatedTagsById.has(card.id)
            ? { ...card, tags: updatedTagsById.get(card.id) }
            : card
        )
      );
      setFocusedManagedCardId(updates[0]?.card.id ?? "");
      setSelectedManagedCardIds([]);
      setBatchRemoveTagsInput("");
      setMessage(`已从 ${updates.length} 张卡片移除标签。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "批量移除标签失败");
    } finally {
      setBusy(false);
    }
  }

  function openManagement(tab: ReviewManagementTab) {
    setManagementTab(tab);
    if (reviewMode === "focus") {
      setManagementOpen(true);
    }
  }

  function enterReviewFocus() {
    if (!currentItem) {
      setManagementTab("create");
      return;
    }
    setReviewMode("focus");
    setManagementOpen(false);
    setShowAnswer(false);
  }

  function returnToWorkspace() {
    setReviewMode("workspace");
    setManagementOpen(false);
    setShowAnswer(false);
  }

  const managementPanel = (
    <>
      <header className="review-management-heading">
        <div>
          <p className="eyebrow">复习管理</p>
          <h2>{managementTab === "decks" ? "卡组" : managementTab === "create" ? "新建卡组" : "卡片"}</h2>
          <span>
            {reviewMode === "focus"
              ? "管理入口保持可用，但不挤占当前复习画面。"
              : "这里集中放置 Anki 风格的牌组、卡片浏览、批量处理、标签和导入导出操作。"}
          </span>
        </div>
        {reviewMode === "focus" ? (
          <button aria-label="关闭卡组管理" className="icon-button" onClick={() => setManagementOpen(false)} type="button">
            <PanelRightClose size={16} />
          </button>
        ) : null}
      </header>

      <nav className="review-management-tabs" aria-label="复习管理分类">
        <button aria-current={managementTab === "decks" ? "page" : undefined} className={managementTab === "decks" ? "active" : ""} onClick={() => setManagementTab("decks")} type="button">卡组</button>
        <button aria-current={managementTab === "create" ? "page" : undefined} className={managementTab === "create" ? "active" : ""} onClick={() => setManagementTab("create")} type="button">新建</button>
        <button aria-current={managementTab === "cards" ? "page" : undefined} className={managementTab === "cards" ? "active" : ""} onClick={() => setManagementTab("cards")} type="button">卡片</button>
      </nav>

      <div className="review-management-body">
        {managementTab === "decks" ? (
          <div className="review-management-stack">
            {decks.length ? (
              decks.map((deck) => (
                <button
                  aria-current={deck.id === selectedDeckId ? "page" : undefined}
                  className={deck.id === selectedDeckId ? "review-deck-row active" : "review-deck-row"}
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setManagementTab("cards");
                  }}
                  type="button"
                >
                  <strong>{deck.title}</strong>
                  <span>{deck.cardCount} 张卡片 · {deck.visibility === "public" ? "公开" : "仅自己"}</span>
                </button>
              ))
            ) : (
              <DataState
                action={<button className="primary-button" onClick={() => setManagementTab("create")} type="button">新建第一个卡组</button>}
                description="卡组是复习内容的容器。阅读、笔记和图谱草稿都会写入这里。"
                kind="empty"
                title="还没有卡组"
              />
            )}
          </div>
        ) : managementTab === "create" ? (
          <form className="review-management-form" onSubmit={handleCreateDeck}>
            <label>
              <span>标题</span>
              <input aria-label="卡组标题" onChange={(event) => setDeckForm((current) => ({ ...current, title: event.target.value }))} placeholder="例如：算法基础" value={deckForm.title} />
            </label>
            <label>
              <span>说明</span>
              <textarea aria-label="卡组说明" onChange={(event) => setDeckForm((current) => ({ ...current, description: event.target.value }))} placeholder="给这组卡片留一点上下文" rows={3} value={deckForm.description} />
            </label>
            <label>
              <span>可见性</span>
              <Select aria-label="卡组可见性" onChange={(event) => setDeckForm((current) => ({ ...current, visibility: event.target.value as "private" | "public" }))} value={deckForm.visibility}>
                <option value="private">仅自己可见</option>
                <option value="public">公开</option>
              </Select>
            </label>
            <button className="primary-button" disabled={busy || !deckForm.title.trim()} type="submit"><Layers3 size={16} /> 创建卡组</button>
          </form>
        ) : (
          <div className="review-management-stack">
            <section className="review-management-deck-summary">
              <strong>{selectedDeck?.title ?? "选择一个卡组"}</strong>
              <span>{selectedDeck ? `${selectedDeck.cardCount} 张卡片` : "从卡组页选择后可查看和添加卡片。"}</span>
            </section>
            {selectedDeckId ? (
              <section className="review-card-browser">
                <div className="review-card-browser__filters">
                  <label className="review-card-browser__field">
                    <span>筛选卡片关键词</span>
                    <input
                      aria-label="筛选卡片关键词"
                      onChange={(event) => setCardSearchQuery(event.target.value)}
                      placeholder="搜索问题、答案或来源"
                      value={cardSearchQuery}
                    />
                  </label>
                  <label className="review-card-browser__field">
                    <span>卡片状态筛选</span>
                    <Select
                      aria-label="卡片状态筛选"
                      onChange={(event) => setCardStatusFilter(event.target.value as ManagedCardStatusFilter)}
                      value={cardStatusFilter}
                    >
                      <option value="all">全部状态</option>
                      <option value="active">进行中</option>
                      <option value="suspended">已暂停</option>
                      <option value="buried">已埋藏</option>
                    </Select>
                  </label>
                  <label className="review-card-browser__field">
                    <span>卡片来源类型筛选</span>
                    <Select
                      aria-label="卡片来源类型筛选"
                      onChange={(event) => setCardSourceFilter(event.target.value)}
                      value={cardSourceFilter}
                    >
                      <option value="all">全部来源</option>
                      <option value="none">未绑定来源</option>
                      {managedSourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="review-card-browser__field">
                    <span>卡片来源 ID</span>
                    <input
                      aria-label="卡片来源 ID"
                      onChange={(event) => setCardSourceIdFilter(event.target.value)}
                      placeholder="例如：node-1"
                      value={cardSourceIdFilter}
                    />
                  </label>
                  <label className="review-card-browser__field">
                    <span>到期时间筛选</span>
                    <Select
                      aria-label="到期时间筛选"
                      onChange={(event) => setCardDueFilter(event.target.value as ManagedCardDueFilter)}
                      value={cardDueFilter}
                    >
                      <option value="all">全部到期时间</option>
                      <option value="due">已到期</option>
                      <option value="upcoming">即将到期</option>
                    </Select>
                  </label>
                  <label className="review-card-browser__field">
                    <span>卡片标签筛选</span>
                    <Select
                      aria-label="卡片标签筛选"
                      onChange={(event) => setCardTagFilter(event.target.value)}
                      value={cardTagFilter}
                    >
                      <option value="">全部标签</option>
                      {managedTagOptions.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>
                <div className="review-card-browser__summary">
                  <strong>{`${visibleCards.length} 张卡片`}</strong>
                  <span>{selectedVisibleCount ? `当前结果已选中 ${selectedVisibleCount} 张` : "先筛选再批量处理状态。"}</span>
                </div>
                <div className="review-card-browser__batch-actions">
                  <label className="review-card-browser__toggle-all">
                    <input
                      checked={allVisibleSelected}
                      disabled={!visibleCards.length}
                      onChange={toggleAllVisibleManagedCards}
                      type="checkbox"
                    />
                    <span>{allVisibleSelected ? "取消全选当前结果" : "全选当前结果"}</span>
                  </label>
                  <div className="review-card-browser__batch-buttons">
                    <button
                      className="secondary-button"
                      disabled={busy || !selectedManagedCards.some((card) => card.status === "active")}
                      onClick={() => void handleBatchManagedCardStatus("suspended")}
                      type="button"
                    >
                      批量暂停选中卡片
                    </button>
                    <button
                      className="secondary-button"
                      disabled={busy || !selectedManagedCards.some((card) => card.status === "active")}
                      onClick={() => void handleBatchManagedCardStatus("buried")}
                      type="button"
                    >
                      批量埋藏选中卡片
                    </button>
                    <button
                      className="secondary-button"
                      disabled={busy || !selectedManagedCards.some((card) => card.status !== "active")}
                      onClick={() => void handleBatchManagedCardStatus("active")}
                      type="button"
                    >
                      批量恢复选中卡片
                    </button>
                  </div>
                </div>
                <div className="review-card-browser__tag-actions">
                  <label className="review-card-browser__field">
                    <span>批量添加标签</span>
                    <input
                      aria-label="批量添加标签"
                      disabled={busy || !selectedManagedCards.length}
                      onChange={(event) => setBatchAddTagsInput(event.target.value)}
                      placeholder="例如：core, exam"
                      value={batchAddTagsInput}
                    />
                  </label>
                  <button
                    className="secondary-button"
                    disabled={busy || !selectedManagedCards.length || !batchAddTagsInput.trim()}
                    onClick={() => void handleBatchAddManagedCardTags()}
                    type="button"
                  >
                    为选中卡片添加标签
                  </button>
                  <label className="review-card-browser__field">
                    <span>批量移除标签</span>
                    <input
                      aria-label="批量移除标签"
                      disabled={busy || !selectedManagedCards.length}
                      onChange={(event) => setBatchRemoveTagsInput(event.target.value)}
                      placeholder="例如：graph"
                      value={batchRemoveTagsInput}
                    />
                  </label>
                  <button
                    className="secondary-button"
                    disabled={busy || !selectedManagedCards.length || !batchRemoveTagsInput.trim()}
                    onClick={() => void handleBatchRemoveManagedCardTags()}
                    type="button"
                  >
                    从选中卡片移除标签
                  </button>
                </div>
                <div className="review-card-browser__import-export">
                  <button className="secondary-button" disabled={busy || !selectedDeckId} onClick={() => void handleExportCards("json")} type="button">
                    导出 JSON
                  </button>
                  <button className="secondary-button" disabled={busy || !selectedDeckId} onClick={() => void handleExportCards("csv")} type="button">
                    导出 CSV
                  </button>
                  <label className="review-card-browser__file-field">
                    <span>导入卡片文件</span>
                    <input
                      accept=".json,.csv,application/json,text/csv"
                      aria-label="导入卡片文件"
                      disabled={busy || !selectedDeckId}
                      onChange={(event) => void handleImportCards(event)}
                      type="file"
                    />
                  </label>
                </div>
                {latestImportResult ? (
                  <section className="review-import-result-card">
                    <div className="review-import-result-card__header">
                      <h3>最近一次导入结果</h3>
                      <span>{buildDeckImportResultLabel(latestImportResult)}</span>
                    </div>
                    <p className="review-import-result-card__summary">
                      {buildDeckImportResultSummary(latestImportResult.result)}
                    </p>
                    {!pendingImport && buildDeckImportPreviewDetails(latestImportResult.result).length ? (
                      <div className="review-import-preview">
                        {buildDeckImportPreviewDetails(latestImportResult.result).map((detail) => (
                          <section className="review-import-preview__section" key={`${latestImportResult.filename}-${detail.heading}`}>
                            <h3>{detail.heading}</h3>
                            <ul className="review-import-preview__list">
                              {detail.items.map((item) => (
                                <li key={`${detail.heading}-${item.label}`}>
                                  <span className="review-import-preview__item-label">{item.label}</span>
                                  {item.message ? <span className="review-import-preview__item-message">{item.message}</span> : null}
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </section>
            ) : null}
            {selectedDeckId ? (
              <form className="review-management-form review-management-form--compact" onSubmit={handleCreateCard}>
                <label>
                  <span>问题</span>
                  <textarea aria-label="卡片问题" onChange={(event) => setCardForm((current) => ({ ...current, front: event.target.value }))} placeholder="写在卡片正面的提示或问题" rows={3} value={cardForm.front} />
                </label>
                <label>
                  <span>答案</span>
                  <textarea aria-label="卡片答案" onChange={(event) => setCardForm((current) => ({ ...current, back: event.target.value }))} placeholder="写在卡片反面的答案" rows={4} value={cardForm.back} />
                </label>
                <label>
                  <span>卡片标签</span>
                  <input
                    aria-label="卡片标签"
                    onChange={(event) => setCardForm((current) => ({ ...current, tags: event.target.value }))}
                    placeholder="例如：graph, core"
                    value={cardForm.tags}
                  />
                </label>
                <button className="secondary-button" disabled={busy || !cardForm.front.trim() || !cardForm.back.trim()} type="submit"><Plus size={16} /> 添加卡片</button>
              </form>
            ) : null}
            {selectedDeckId && cards.length ? (
              visibleCards.length ? (
                <div className="review-card-list">
                  {visibleCards.map((card) => (
                    <article className={card.id === focusedManagedCardId ? "review-managed-card active" : "review-managed-card"} key={card.id}>
                      <div className="review-managed-card__head">
                        <label className="review-managed-card__selection">
                          <input
                            aria-label={`选择卡片 ${card.front}`}
                            checked={selectedManagedCardIdSet.has(card.id)}
                            onChange={() => toggleManagedCardSelection(card.id)}
                            type="checkbox"
                          />
                          <span>选中</span>
                        </label>
                        <div className="review-managed-card__title">
                          <strong>{card.front}</strong>
                          <small>{formatCardStatusLabel(card.status)}</small>
                        </div>
                      </div>
                      <p>{card.back}</p>
                      {card.tags?.length ? (
                        <div className="review-managed-card__tags">
                          {(card.tags ?? []).map((tag) => (
                            <span className="review-managed-card__tag" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <ReviewSourceSummary card={card} compact />
                      <span className="review-managed-card__source-type">{formatCardSourceTypeLabel(card.sourceType || "none")}</span>
                      {card.schedule ? (
                        <small className="review-managed-card__schedule">
                          {`${formatScheduleStateLabel(card.schedule.state)} · 计划到期 ${formatDateTime(card.schedule.dueAt)}`}
                        </small>
                      ) : null}
                      <div className="review-managed-card__actions">
                        {card.status === "active" ? (
                          <>
                            <button className="secondary-button" disabled={busy} onClick={() => void handleManagedCardStatus(card, "suspended")} type="button">
                              暂停卡片
                            </button>
                            <button className="secondary-button" disabled={busy} onClick={() => void handleManagedCardStatus(card, "buried")} type="button">
                              埋藏卡片
                            </button>
                          </>
                        ) : (
                          <button className="secondary-button" disabled={busy} onClick={() => void handleManagedCardStatus(card, "active")} type="button">
                            恢复卡片
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <DataState description="换个关键词、状态或来源筛选后再看。" kind="empty" title="当前筛选条件下没有卡片" />
              )
            ) : selectedDeckId ? (
              <DataState description="为这个卡组添加第一张卡片，或从阅读和笔记的草稿中写入。" kind="empty" title="这个卡组还没有卡片" />
            ) : null}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <section
        className={
          reviewMode === "workspace"
            ? "review-focus review-focus--workspace"
            : managementOpen
              ? "review-focus review-focus--management-open"
              : "review-focus"
        }
      >
        <header className="review-focus-commandbar">
          <div className="review-focus-commandbar__leading">
            <span className="review-focus-commandbar__eyebrow">{reviewMode === "focus" ? "专注复习" : "复习工作台"}</span>
            <div>
              <strong>{reviewMode === "focus" ? (currentItem ? currentItem.deckTitle : "今日队列") : "先整理卡片，再开始记忆"}</strong>
              <span>{loading ? "正在同步复习队列" : `${queue.length} 张仍待完成`}</span>
            </div>
          </div>
          <div className="review-focus-commandbar__stats" aria-label="复习进度">
            <span><strong>{dueCount}</strong> 到期</span>
            <span><strong>{reviewedCount}</strong> 已完成</span>
            <button className="secondary-button" disabled={busy} onClick={() => void refreshAll()} type="button">
              <RotateCcw size={16} /> 刷新
            </button>
            {reviewMode === "focus" ? (
              <>
                <button className="secondary-button" onClick={returnToWorkspace} type="button">
                  <ChevronLeft size={16} /> 返回工作台
                </button>
                <button
                  aria-expanded={managementOpen}
                  aria-label={managementOpen ? "关闭卡组管理" : "打开卡组管理"}
                  className="icon-button"
                  onClick={() => setManagementOpen((current) => !current)}
                  type="button"
                >
                  {managementOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
                </button>
              </>
            ) : null}
          </div>
        </header>

        {message || undoableReview ? (
          <div className="review-focus-message-row">
            {message ? <p className="review-focus-message" role="status">{message}</p> : <div />}
            {undoableReview ? (
              <div className="review-focus-message-actions">
                {latestReviewBacklink ? (
                  <Link className="secondary-button" to={latestReviewBacklink.target}>
                    {latestReviewBacklinkLabel}
                  </Link>
                ) : null}
                <button className="secondary-button" disabled={busy} onClick={() => void handleUndoLastReview()} type="button">
                  <RotateCcw size={16} />
                  撤销上一次评分
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="review-focus__body">
          <main className="review-focus-stage" aria-label="复习卡片">
            {reviewMode === "workspace" ? (
              <section className="review-workspace-stage">
                {reviewState?.kind === "error" ? (
                  <DataState description={reviewState.description} kind={reviewState.kind} title={reviewState.title} />
                ) : reviewState?.kind === "empty" ? (
                  <DataState
                    action={<button className="primary-button" onClick={() => setManagementTab("create")} type="button"><Plus size={16} /> 创建卡组</button>}
                    description={reviewState.description}
                    kind={reviewState.kind}
                    title={reviewState.title}
                  />
                ) : (
                  <>
                    {reviewState?.kind === "stale" ? (
                      <DataState description={reviewState.description} kind={reviewState.kind} title={reviewState.title} />
                    ) : null}
                    <section className="review-workspace-hero">
                      <div className="review-workspace-hero__copy">
                        <span className="review-workspace-chip">Anki 式工作台</span>
                        <h1>先查看牌组和卡片，再进入专注复习</h1>
                        <p>复习页不再默认直接进入答题舞台。你可以先浏览卡片、批量处理状态、调整标签或导入导出数据，再点击开始复习进入专注模式。</p>
                      </div>
                      <div className="review-workspace-launch">
                        <button className="primary-button" disabled={!canStartReview || busy} onClick={enterReviewFocus} type="button">
                          <Sparkles size={16} /> 开始复习
                        </button>
                        <button className="secondary-button" onClick={() => setManagementTab("cards")} type="button">
                          <ChevronRight size={16} /> 打开卡片浏览器
                        </button>
                        <button className="secondary-button" onClick={() => setManagementTab("create")} type="button">
                          <Plus size={16} /> 新建卡组或卡片
                        </button>
                      </div>
                      <div className="review-workspace-metrics">
                        <article className="review-workspace-metric">
                          <span>今日待复习</span>
                          <strong>{dueCount}</strong>
                          <small>{currentItem ? `下一张来自 ${currentItem.deckTitle}` : "可以先整理牌组或新增卡片。"}</small>
                        </article>
                        <article className="review-workspace-metric">
                          <span>已完成</span>
                          <strong>{reviewedCount}</strong>
                          <small>{reviewedCount ? "今日已经产生复习记录，可随时继续。" : "还没有开始今天的复习。"}</small>
                        </article>
                        <article className="review-workspace-metric">
                          <span>当前牌组</span>
                          <strong>{selectedDeck?.title ?? currentItem?.deckTitle ?? "今日队列"}</strong>
                          <small>{selectedDeck ? `${selectedDeck.cardCount} 张卡片` : "切换到卡片页即可直接管理。"}</small>
                        </article>
                      </div>
                    </section>
                    <section className="review-workspace-upnext" aria-label="即将复习">
                      <div className="review-workspace-upnext__head">
                        <strong>接下来适合做什么</strong>
                        <span>{queuePreview.length ? "先清理牌组和卡片，再一次性进入专注模式。" : "今天队列已经清空，但仍可继续补卡和整理。"} </span>
                      </div>
                      {queuePreview.length ? (
                        <ul className="review-workspace-upnext__list">
                          {queuePreview.map((item, index) => (
                            <li key={item.card.id}>
                              <span>{`#${index + 1}`}</span>
                              <strong>{item.deckTitle}</strong>
                              <small>{`${formatScheduleStateLabel(item.schedule.state)} · ${formatRelativeInterval(item.schedule.intervalDays)}`}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="review-workspace-upnext__empty">当前没有待复习卡片，但你依然可以在右侧继续管理牌组、卡片和导入数据。</p>
                      )}
                    </section>
                  </>
                )}
              </section>
            ) : (
              <>
                {reviewState && reviewState.kind !== "empty" ? (
                  <DataState description={reviewState.description} kind={reviewState.kind} title={reviewState.title} />
                ) : null}
                {showCurrentCard ? (
                  <section className="review-focus-card-shell">
                    <div className="review-focus-card-meta">
                      <span>{currentItem.deckTitle}</span>
                      <span>第 {reviewedCount + 1} 张 / 剩余 {queue.length} 张</span>
                    </div>
                    <article className={showAnswer ? "review-focus-card is-revealed" : "review-focus-card"}>
                      <span>{showAnswer ? "答案" : "问题"}</span>
                      <strong>{showAnswer ? currentItem.card.back : currentItem.card.front}</strong>
                      {!showAnswer ? <p>先回想答案，再翻面确认。按空格键或 Enter 翻面。</p> : null}
                    </article>
                    <div className="review-focus-schedule">
                      <span>当前状态：{currentItem.schedule.state}</span>
                      <span>预估下次：{formatRelativeInterval(currentItem.schedule.intervalDays)}</span>
                      <span>计划到期：{formatDateTime(currentItem.schedule.dueAt)}</span>
                    </div>
                    <ReviewSourceSummary card={currentItem.card} />
                    <div className="review-focus-actions">
                      <button className="secondary-button" disabled={busy} onClick={() => setShowAnswer((value) => !value)} type="button">
                        <Sparkles size={16} />
                        {showAnswer ? "收起答案" : "显示答案"}
                      </button>
                      <button className="secondary-button" disabled={busy || queue.length <= 1} onClick={handleSkipCurrent} type="button">
                        <ChevronRight size={16} />
                        跳过当前卡片
                      </button>
                      <button className="secondary-button" disabled={busy} onClick={() => void handleSuspendCurrent()} type="button">
                        <PanelRightClose size={16} />
                        暂停当前卡片
                      </button>
                      <button className="secondary-button" disabled={busy} onClick={() => void handleBuryCurrent()} type="button">
                        <BookOpenCheck size={16} />
                        埋藏当前卡片
                      </button>
                      <div className="review-focus-ratings" aria-label="记忆评分">
                        {ratingOptions.map((option) => (
                          <button
                            aria-label={option.accessibilityLabel}
                            className={`review-rating-button review-rating-button--${option.value}`}
                            disabled={busy || !showAnswer}
                            key={option.value}
                            onClick={() => void handleRate(option.value)}
                            type="button"
                          >
                            <span>{option.shortcut}</span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : reviewState?.kind === "empty" ? (
                  <DataState
                    action={<button className="primary-button" onClick={() => openManagement("create")} type="button"><Plus size={16} /> 创建卡组</button>}
                    description={reviewState.description}
                    kind={reviewState.kind}
                    title={reviewState.title}
                  />
                ) : null}
              </>
            )}
          </main>

          {reviewMode === "workspace" ? (
            <section className="review-workspace-panel" aria-label="复习管理">
              {managementPanel}
            </section>
          ) : managementOpen ? (
            <aside className="review-management-dock" aria-label="复习管理">
              {managementPanel}
            </aside>
          ) : null}
        </div>

        <footer className="review-focus-footer">
          <span>
            {reviewMode === "focus"
              ? "快捷键：空格 / Enter 翻面；S 跳过当前卡片；P 暂停当前卡片；B 埋藏当前卡片；答案显示后按 1–4 评分。"
              : "先管理牌组、标签和导入导出，再进入专注复习，这更接近 Anki 的工作流。"}
          </span>
          <button className="ghost-button" onClick={reviewMode === "focus" ? returnToWorkspace : () => setManagementTab("decks")} type="button">
            {reviewMode === "focus" ? <ChevronLeft size={15} /> : null}
            {reviewMode === "focus" ? "返回工作台" : "管理卡组"}
            <ChevronRight size={15} />
          </button>
        </footer>
      </section>
      <ConfirmDialog
        className="review-import-preview-dialog"
        confirmDisabled={busy}
        confirmLabel="确认导入"
        confirming={busy}
        confirmingLabel="正在导入..."
        description={pendingImport ? buildDeckImportPreviewDescription(pendingImport.preview) : undefined}
        errorMessage={importConfirmError || undefined}
        isOpen={Boolean(pendingImport)}
        onCancel={handleCancelImportPreview}
        onConfirm={() => void handleConfirmImportPreview()}
        title={pendingImport ? buildDeckImportPreviewTitle(pendingImport.preview) : "确认导入卡片？"}
      />
    </>
  );
}
