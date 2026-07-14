import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type {
  AiDraftPayload,
  AiTaskPayload,
  AiUsageSummaryPayload,
  AuthSession,
  DeckPayload,
  GraphDetailPayload,
  GraphSummaryPayload
} from "../api/client";
import {
  bulkCreateDeckCards,
  commitGraphChangeDraftSelection,
  getAiUsageSummary,
  getGraph,
  listAiDrafts,
  listAiTasks,
  listDecks,
  listGraphs
} from "../api/client";
import { formatDate, MetricTile, SectionFrame, WorkspaceHeader } from "../app/appShared";
import { DataState, Select } from "../design-system/primitives";
import {
  buildAiDraftWorkspacePath,
  buildCardInputsFromAiDrafts,
  buildGraphFocusLink,
  estimateAiDraftNodePlacement,
  findSimilarGraphTitles,
  formatAiDraftTarget,
  formatAiStatusLabel,
  formatAiSourceLabel,
  formatAiTaskLabel,
  getAiDraftEdgeLabels,
  getAiDraftGraphSummary,
  getAiDraftMetadataList,
  getAiDraftNodeEntries,
  getAiDraftNodeIds,
  getAiDraftSourceKey
} from "../features/ai/aiDrafts";

type AiWorkspaceState =
  | {
      kind: "loading" | "error" | "stale";
      title: string;
      description: string;
    }
  | null;

function trimSearchParam(value: string | null) {
  return value?.trim() ?? "";
}

function prioritizeRequestedItems<T extends { id: string }>(items: T[], requestedId: string) {
  if (!requestedId) {
    return items;
  }

  const targetIndex = items.findIndex((item) => item.id === requestedId);
  if (targetIndex <= 0) {
    return items;
  }

  const target = items[targetIndex];
  return [target, ...items.slice(0, targetIndex), ...items.slice(targetIndex + 1)];
}

