import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ChevronLeft, ChevronRight, Layers3, PanelRightClose, PanelRightOpen, Plus, RotateCcw, Sparkles } from "lucide-react";
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
  reviewCard
} from "../../api/client";
import { DataState } from "../../design-system/primitives";

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

export function ReviewWorkspacePage(props: ReviewWorkspacePageProps) {
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [cards, setCards] = useState<CardPayload[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (!showAnswer || busy || !currentItem) return;
      const option = ratingOptions.find((candidate) => candidate.shortcut === event.key);
      if (option) {
        event.preventDefault();
        void handleRate(option.value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, currentItem, showAnswer]);

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
      setDecks(nextDecks);
      setDueCount(reviewQueue.dueCount);
      setCompletedCount(0);
      setQueue(reviewQueue.items);
      setSelectedDeckId((current) => current || nextDecks[0]?.id || "");
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
              <div className="review-focus-actions">
                <button className="secondary-button" disabled={busy} onClick={() => setShowAnswer((value) => !value)} type="button">
                  <Sparkles size={16} />
                  {showAnswer ? "收起答案" : "显示答案"}
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
                  <select aria-label="卡组可见性" onChange={(event) => setDeckForm((current) => ({ ...current, visibility: event.target.value as "private" | "public" }))} value={deckForm.visibility}>
                    <option value="private">仅自己可见</option>
                    <option value="public">公开</option>
                  </select>
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
                      <article className="review-managed-card" key={card.id}>
                        <strong>{card.front}</strong>
                        <p>{card.back}</p>
                        {card.sourceType ? <small>来源：{card.sourceType}</small> : null}
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
        <span>快捷键：空格 / Enter 翻面；答案显示后按 1–4 评分。</span>
        <button className="ghost-button" onClick={() => openManagement("decks")} type="button">
          <ChevronLeft size={15} /> 管理卡组 <ChevronRight size={15} />
        </button>
      </footer>
    </section>
  );
}
