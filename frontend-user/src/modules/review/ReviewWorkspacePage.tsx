import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Layers3, Plus, RotateCcw, Sparkles } from "lucide-react";
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

type ReviewWorkspacePageProps = {
  session: AuthSession;
};

const ratingOptions = [
  { value: "again", label: "Again" },
  { value: "hard", label: "Hard" },
  { value: "good", label: "Good" },
  { value: "easy", label: "Easy" }
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
  if (days <= 0) {
    return "短期复习";
  }
  if (days === 1) {
    return "1 天后";
  }

  return `${days} 天后`;
}

export function ReviewWorkspacePage(props: ReviewWorkspacePageProps) {
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [cards, setCards] = useState<CardPayload[]>([]);
  const [queue, setQueue] = useState<ReviewQueueItemPayload[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
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

  useEffect(() => {
    void refreshAll();
  }, []);

  useEffect(() => {
    if (!selectedDeckId) {
      setCards([]);
      return;
    }

    void refreshCards(selectedDeckId);
  }, [selectedDeckId]);

  useEffect(() => {
    setShownAt(Date.now());
    setShowAnswer(false);
  }, [currentItem?.card.id]);

  async function refreshAll() {
    setBusy(true);
    setMessage("");
    try {
      const [nextDecks, reviewQueue] = await Promise.all([
        listDecks(props.session),
        getTodayReviewQueue(props.session)
      ]);
      setDecks(nextDecks);
      setDueCount(reviewQueue.dueCount);
      setQueue(reviewQueue.items);
      setSelectedDeckId((current) => current || nextDecks[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载复习工作台失败");
    } finally {
      setBusy(false);
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
      const nextDecks = [created, ...decks];
      setDecks(nextDecks);
      setSelectedDeckId(created.id);
      setDeckForm({ title: "", description: "", visibility: "private" });
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
    if (!currentItem) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const result = await reviewCard(props.session, currentItem.card.id, {
        rating,
        elapsedMs: Date.now() - shownAt
      });
      setQueue((items) => items.slice(1));
      setDueCount((count) => Math.max(0, count - 1));
      setMessage(`已记录复习，下次 ${formatDateTime(result.schedule.dueAt)}。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交复习结果失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="review-workspace">
      <section className="workspace-header">
        <div>
          <span>复习</span>
          <h1>把理解过的内容，稳稳送进长期记忆</h1>
          <p>现在这版已经接上 deck、card、今日到期队列和 SM-2 调度，图谱生成卡片也可以顺着这里落下来。</p>
        </div>
        <button className="ghost-button" onClick={() => void refreshAll()} type="button">
          <RotateCcw size={16} />
          刷新
        </button>
      </section>

      {message ? <p className="inline-message">{message}</p> : null}

      <section className="mini-card-grid">
        <article className="mini-card">
          <strong>今日到期</strong>
          <p>{dueCount} 张待复习</p>
        </article>
        <article className="mini-card">
          <strong>卡组数量</strong>
          <p>{decks.length} 个 deck</p>
        </article>
        <article className="mini-card">
          <strong>当前卡组</strong>
          <p>{selectedDeck?.title ?? "还没有选中卡组"}</p>
        </article>
      </section>

      <div className="review-layout">
        <section className="review-panel review-stage-panel">
          <div className="section-frame-head">
            <div>
              <span>今日队列</span>
              <h2>专注处理眼前这一张</h2>
            </div>
            <BookOpenCheck size={18} />
          </div>

          {currentItem ? (
            <div className="review-card-stage">
              <div className="review-flashcard">
                <span>{currentItem.deckTitle}</span>
                <strong>{currentItem.card.front}</strong>
                {showAnswer ? <p>{currentItem.card.back}</p> : <p>先想一想，再翻面确认。</p>}
              </div>
              <div className="review-stage-meta">
                <span>状态：{currentItem.schedule.state}</span>
                <span>下次间隔：{formatRelativeInterval(currentItem.schedule.intervalDays)}</span>
                <span>到期时间：{formatDateTime(currentItem.schedule.dueAt)}</span>
              </div>
              <div className="review-action-row">
                <button className="secondary-button" onClick={() => setShowAnswer((value) => !value)} type="button">
                  <Sparkles size={16} />
                  {showAnswer ? "收起答案" : "显示答案"}
                </button>
                <div className="review-rating-row">
                  {ratingOptions.map((option) => (
                    <button
                      className="ghost-button"
                      disabled={busy || !showAnswer}
                      key={option.value}
                      onClick={() => void handleRate(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <article className="mini-card tall">
              <strong>今天的队列已经清空</strong>
              <p>你可以先补几张卡片，或者等图谱 / 笔记那边继续往这里送草稿。</p>
            </article>
          )}
        </section>

        <section className="review-panel review-stack">
          <article className="mini-card review-form-card">
            <div className="section-frame-head">
              <div>
                <span>卡组</span>
                <h2>先把复习容器建起来</h2>
              </div>
              <Layers3 size={18} />
            </div>
            <form className="form-stack" onSubmit={handleCreateDeck}>
              <label>
                <span>标题</span>
                <input
                  onChange={(event) => setDeckForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="例如：算法基础"
                  value={deckForm.title}
                />
              </label>
              <label>
                <span>说明</span>
                <textarea
                  onChange={(event) => setDeckForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="给这组卡片留一点上下文"
                  rows={3}
                  value={deckForm.description}
                />
              </label>
              <label>
                <span>可见性</span>
                <select
                  onChange={(event) =>
                    setDeckForm((current) => ({
                      ...current,
                      visibility: event.target.value as "private" | "public"
                    }))
                  }
                  value={deckForm.visibility}
                >
                  <option value="private">仅自己可见</option>
                  <option value="public">公开</option>
                </select>
              </label>
              <button className="secondary-button" disabled={busy} type="submit">
                <Plus size={16} />
                创建卡组
              </button>
            </form>
          </article>

          <article className="mini-card review-form-card">
            <div className="section-frame-head">
              <div>
                <span>卡片</span>
                <h2>给当前卡组补一张新卡</h2>
              </div>
              <Plus size={18} />
            </div>
            <form className="form-stack" onSubmit={handleCreateCard}>
              <label>
                <span>所属卡组</span>
                <select onChange={(event) => setSelectedDeckId(event.target.value)} value={selectedDeckId}>
                  <option value="">请选择卡组</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>问题</span>
                <textarea
                  onChange={(event) => setCardForm((current) => ({ ...current, front: event.target.value }))}
                  placeholder="写在卡片正面的提示或问题"
                  rows={3}
                  value={cardForm.front}
                />
              </label>
              <label>
                <span>答案</span>
                <textarea
                  onChange={(event) => setCardForm((current) => ({ ...current, back: event.target.value }))}
                  placeholder="写在卡片反面的答案"
                  rows={4}
                  value={cardForm.back}
                />
              </label>
              <button className="secondary-button" disabled={busy || !selectedDeckId} type="submit">
                <Plus size={16} />
                添加卡片
              </button>
            </form>
          </article>
        </section>

        <section className="review-panel review-stack">
          <article className="mini-card">
            <div className="section-frame-head">
              <div>
                <span>卡组概览</span>
                <h2>挑一个 deck 继续整理</h2>
              </div>
            </div>
            <div className="review-list">
              {decks.map((deck) => (
                <button
                  className={`review-deck-item${deck.id === selectedDeckId ? " active" : ""}`}
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  type="button"
                >
                  <strong>{deck.title}</strong>
                  <span>{deck.cardCount} 张卡片</span>
                </button>
              ))}
              {decks.length === 0 ? <p>还没有卡组，先建一个就能开始。</p> : null}
            </div>
          </article>

          <article className="mini-card">
            <div className="section-frame-head">
              <div>
                <span>卡片列表</span>
                <h2>{selectedDeck?.title ?? "当前没有选中卡组"}</h2>
              </div>
            </div>
            <div className="review-list">
              {cards.map((card) => (
                <article className="review-card-item" key={card.id}>
                  <strong>{card.front}</strong>
                  <p>{card.back}</p>
                </article>
              ))}
              {selectedDeckId && cards.length === 0 ? <p>这个卡组还没有卡片。</p> : null}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