export function AiPage(props: { session: AuthSession }) {
  const location = useLocation();
  const [tasks, setTasks] = useState<AiTaskPayload[]>([]);
  const [drafts, setDrafts] = useState<AiDraftPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [graphs, setGraphs] = useState<GraphSummaryPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [selectedGraphId, setSelectedGraphId] = useState("");
  const [selectedGraphDraftIds, setSelectedGraphDraftIds] = useState<string[]>([]);
  const [selectedGraphNodeIdsByDraft, setSelectedGraphNodeIdsByDraft] = useState<Record<string, string[]>>({});
  const [selectedGraphDetail, setSelectedGraphDetail] = useState<GraphDetailPayload | null>(null);
  const [summary, setSummary] = useState<AiUsageSummaryPayload | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedDraftId = trimSearchParam(searchParams.get("draft"));
  const requestedTaskId = trimSearchParam(searchParams.get("task"));

  const sourceOptions = useMemo(
    () => Array.from(new Set(drafts.map((draft) => getAiDraftSourceKey(draft)))).sort(),
    [drafts]
  );
  const filteredDrafts = useMemo(
    () => {
      const matchedDrafts = drafts.filter((draft) => {
        const matchesSource = sourceFilter === "all" || getAiDraftSourceKey(draft) === sourceFilter;
        const matchesStatus = statusFilter === "all" || draft.status === statusFilter;
        return matchesSource && matchesStatus;
      });

      return prioritizeRequestedItems(matchedDrafts, requestedDraftId);
    },
    [drafts, sourceFilter, statusFilter, requestedDraftId]
  );
  const orderedTasks = useMemo(() => prioritizeRequestedItems(tasks, requestedTaskId), [tasks, requestedTaskId]);
  const pendingCardDrafts = useMemo(
    () => filteredDrafts.filter((draft) => draft.status === "pending" && draft.draftType === "card_draft"),
    [filteredDrafts]
  );
  const pendingGraphDrafts = useMemo(
    () => filteredDrafts.filter((draft) => draft.status === "pending" && draft.draftType === "graph_change"),
    [filteredDrafts]
  );
  const selectedPendingGraphDrafts = useMemo(
    () => pendingGraphDrafts.filter((draft) => selectedGraphDraftIds.includes(draft.id)),
    [pendingGraphDrafts, selectedGraphDraftIds]
  );
  const existingGraphTitles = useMemo(() => {
    if (!selectedGraphDetail) {
      return new Set<string>();
    }
    return new Set(selectedGraphDetail.document.nodes.map((node) => node.title.trim().toLowerCase()).filter(Boolean));
  }, [selectedGraphDetail]);
  const hasWorkspaceContent = drafts.length > 0 || tasks.length > 0 || decks.length > 0 || graphs.length > 0 || summary !== null;
  const workspaceState: AiWorkspaceState = loadingWorkspace && !hasWorkspaceContent
    ? {
        kind: "loading",
        title: "准备 AI 工作台",
        description: "正在整理待确认草稿、任务历史和可写入的卡组 / 图谱。"
      }
    : workspaceError && hasWorkspaceContent
      ? {
          kind: "stale",
          title: "AI 工作台需要刷新",
          description: workspaceError
        }
      : workspaceError
        ? {
            kind: "error",
            title: "AI 工作台暂时不可用",
            description: workspaceError
          }
        : null;
  const deepLinkMessage = useMemo(() => {
    if (loadingWorkspace) {
      return "";
    }

    if (requestedDraftId) {
      return drafts.some((draft) => draft.id === requestedDraftId)
        ? "已定位指定 AI 草稿，可直接确认或回看来源。"
        : "未找到指定 AI 草稿，已回到默认工作台视图。";
    }

    if (requestedTaskId) {
      return tasks.some((task) => task.id === requestedTaskId)
        ? "已定位指定 AI 任务，可先查看结果后再决定是否继续确认。"
        : "未找到指定 AI 任务，已回到默认工作台视图。";
    }

    return "";
  }, [drafts, loadingWorkspace, requestedDraftId, requestedTaskId, tasks]);

  async function loadAiWorkspace(options?: { preserveExisting?: boolean }) {
    const preserveExisting = options?.preserveExisting ?? false;
    setLoadingWorkspace(true);
    setWorkspaceError("");

    if (!preserveExisting) {
      setTasks([]);
      setDrafts([]);
      setDecks([]);
      setGraphs([]);
      setSummary(null);
      setSelectedDeckId("");
      setSelectedGraphId("");
      setSelectedGraphDetail(null);
    }

    try {
      const [taskItems, draftItems, summaryPayload, deckItems, graphItems] = await Promise.all([
        listAiTasks(props.session),
        listAiDrafts(props.session),
        getAiUsageSummary(props.session),
        listDecks(props.session),
        listGraphs(props.session)
      ]);
      setTasks(taskItems);
      setDrafts(draftItems);
      setSummary(summaryPayload);
      setDecks(deckItems);
      setGraphs(graphItems);
      setSelectedDeckId((current) =>
        current && deckItems.some((deck) => deck.id === current) ? current : deckItems[0]?.id || ""
      );
      setSelectedGraphId((current) =>
        current && graphItems.some((graph) => graph.id === current) ? current : graphItems[0]?.id || ""
      );
      return true;
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "读取 AI 工作台失败。");
      if (!preserveExisting) {
        setTasks([]);
        setDrafts([]);
        setDecks([]);
        setGraphs([]);
        setSummary(null);
        setSelectedDeckId("");
        setSelectedGraphId("");
        setSelectedGraphDetail(null);
      }
      return false;
    } finally {
      setLoadingWorkspace(false);
    }
  }

  useEffect(() => {
    void loadAiWorkspace();
  }, [props.session]);

  useEffect(() => {
    const availableIds = pendingGraphDrafts.map((draft) => draft.id);
    setSelectedGraphDraftIds((current) => {
      const preserved = current.filter((id) => availableIds.includes(id));
      if (preserved.length > 0) {
        return preserved;
      }
      return availableIds;
    });
    setSelectedGraphNodeIdsByDraft((current) => {
      const next: Record<string, string[]> = {};
      for (const draft of pendingGraphDrafts) {
        const allNodeIds = getAiDraftNodeIds(draft);
        const preserved = (current[draft.id] || []).filter((id) => allNodeIds.includes(id));
        next[draft.id] = preserved.length > 0 ? preserved : allNodeIds;
      }
      return next;
    });
  }, [pendingGraphDrafts]);

  useEffect(() => {
    if (!selectedGraphId) {
      setSelectedGraphDetail(null);
      return;
    }

    void getGraph(props.session, selectedGraphId)
      .then(setSelectedGraphDetail)
      .catch(() => setSelectedGraphDetail(null));
  }, [props.session, selectedGraphId]);

  async function handleCommitDrafts() {
    if (!selectedDeckId || pendingCardDrafts.length === 0) {
      return;
    }

    setBusy("commit");
    setMessage("");
    try {
      const payload = await bulkCreateDeckCards(props.session, selectedDeckId, buildCardInputsFromAiDrafts(pendingCardDrafts));
      const refreshed = await loadAiWorkspace({ preserveExisting: true });
      setMessage(refreshed ? `已把 ${payload.length} 张 AI 草稿写入复习系统。` : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "写入 AI 草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleCommitGraphDrafts() {
    if (!selectedGraphId || selectedPendingGraphDrafts.length === 0) {
      return;
    }

    setBusy("commit-graph");
    setMessage("");
    try {
      const nodeSelections = selectedPendingGraphDrafts.map((draft) => ({
        draftId: draft.id,
        nodeIds: selectedGraphNodeIdsByDraft[draft.id] || getAiDraftNodeIds(draft)
      }));
      if (nodeSelections.some((item) => item.nodeIds.length === 0)) {
        setMessage("至少为每条待确认图谱草稿保留一个节点。");
        setBusy("");
        return;
      }
      const payload = await commitGraphChangeDraftSelection(props.session, selectedGraphId, {
        draftIds: selectedPendingGraphDrafts.map((draft) => draft.id),
        nodeSelections
      });
      const refreshed = await loadAiWorkspace({ preserveExisting: true });
      setMessage(refreshed ? `已把 ${selectedPendingGraphDrafts.length} 条图谱变更写入《${payload.title}》。` : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "写入图谱变更失败。");
    } finally {
      setBusy("");
    }
  }

  function handleToggleGraphDraft(draftId: string) {
    setSelectedGraphDraftIds((current) =>
      current.includes(draftId) ? current.filter((id) => id !== draftId) : [...current, draftId]
    );
  }

  function handleToggleGraphDraftNode(draftId: string, nodeId: string) {
    setSelectedGraphNodeIdsByDraft((current) => {
      const existing = current[draftId] || [];
      return {
        ...current,
        [draftId]: existing.includes(nodeId) ? existing.filter((id) => id !== nodeId) : [...existing, nodeId]
      };
    });
  }

  const workspaceAction = workspaceState && (workspaceState.kind === "error" || workspaceState.kind === "stale")
    ? (
        <button
          className="secondary-button"
          onClick={() => void loadAiWorkspace({ preserveExisting: workspaceState.kind === "stale" })}
          type="button"
        >
          重新加载
        </button>
      )
    : undefined;

  return (
    <>
      <WorkspaceHeader
        description="AI 只生成待确认草稿；在这里集中检查来源、选择目标卡组或图谱，并决定哪些内容进入正式学习资产。"
        eyebrow="AI 草稿中心"
        title="确认草稿，再写入学习资产"
      />

      <div className="ai-workspace ai-draft-workspace">
        {workspaceState && workspaceState.kind !== "stale" ? (
          <DataState action={workspaceAction} description={workspaceState.description} kind={workspaceState.kind} title={workspaceState.title} />
        ) : (
          <>
            {deepLinkMessage ? <p className="inline-message">{deepLinkMessage}</p> : null}
            {workspaceState?.kind === "stale" ? (
              <DataState action={workspaceAction} description={workspaceState.description} kind={workspaceState.kind} title={workspaceState.title} />
            ) : null}

            <div className="metrics-grid">
              <MetricTile
                helper="当前账号累计记录的 AI 草稿任务数。"
                label="任务总数"
                value={String(summary?.totalTasks ?? 0)}
              />
              <MetricTile
                helper="目前已经成功完成并留下结果的任务。"
                label="完成任务"
                value={String(summary?.completedTasks ?? 0)}
              />
              <MetricTile
                helper="用于排查来源或输入问题的失败任务数。"
                label="失败任务"
                value={String(summary?.failedTasks ?? 0)}
              />
              <MetricTile
                helper="这一阶段主要记录本地草稿引擎，所以成本通常为 0。"
                label="累计用量"
                value={`${summary?.totalOutputTokens ?? 0} 输出`}
              />
            </div>

            <SectionFrame
              subtitle="待确认结果"
              title="最近 AI 草稿"
              action={<span className="inline-message">筛选后 {filteredDrafts.length} 条，待确认 {pendingCardDrafts.length + pendingGraphDrafts.length}</span>}
            >
              <div className="form-stack ai-panel-controls">
                <div className="ai-filter-grid">
                  <label>
                    <span>来源筛选</span>
                    <Select className="select-field" onChange={(event) => setSourceFilter(event.target.value)} value={sourceFilter}>
                      <option value="all">全部来源</option>
                      {sourceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label>
                    <span>状态筛选</span>
                    <Select className="select-field" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                      <option value="all">全部状态</option>
                      <option value="pending">待确认</option>
                      <option value="confirmed">已确认</option>
                      <option value="failed">失败</option>
                    </Select>
                  </label>
                </div>
              </div>

              {pendingCardDrafts.length ? (
                decks.length ? (
                  <div className="form-stack ai-panel-controls">
                    <label>
                      <span>写入目标 deck</span>
                      <Select
                        className="select-field"
                        onChange={(event) => setSelectedDeckId(event.target.value)}
                        value={selectedDeckId}
                      >
                        {decks.map((deck) => (
                          <option key={deck.id} value={deck.id}>
                            {deck.title} · {deck.cardCount} 张
                          </option>
                        ))}
                      </Select>
                    </label>
                    <div className="ai-panel-actions">
                      <button
                        className="primary-button"
                        disabled={!selectedDeckId || busy === "commit"}
                        onClick={() => void handleCommitDrafts()}
                        type="button"
                      >
                        {busy === "commit" ? "写入中..." : `把 ${pendingCardDrafts.length} 张待确认卡片草稿写入复习系统`}
                      </button>
                      <span className="inline-message">
                        确认后会按当前正反面内容创建卡片，并把对应草稿标记为已确认。
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="inline-link-row">
                    还没有可写入的 deck，先去 <Link to="/review">复习页</Link> 创建一个，再回来确认这些草稿。
                  </p>
                )
              ) : null}

              {pendingGraphDrafts.length ? (
                graphs.length ? (
                  <div className="form-stack ai-panel-controls">
                    <label>
                      <span>写入目标图谱</span>
                      <Select
                        className="select-field"
                        onChange={(event) => setSelectedGraphId(event.target.value)}
                        value={selectedGraphId}
                      >
                        {graphs.map((graph) => (
                          <option key={graph.id} value={graph.id}>
                            {graph.title} · {graph.nodeCount} 节点
                          </option>
                        ))}
                      </Select>
                    </label>
                    <div className="ai-panel-actions">
                      <button
                        className="secondary-button"
                        disabled={selectedPendingGraphDrafts.length === pendingGraphDrafts.length}
                        onClick={() => setSelectedGraphDraftIds(pendingGraphDrafts.map((draft) => draft.id))}
                        type="button"
                      >
                        全选当前筛选结果
                      </button>
                      <button
                        className="secondary-button"
                        disabled={selectedPendingGraphDrafts.length === 0}
                        onClick={() => setSelectedGraphDraftIds([])}
                        type="button"
                      >
                        清空选择
                      </button>
                      <button
                        className="primary-button"
                        disabled={!selectedGraphId || selectedPendingGraphDrafts.length === 0 || busy === "commit-graph"}
                        onClick={() => void handleCommitGraphDrafts()}
                        type="button"
                      >
                        {busy === "commit-graph" ? "写入中..." : `把 ${selectedPendingGraphDrafts.length} 条图谱变更写入所选图谱`}
                      </button>
                      <span className="inline-message">
                        已选 {selectedPendingGraphDrafts.length} / {pendingGraphDrafts.length} 条。确认后会把候选节点和连线追加进目标图谱，并把对应草稿标记为已确认。
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="inline-link-row">
                    还没有可写入的图谱，先去 <Link to="/graph">图谱页</Link> 创建一个，再回来确认这些变更。
                  </p>
                )
              ) : null}

              <div className="ai-task-list">
                {filteredDrafts.length ? (
                  filteredDrafts.map((draft) => (
                    <article className="ai-task-card" key={draft.id}>
                      <div className="story-card-head">
                        <div className="ai-card-heading">
                          {draft.draftType === "graph_change" && draft.status === "pending" ? (
                            <label className="ai-draft-toggle">
                              <input
                                checked={selectedGraphDraftIds.includes(draft.id)}
                                onChange={() => handleToggleGraphDraft(draft.id)}
                                type="checkbox"
                              />
                              <span>纳入这次确认</span>
                            </label>
                          ) : null}
                          <strong>{draft.sourceLabel || draft.front}</strong>
                        </div>
                        <span className={`ai-status-pill ${draft.status}`}>{formatAiStatusLabel(draft.status)}</span>
                      </div>
                      <p>{formatAiDraftTarget(draft)}</p>
                      <div className="story-card-meta">
                        <span>{draft.draftType === "graph_change" ? "图谱变更草稿" : draft.front}</span>
                        <span>{formatDate(draft.updatedAt)}</span>
                      </div>
                      <p>{draft.back}</p>
                      {draft.draftType === "graph_change" ? (
                        <div className="ai-draft-preview">
                          <p className="inline-message">
                            候选节点 {getAiDraftMetadataList(draft, "nodes").length} 个，候选连线 {getAiDraftMetadataList(draft, "edges").length} 条
                            {getAiDraftGraphSummary(draft) ? ` · ${getAiDraftGraphSummary(draft)}` : ""}
                          </p>
                          {selectedGraphDetail ? (
                            <p className="inline-message">
                              {(() => {
                                const conflictTitles = getAiDraftNodeEntries(draft)
                                  .map((item) => item.title)
                                  .filter((title) => existingGraphTitles.has(title.toLowerCase()));
                                return conflictTitles.length
                                  ? `目标图谱里已有同名节点：${conflictTitles.join("、")}`
                                  : "目标图谱里暂时没有发现同名节点冲突。";
                              })()}
                            </p>
                          ) : null}
                          <div className="ai-draft-preview-grid">
                            <div>
                              <strong>候选节点</strong>
                              <ul>
                                {getAiDraftNodeEntries(draft).map((item) => (
                                  <li key={`${draft.id}-node-${item.id}`}>
                                    <label className="ai-draft-node-toggle">
                                      <input
                                        checked={(selectedGraphNodeIdsByDraft[draft.id] || []).includes(item.id)}
                                        onChange={() => handleToggleGraphDraftNode(draft.id, item.id)}
                                        type="checkbox"
                                      />
                                      <span>{item.title}</span>
                                    </label>
                                    <div className="ai-draft-node-meta">
                                      <span>
                                        预计落点 {estimateAiDraftNodePlacement(item, selectedGraphDetail).zone} · x
                                        {estimateAiDraftNodePlacement(item, selectedGraphDetail).x} / y
                                        {estimateAiDraftNodePlacement(item, selectedGraphDetail).y}
                                      </span>
                                      <span>
                                        {findSimilarGraphTitles(item.title, selectedGraphDetail).length
                                          ? `相似节点：${findSimilarGraphTitles(item.title, selectedGraphDetail).join("、")}`
                                          : "相似节点：未发现明显近似项"}
                                      </span>
                                      {selectedGraphId ? (
                                        <span>
                                          <Link state={{ graphId: selectedGraphId, ...buildGraphFocusLink(item, selectedGraphDetail) }} to="/graph">
                                            去目标图谱查看落点
                                          </Link>
                                        </span>
                                      ) : null}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>候选连线</strong>
                              <ul>
                                {getAiDraftEdgeLabels(draft).map((label, index) => (
                                  <li key={`${draft.id}-edge-${index}`}>{label}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {draft.explanation ? <p className="inline-message">{draft.explanation}</p> : null}
                      {buildAiDraftWorkspacePath(draft) ? (
                        <p className="inline-link-row">
                          <Link to={buildAiDraftWorkspacePath(draft)}>打开来源工作台</Link>
                        </p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <article className="placeholder-card">
                    <strong>当前筛选下没有草稿</strong>
                    <p>可以调整来源或状态筛选，或者去图谱、笔记、阅读器里再生成一轮 AI 草稿。</p>
                  </article>
                )}
              </div>
              {message ? <p className="muted-copy">{message}</p> : null}
            </SectionFrame>

            <SectionFrame
              subtitle="任务历史"
              title="最近 AI 任务"
              action={summary?.lastTaskAt ? <span className="inline-message">最近任务 {formatDate(summary.lastTaskAt)}</span> : undefined}
            >
              <div className="ai-task-list">
                {tasks.length ? (
                  orderedTasks.map((task) => (
                    <article className="ai-task-card" key={task.id}>
                      <div className="story-card-head">
                        <strong>{formatAiTaskLabel(task.taskType)}</strong>
                        <span className={`ai-status-pill ${task.status}`}>{formatAiStatusLabel(task.status)}</span>
                      </div>
                      <p>{formatAiSourceLabel(task)}</p>
                      <div className="story-card-meta">
                        <span>模型 {task.model}</span>
                        <span>输入 {task.inputTokens}</span>
                        <span>输出 {task.outputTokens}</span>
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                      {task.errorMessage ? <p className="inline-message">{task.errorMessage}</p> : null}
                    </article>
                  ))
                ) : (
                  <article className="placeholder-card">
                    <strong>还没有 AI 任务</strong>
                    <p>去图谱、笔记或阅读器里生成一次草稿，这里就会开始沉淀任务历史和用量轨迹。</p>
                  </article>
                )}
              </div>
            </SectionFrame>
          </>
        )}
      </div>
    </>
  );
}
