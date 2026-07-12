import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { AuthSession, FilePayload, MaterialPayload } from "../api/client";
import {
  createMaterial,
  listMaterials,
  rateMaterial,
  toggleMaterialFavorite,
  updateMaterial,
  uploadFile
} from "../api/client";
import {
  displayMaterialCategory,
  displayMaterialDescription,
  displayMaterialOwner,
  displayMaterialTags,
  displayMaterialTitle,
  formatDate,
  quickActions,
  SectionFrame,
  WorkspaceHeader
} from "../app/appShared";
import { DataState, Input, Tag } from "../design-system/primitives";

type MaterialsState =
  | {
      kind: "loading" | "error" | "empty" | "stale";
      title: string;
      description: string;
    }
  | null;

export function MaterialsPage(props: { session: AuthSession | null }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FilePayload | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    attachmentFileId: ""
  });

  async function loadAll(options?: { preserveExisting?: boolean }) {
    setLoadingMaterials(true);
    setLoadErrorMessage("");
    try {
      const items = await listMaterials();
      setMaterials(items);
      setSelectedId((current) => {
        const preferred = current || searchParams.get("selected") || items[0]?.id || "";
        return items.some((material) => material.id === preferred) ? preferred : items[0]?.id || "";
      });
      return true;
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "读取资料列表失败，请稍后再试。";
      setLoadErrorMessage(nextMessage);
      if (!options?.preserveExisting) {
        setMaterials([]);
        setSelectedId("");
      }
      return false;
    } finally {
      setLoadingMaterials(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // 初次加载时 URL 只用于初始化选中项。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMaterials = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return materials;
    }

    return materials.filter((material) =>
      [displayMaterialTitle(material), displayMaterialDescription(material), displayMaterialCategory(material)]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [materials, search]);

  const selectedMaterial =
    filteredMaterials.find((material) => material.id === selectedId) ??
    materials.find((material) => material.id === selectedId) ??
    filteredMaterials[0] ??
    null;

  const materialsState: MaterialsState = useMemo(() => {
    if (loadingMaterials && materials.length === 0) {
      return {
        kind: "loading",
        title: "正在同步资料库",
        description: "请稍候，正在加载最新可浏览资料与当前筛选上下文。"
      };
    }

    if (loadErrorMessage && materials.length > 0) {
      return {
        kind: "stale",
        title: "资料列表需要刷新",
        description: loadErrorMessage
      };
    }

    if (loadErrorMessage) {
      return {
        kind: "error",
        title: "资料库暂时不可用",
        description: loadErrorMessage
      };
    }

    if (materials.length === 0) {
      return {
        kind: "empty",
        title: "还没有可浏览的资料",
        description: "先上传一份资料，或者等待新的公开材料进入资料库。"
      };
    }

    if (search.trim() && filteredMaterials.length === 0) {
      return {
        kind: "empty",
        title: "当前筛选没有命中资料",
        description: "可以尝试缩短关键词，或切换到更宽的分类重新查看。"
      };
    }

    return null;
  }, [filteredMaterials.length, loadErrorMessage, loadingMaterials, materials.length, search]);

  const showMaterialList = filteredMaterials.length > 0 && (!materialsState || materialsState.kind === "stale");
  useEffect(() => {
    if (!selectedMaterial) {
      setUploadedFile(null);
      return;
    }

    const resolvedDescription = displayMaterialDescription(selectedMaterial);
    const resolvedCategory = displayMaterialCategory(selectedMaterial);

    setDraft({
      title: displayMaterialTitle(selectedMaterial),
      description: resolvedDescription === "这份资料的说明还没有整理好。" ? "" : resolvedDescription,
      category: resolvedCategory === "未分类" ? "" : resolvedCategory,
      tags: displayMaterialTags(selectedMaterial).join(", "),
      attachmentFileId: selectedMaterial.attachmentFileId
    });
    setUploadedFile(
      selectedMaterial.attachmentFileId
        ? {
            id: selectedMaterial.attachmentFileId,
            createdAt: selectedMaterial.createdAt,
            mimeType: selectedMaterial.attachmentMime,
            originalName: selectedMaterial.attachmentName,
            ownerUserId: selectedMaterial.ownerUserId,
            path: "",
            size: 0
          }
        : null
    );
  }, [selectedMaterial]);

  async function handleUpload() {
    if (!props.session || !selectedFile) {
      return;
    }

    setBusy("upload");
    setMessage("");
    try {
      const payload = await uploadFile(props.session, selectedFile);
      setUploadedFile(payload);
      setDraft((current) => ({ ...current, attachmentFileId: payload.id }));
      setMessage(`已上传 ${payload.originalName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请稍后再试。");
    } finally {
      setBusy("");
    }
  }

  async function handleCreate() {
    if (!props.session) {
      setMessage("登录后才能创建资料。");
      return;
    }

    setBusy("save");
    setMessage("");
    try {
      await createMaterial(props.session, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
        coverFileId: "",
        attachmentFileId: draft.attachmentFileId
      });
      const refreshed = await loadAll({ preserveExisting: true });
      setMessage(refreshed ? "资料已提交审核。" : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建资料失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleUpdate() {
    if (!props.session || !selectedMaterial) {
      return;
    }

    setBusy("update");
    setMessage("");
    try {
      await updateMaterial(props.session, selectedMaterial.id, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        tags: draft.tags.split(",").map((item) => item.trim()).filter(Boolean),
        coverFileId: "",
        attachmentFileId: draft.attachmentFileId
      });
      const refreshed = await loadAll({ preserveExisting: true });
      setMessage(refreshed ? "资料已更新。" : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新资料失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleFavorite() {
    if (!props.session || !selectedMaterial) {
      setMessage("登录后才能收藏资料。");
      return;
    }

    setBusy("favorite");
    setMessage("");
    try {
      await toggleMaterialFavorite(props.session, selectedMaterial.id);
      const refreshed = await loadAll({ preserveExisting: true });
      setMessage(refreshed ? "资料收藏状态已更新。" : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "收藏失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleRate(score: number) {
    if (!props.session || !selectedMaterial) {
      setMessage("登录后才能评分。");
      return;
    }

    setBusy(`rate-${score}`);
    setMessage("");
    try {
      await rateMaterial(props.session, selectedMaterial.id, score);
      const refreshed = await loadAll({ preserveExisting: true });
      setMessage(refreshed ? "资料评分已更新。" : "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "评分失败。");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <label className="secondary-button">
              <Upload size={16} />
              选择附件
              <Input hidden onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} type="file" />
            </label>
            <button
              className="secondary-button"
              disabled={!props.session || !selectedFile || busy === "upload"}
              onClick={handleUpload}
              type="button"
            >
              {busy === "upload" ? "上传中..." : "上传附件"}
            </button>
            <button className="primary-button" disabled={!props.session || busy === "save"} onClick={handleCreate} type="button">
              新建资料
            </button>
          </div>
        }
        description="集中管理资料、附件和阅读入口；选择一份资料后，在右侧完成阅读、收藏、评分和基础信息维护。"
        eyebrow="资料库"
        title="你的学习资料库"
      />

      <div className="library-workspace materials-library-workspace">
        <SectionFrame slim subtitle="筛选" title="定位资料">
          <div className="filter-stack">
            <label className="search-field inset">
              <Search size={16} />
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="按标题、分类或描述搜索"
                value={search}
              />
            </label>
            <div className="chip-row">
              <Tag>公开资料 {materials.length}</Tag>
              <Tag tone="muted">可公开浏览</Tag>
            </div>
            <div className="sidebar-action-list">
              {quickActions.map((item) => (
                <Link className="quiet-action" key={item.label} to={item.requiresAuth && !props.session ? "/login" : item.to}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </Link>
              ))}
            </div>
          </div>
        </SectionFrame>

        <SectionFrame slim subtitle="结果" title="资料列表">
          {materialsState ? (
            <DataState description={materialsState.description} kind={materialsState.kind} title={materialsState.title} />
          ) : null}
          {showMaterialList ? (
            <div className="list-stack">
              {filteredMaterials.map((material) => (
                <button
                  className={selectedMaterial?.id === material.id ? "list-row active" : "list-row"}
                  key={material.id}
                  onClick={() => setSelectedId(material.id)}
                  type="button"
                >
                  <div>
                    <strong>{displayMaterialTitle(material)}</strong>
                    <p>{displayMaterialDescription(material)}</p>
                  </div>
                  <span>{displayMaterialCategory(material)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </SectionFrame>

        <SectionFrame
          action={
            selectedMaterial?.attachmentFileId ? (
              <Link className="secondary-button" to={`/reader/${selectedMaterial.id}`}>
                <BookOpen size={16} />
                进入阅读
              </Link>
            ) : null
          }
          subtitle="详情"
          title={selectedMaterial ? displayMaterialTitle(selectedMaterial) : "选择一份资料"}
        >
          {selectedMaterial ? (
            <div className="detail-stack">
              <article className="profile-summary">
                <strong>{displayMaterialCategory(selectedMaterial)}</strong>
                <span>作者：{displayMaterialOwner(selectedMaterial)}</span>
                <span>创建于 {formatDate(selectedMaterial.createdAt)}</span>
                <span>
                  评分 {selectedMaterial.averageRating.toFixed(1)} / 收藏 {selectedMaterial.favoritesCount}
                </span>
              </article>

              <div className="chip-row">
                {displayMaterialTags(selectedMaterial).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>

              <p className="detail-copy">{displayMaterialDescription(selectedMaterial)}</p>

              <div className="detail-actions">
                <button
                  className="secondary-button"
                  data-material-action="favorite"
                  disabled={!props.session || busy === "favorite"}
                  onClick={handleFavorite}
                  type="button"
                >
                  收藏资料
                </button>
                {[3, 4, 5].map((score) => (
                  <button
                    className="secondary-button"
                    disabled={!props.session || busy === `rate-${score}`}
                    key={score}
                    onClick={() => void handleRate(score)}
                    type="button"
                  >
                    {score} 分
                  </button>
                ))}
              </div>

              <div className="form-stack">
                <label>
                  <span>标题</span>
                  <Input onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} value={draft.title} />
                </label>
                <label>
                  <span>说明</span>
                  <Input onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} value={draft.description} />
                </label>
                <label>
                  <span>分类</span>
                  <Input onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} value={draft.category} />
                </label>
                <label>
                  <span>标签</span>
                  <Input onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} value={draft.tags} />
                </label>
                <button className="primary-button" disabled={!props.session || busy === "update"} onClick={handleUpdate} type="button">
                  保存资料信息
                </button>
              </div>

              {uploadedFile ? (
                <article className="upload-summary">
                  <strong>{uploadedFile.originalName}</strong>
                  <span>{uploadedFile.mimeType || "未知类型"}</span>
                  <span>{uploadedFile.id}</span>
                </article>
              ) : null}
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>还没有可展示的资料</strong>
              <p>先在左侧创建一份材料，或者等待管理员通过待审核内容。</p>
            </article>
          )}
          {message ? <p className="muted-copy">{message}</p> : null}
        </SectionFrame>
      </div>
    </>
  );
}
