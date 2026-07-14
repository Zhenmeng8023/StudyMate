import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ChevronLeft, ChevronRight, Layers3, PanelRightClose, PanelRightOpen, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  AuthSession,
  CardPayload,
  DeckPayload,
  ReviewQueueItemPayload,
  createDeck,
  createDeckCard,
  getTodayReviewQueue,
  listDeckCards,
  listDecks,
  reviewCard,
  updateCardStatus
} from "../../api/client";
import { DataState, Select } from "../../design-system/primitives";
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

const ratingOptions = [
  { value: "again", label: "重来", shortcut: "1", accessibilityLabel: "Again 重来" },
  { value: "hard", label: "困难", shortcut: "2", accessibilityLabel: "Hard 困难" },
  { value: "good", label: "记得", shortcut: "3", accessibilityLabel: "Good 记得" },
  { value: "easy", label: "轻松", shortcut: "4", accessibilityLabel: "Easy 轻松" }
] as const;

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
    case "suspended":
      return "已暂停";
    case "active":
    default:
      return "进行中";
  }
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
  const requestedCardId = useMemo(() => new URLSearchParams(location.search).get("card")?.trim() || "", [location.search]);
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
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementTab, setManagementTab] = useState<ReviewManagementTab>("decks");
  const [deckForm, setDeckForm] = useState({
    title: "",
    description: "",
    visibility: "private" as "private" | "public"
  });
  const [cardForm, setCardForm] = useState({
    front: "",
    back: "",
    cardType: "basic"
  });

  const currentItem = queue[0] ?? null;
  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );
  const reviewedCount = completedCount;
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
  const showCurrentCard = currentItem && (!reviewState || reviewState.kind === "stale");

  useEffect(() => {
    void refreshAll();
    // The session is stable for the lifetime of a protected route.
    // Query parameters intentionally steer the current review focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedCardId]);

  useEffect(() => {
    if (!selectedDeckId) {
      setCards([]);
      return;
    }
    void refreshCards(selectedDeckId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeckId]);

  useEffect(() => {
    setShownAt(Date.now());
    setShowAnswer(false);
  }, [currentItem?.card.id]);

  useEffect(() => {
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

      if (!showAnswer || busy || !currentItem) return;
      const option = ratingOptions.find((candidate) => candidate.shortcut === event.key);
      if (option) {
        event.preventDefault();
        void handleRate(option.value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, currentItem, queue.length, showAnswer]);

  async function refreshAll() {
    setBusy(true);
    setLoading(true);
    setMessage("");
    setWorkspaceErrorMessage("");
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

      if (requestedCardId) {
        const prioritizedQueue = prioritizeRequestedQueueItem(reviewQueue.items, requestedCardId);
        if (prioritizedQueue) {
          nextQueue = prioritizedQueue;
          nextSelectedDeckId = prioritizedQueue[0]?.card.deckId || "";
          nextManagementTab = "cards";
          nextManagementOpen = true;
          nextMessage = "已定位来源卡片，可直接继续复习。";
          nextFocusedCardId = requestedCardId;
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
      }

      setDecks(nextDecks);
      setDueCount(reviewQueue.dueCount);
      setCompletedCount(0);
      setQueue(nextQueue);
      setFocusedManagedCardId(nextFocusedCardId);
      if (nextDeckCards) {
        setCards(nextDeckCards);
      }
      if (nextManagementOpen) {
        setManagementTab(nextManagementTab);
        setManagementOpen(true);
      }
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
      setCards(await listDeckCards(props.session, deckId));
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
      await createDeckCard(props.session, selectedDeckId, cardForm);
      await Promise.all([refreshCards(selectedDeckId), refreshAll()]);
      setCardForm({ front: "", back: "", cardType: "basic" });
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
      const result = await reviewCard(props.session, currentItem.card.id, {
        rating,
        elapsedMs: Date.now() - shownAt
      });
      setQueue((items) => items.slice(1));
      setDueCount((count) => Math.max(0, count - 1));
      setCompletedCount((count) => count + 1);
      setMessage(`已记录复习，下次 ${formatDateTime(result.schedule.dueAt)}。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交复习结果失败");
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

  async function handleManagedCardStatus(card: CardPayload) {
    const nextStatus = card.status === "suspended" ? "active" : "suspended";

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

      setCards((items) => items.map((item) => (item.id === card.id ? { ...item, status: "suspended" } : item)));
      setQueue((items) => items.filter((item) => item.card.id !== card.id));
      setDueCount((count) => Math.max(0, count - 1));
      setMessage("已暂停卡片，今日队列已同步移除。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : nextStatus === "active" ? "恢复卡片失败" : "暂停卡片失败");
    } finally {
      setBusy(false);
    }
  }

  function openManagement(tab: ReviewManagementTab) {
    setManagementTab(tab);
    setManagementOpen(true);
  }

  return (
    <section className={managementOpen ? "review-focus review-focus--management-open" : "review-focus"}>
      <header className="review-focus-commandbar">
        <div className="review-focus-commandbar__leading">
          <span className="review-focus-commandbar__eyebrow">今日复习</span>
          <div>
            <strong>{currentItem ? currentItem.deckTitle : "今日队列"}</strong>
            <span>{loading ? "正在同步复习队列" : `${queue.length} 张仍待完成`}</span>
          </div>
        </div>
        <div className="review-focus-commandbar__stats" aria-label="复习进度">
          <span><strong>{dueCount}</strong> 到期</span>
          <span><strong>{reviewedCount}</strong> 已完成</span>
          <button className="secondary-button" disabled={busy} onClick={() => void refreshAll()} type="button">
            <RotateCcw size={16} /> 刷新
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
        </div>
      </header>

      {message ? <p className="review-focus-message" role="status">{message}</p> : null}

      <div className="review-focus__body">
        <main className="review-focus-stage" aria-label="复习卡片">
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
        </main>

        <aside className="review-management-dock" aria-label="复习管理">
          <header className="review-management-heading">
            <div>
              <p className="eyebrow">复习管理</p>
              <h2>{managementTab === "decks" ? "卡组" : managementTab === "create" ? "新建卡组" : "卡片"}</h2>
              <span>管理入口保持可用，但不挤占当前复习画面。</span>
            </div>
            <button aria-label="关闭卡组管理" className="icon-button" onClick={() => setManagementOpen(false)} type="button"><PanelRightClose size={16} /></button>
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
                  <form className="review-management-form review-management-form--compact" onSubmit={handleCreateCard}>
                    <label>
                      <span>问题</span>
                      <textarea aria-label="卡片问题" onChange={(event) => setCardForm((current) => ({ ...current, front: event.target.value }))} placeholder="写在卡片正面的提示或问题" rows={3} value={cardForm.front} />
                    </label>
                    <label>
                      <span>答案</span>
                      <textarea aria-label="卡片答案" onChange={(event) => setCardForm((current) => ({ ...current, back: event.target.value }))} placeholder="写在卡片反面的答案" rows={4} value={cardForm.back} />
                    </label>
                    <button className="secondary-button" disabled={busy || !cardForm.front.trim() || !cardForm.back.trim()} type="submit"><Plus size={16} /> 添加卡片</button>
                  </form>
                ) : null}
                {selectedDeckId && cards.length ? (
                  <div className="review-card-list">
                    {cards.map((card) => (
                      <article className={card.id === focusedManagedCardId ? "review-managed-card active" : "review-managed-card"} key={card.id}>
                        <strong>{card.front}</strong>
                        <small>{formatCardStatusLabel(card.status)}</small>
                        <p>{card.back}</p>
                        <ReviewSourceSummary card={card} compact />
                        <div className="review-managed-card__actions">
                          <button className="secondary-button" disabled={busy} onClick={() => void handleManagedCardStatus(card)} type="button">
                            {card.status === "suspended" ? "恢复卡片" : "暂停卡片"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : selectedDeckId ? (
                  <DataState description="为这个卡组添加第一张卡片，或从阅读和笔记的草稿中写入。" kind="empty" title="这个卡组还没有卡片" />
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="review-focus-footer">
        <span>快捷键：空格 / Enter 翻面；S 跳过当前卡片；P 暂停当前卡片；答案显示后按 1–4 评分。</span>
        <button className="ghost-button" onClick={() => openManagement("decks")} type="button">
          <ChevronLeft size={15} /> 管理卡组 <ChevronRight size={15} />
        </button>
      </footer>
    </section>
  );
}
