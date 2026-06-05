import { BookOpen, Sparkles } from "lucide-react";
import type {
  DeckPayload,
  GraphCardDraftPayload,
  GraphSnapshotPayload
} from "../../../api/client";

export function GraphWorkspaceRecoveryPanel(props: {
  canGenerateCards: boolean;
  cardDrafts: GraphCardDraftPayload[];
  decks: DeckPayload[];
  onCommitCardDrafts: () => void;
  onDraftDeckChange: (deckId: string) => void;
  onDraftFieldChange: (draftId: string, field: "front" | "back", value: string) => void;
  onGenerateCards: () => void;
  onRestoreSnapshot: (versionNumber: number) => void;
  saving: boolean;
  selectedDraftDeckId: string;
  snapshots: GraphSnapshotPayload[];
}) {
  return (
    <div className="graph-rail-section" aria-label="图谱快照与卡片草稿">
      <div className="section-frame-head compact">
        <div>
          <p className="eyebrow">快照与草稿</p>
          <h2>Phase 5 / 6</h2>
        </div>
      </div>

      <div className="graph-inline-actions">
        <button className="secondary-button" disabled={!props.canGenerateCards} onClick={props.onGenerateCards} type="button">
          <Sparkles size={16} />
          生成卡片草稿
        </button>
      </div>

      {props.cardDrafts.length ? (
        <>
          <div className="graph-form-stack">
            <label>
              <span>写入卡组</span>
              <select onChange={(event) => props.onDraftDeckChange(event.target.value)} value={props.selectedDraftDeckId}>
                <option value="">请选择一个 deck</option>
                {props.decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="secondary-button"
              disabled={!props.selectedDraftDeckId || props.saving}
              onClick={props.onCommitCardDrafts}
              type="button"
            >
              <BookOpen size={16} />
              确认写入卡组
            </button>
          </div>

          <div className="graph-card-draft-list">
            {props.cardDrafts.map((draft) => (
              <article className="graph-card-draft" key={draft.id}>
                <label>
                  <span>问题</span>
                  <input
                    onChange={(event) => props.onDraftFieldChange(draft.id, "front", event.target.value)}
                    value={draft.front}
                  />
                </label>
                <label>
                  <span>答案</span>
                  <textarea
                    onChange={(event) => props.onDraftFieldChange(draft.id, "back", event.target.value)}
                    rows={4}
                    value={draft.back}
                  />
                </label>
                {draft.explanation ? <small>{draft.explanation}</small> : null}
              </article>
            ))}
          </div>
        </>
      ) : !props.decks.length ? (
        <article className="graph-meta-card muted">
          <strong>卡组准备</strong>
          <p>先去复习页创建一个 deck，这里就能把图谱草稿确认写进去。</p>
        </article>
      ) : null}

      <div className="graph-snapshot-list">
        {props.snapshots.map((snapshot) => (
          <article className="graph-snapshot-item" key={snapshot.id}>
            <div>
              <strong>v{snapshot.versionNumber}</strong>
              <span>{snapshot.summary || "图谱变更"}</span>
            </div>
            <button
              className="ghost-button"
              disabled={props.saving}
              onClick={() => props.onRestoreSnapshot(snapshot.versionNumber)}
              type="button"
            >
              恢复
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
