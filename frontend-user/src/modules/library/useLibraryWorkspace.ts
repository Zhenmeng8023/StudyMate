import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthSession, MaterialPayload } from "../../api/client";
import { uploadFile } from "../../api/client";
import { validatePdfUpload } from "../../api/pdfUpload";
import {
  collectOfficialMaterial, createLibraryMaterial, createOfficialMaterial, deleteLibraryMaterial,
  downloadLibraryMaterial, listLibraryMaterials, listOfficialCatalog, listManagedOfficialCatalog, transitionOfficialMaterial, getPublicOfficialMaterial, getManagedOfficialMaterial,
  uncollectOfficialMaterial, updateLibraryMaterial, updateOfficialMaterial, createOfficialVersion, type OfficialCatalogQuery
} from "../../api/library";
import { filterLibraryDocuments, type LibraryDocumentDraft, type LibraryMode } from "./libraryDocument";
import { getLibraryReadingState, sortLibraryBooks, type LibraryBookSort, type LibraryReadingFilter } from "./libraryReading";

function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useLibraryWorkspace(mode: LibraryMode, session: AuthSession | null, requestedId = "", initiallyManaging = false) {
  const [items, setItems] = useState<MaterialPayload[]>([]);
  const [selectedId, setSelectedId] = useState(requestedId);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [storageRevision, setStorageRevision] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [catalogQuery, setCatalogQuery] = useState<OfficialCatalogQuery>({ page: 1, pageSize: 20, q: "", category: "", materialType: "", sort: "updated", status: "all" });
  const [managing, setManaging] = useState(initiallyManaging && session?.user.role === "admin");
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [linkedDocument, setLinkedDocument] = useState<MaterialPayload | null>(null);
  const [selectionError, setSelectionError] = useState("");
  const loadRun = useRef(0);
  const [folder, setFolder] = useState("");
  const [readingFilter, setReadingFilter] = useState<LibraryReadingFilter>("all");
  const [bookSort, setBookSort] = useState<LibraryBookSort>("updated");
  const [editor, setEditor] = useState<{ material?: MaterialPayload; versionOf?: MaterialPayload } | null>(null);
  const [editorError, setEditorError] = useState("");
  const [remove, setRemove] = useState<{ material: MaterialPayload; action: "delete" | "uncollect" | "restore" } | null>(null);
  const [removeError, setRemoveError] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const uploaded = useRef<{ file: File; id: string } | null>(null);
  useEffect(() => { if (requestedId) setSelectedId(requestedId); }, [requestedId]);

  const load = useCallback(async () => {
    const run = ++loadRun.current;
    if (mode === "personal" && !session) { setLoading(false); return; }
    setLoading(true);
    setLoadError("");
    try {
      const canManage = managing && session?.user.role === "admin";
      const catalog = mode === "official" ? await (canManage ? listManagedOfficialCatalog(session!, catalogQuery) : listOfficialCatalog({ ...catalogQuery, status: undefined })) : null;
      const result = catalog ? catalog.items : await listLibraryMaterials(session!);
      if (run !== loadRun.current) return;
      if (catalog) {
        setCatalogTotal(catalog.total); setCategories(catalog.categories);
        const lastPage = Math.max(1, Math.ceil(catalog.total / catalogQuery.pageSize));
        if (catalogQuery.page > lastPage) { setCatalogQuery((current) => ({ ...current, page: lastPage })); return; }
      }
      setItems(result);
      setSelectedId((current) => result.some((item) => item.id === current) || current === requestedId && Boolean(requestedId) ? current : result[0]?.id || "");
      if (mode === "official" && session) {
        try {
          const personal = await listLibraryMaterials(session);
          if (run !== loadRun.current) return;
          setCollectedIds(personal.filter((item) => item.libraryScope === "official").map((item) => item.id));
        } catch (error) {
          if (run !== loadRun.current) return;
          setMessage(errorText(error, "个人收藏状态读取失败，请刷新后重试。"));
        }
      } else {
        setCollectedIds(result.filter((item) => item.libraryScope === "official" || item.isCollected).map((item) => item.id));
      }
    } catch (error) {
      if (run !== loadRun.current) return;
      setLoadError(errorText(error, "读取资料失败，请重试。"));
    } finally { if (run === loadRun.current) setLoading(false); }
  }, [mode, session, managing, catalogQuery, requestedId]);

  useEffect(() => { void load(); return () => { loadRun.current++; }; }, [load]);
  useEffect(() => {
    setLinkedDocument(null); setSelectionError("");
    if (mode !== "official" || loading || !requestedId || selectedId !== requestedId || items.some((item) => item.id === requestedId)) return;
    let active = true;
    const management = managing && session?.user.role === "admin";
    const detail = management ? getManagedOfficialMaterial(session!, requestedId) : getPublicOfficialMaterial(requestedId);
    void detail.then((item) => {
      if (!active) return;
      if (item.libraryScope !== "official" || !management && item.status !== "approved") throw new Error("指定官方资料当前不可访问。");
      setLinkedDocument(item);
    }).catch((cause: unknown) => { if (active) setSelectionError(errorText(cause, "指定官方资料不可访问，请在列表中重新选择。")); });
    return () => { active = false; };
  }, [mode, loading, requestedId, selectedId, items, managing, session]);
  const visibleItems = useMemo(() => {
    if (mode === "official") return items;
    const filtered = filterLibraryDocuments(items, keyword, folder);
    return sortLibraryBooks(filtered.filter((book) => readingFilter === "all" || getLibraryReadingState(book).kind === readingFilter), bookSort);
  }, [items, keyword, folder, readingFilter, bookSort, mode]);
  const selected = visibleItems.find((item) => item.id === selectedId) || (linkedDocument?.id === selectedId ? linkedDocument : null) || (!selectedId ? visibleItems[0] : null) || null;
  const folders = [...new Set(items.map((item) => item.folderName || "").filter(Boolean))].sort();

  function changeCatalog(patch: Partial<OfficialCatalogQuery>) {
    setSelectedId(""); setCatalogQuery((current) => ({ ...current, ...patch, page: patch.page || 1 }));
  }
  function toggleManagement() { setManaging((value) => !value && session?.user.role === "admin"); setSelectedId(""); setCatalogQuery((current) => ({ ...current, page: 1 })); setEditor(null); }

  function startEditor(material?: MaterialPayload) {
    uploaded.current = null;
    setEditorError("");
    setEditor({ material });
  }

  function startVersion(material: MaterialPayload) {
    if (mode !== "official" || session?.user.role !== "admin") return;
    uploaded.current = null; setEditorError(""); setEditor({ versionOf: material });
  }

  async function save(draft: LibraryDocumentDraft, file: File | null) {
    if (!session || !editor) return;
    setBusy("save");
    setEditorError("");
    try {
      let attachmentFileId = editor.material?.attachmentFileId || "";
      if (editor.versionOf && (!draft.changeSummary?.trim() || draft.changeSummary.trim().length > 500)) throw new Error("请填写版本更新说明（最多500字）。");
      if (!editor.material) {
        if (!file) throw new Error("请选择 PDF 文件。");
        await validatePdfUpload(file);
        if (!uploaded.current || uploaded.current.file !== file) {
          const result = await uploadFile(session, file);
          uploaded.current = { file, id: result.id };
        }
        attachmentFileId = uploaded.current.id;
      }
      const input = {
        title: draft.title.trim(), description: draft.description.trim(), category: draft.category.trim(),
        tags: [...new Set(draft.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))],
        folderName: draft.folderName.trim(), attachmentFileId,
        ...(mode === "official" ? { materialType: draft.materialType, author: draft.author?.trim(), sourceUrl: draft.sourceUrl?.trim(), publicationYear: draft.publicationYear ? Number(draft.publicationYear) : 0, edition: draft.edition?.trim(), licenseStatus: draft.licenseStatus } : {})
      };
      const result = editor.versionOf ? await createOfficialVersion(session, editor.versionOf.id, { ...input, changeSummary: draft.changeSummary!.trim() }) : editor.material
        ? await (mode === "official" ? updateOfficialMaterial : updateLibraryMaterial)(session, editor.material.id, input)
        : await (mode === "official" ? createOfficialMaterial : createLibraryMaterial)(session, input);
      setItems((current) => {
        const previous = current.find((item) => item.id === result.id);
        const saved = { ...result, readingProgress: result.readingProgress ?? previous?.readingProgress };
        return [saved, ...current.filter((item) => item.id !== result.id)];
      });
      setSelectedId(result.id);
      setKeyword("");
      setFolder("");
      setReadingFilter("all");
      setEditor(null);
      uploaded.current = null;
      if (mode === "official") setCatalogQuery((current) => ({ ...current, page: 1, q: "", category: "", materialType: "", sort: "updated", status: "all" }));
      setMessage(mode === "official" ? editor.versionOf ? "官方资料新版已发布，旧版学习记录保持不变。" : editor.material ? "官方资料信息已保存。" : "官方资料已发布。" : "资料已私有保存，可以立即开始阅读。");
    } catch (error) { setEditorError(errorText(error, "保存失败，请重试。")); }
    finally { setBusy(""); setStorageRevision((value) => value + 1); }
  }

  async function collect(material: MaterialPayload) {
    if (!session) return;
    setBusy("collect");
    setMessage("");
    try {
      await collectOfficialMaterial(session, material.id);
      setCollectedIds((current) => [...new Set([...current, material.id])]);
      setMessage("已加入个人知识库，原文件仍由官方维护。");
    } catch (error) { setMessage(errorText(error, "加入知识库失败，请重试。")); }
    finally { setBusy(""); }
  }

  function requestRemove(material: MaterialPayload, action: "delete" | "uncollect" | "restore") {
    setRemoveError("");
    setArchiveReason("");
    setRemove({ material, action });
  }

  async function confirmRemove() {
    if (!remove || !session) return;
    setBusy("remove");
    setRemoveError("");
    try {
      if (remove.action === "uncollect") {
        await uncollectOfficialMaterial(session, remove.material.id);
        setCollectedIds((current) => current.filter((id) => id !== remove.material.id));
        if (mode === "personal") setItems((current) => current.filter((item) => item.id !== remove.material.id));
      } else {
        if (mode === "official") {
          if (remove.action !== "restore" && !archiveReason.trim()) throw new Error("请填写下架原因。");
          await transitionOfficialMaterial(session, remove.material.id, { status: remove.action === "restore" ? "approved" : "archived", reason: archiveReason.trim() });
          await load();
        } else { await deleteLibraryMaterial(session, remove.material.id); setItems((current) => current.filter((item) => item.id !== remove.material.id)); }
      }
      setMessage(remove.action === "uncollect" ? "已移出个人知识库，官方原资料与个人学习记录保留。" : mode === "official" ? remove.action === "restore" ? "官方资料已重新上架。" : "官方资料已下架。" : "资料已从个人知识库删除。");
      setRemove(null);
    } catch (error) { setRemoveError(errorText(error, "操作失败，请重试。")); }
    finally { setBusy(""); }
  }

  async function download(material: MaterialPayload) {
    if (!session) return;
    setBusy("download");
    setMessage("");
    try { await downloadLibraryMaterial(session, material); }
    catch (error) { setMessage(errorText(error, "下载失败，请重试。")); }
    finally { setBusy(""); }
  }

  return {
    items, visibleItems, selected, collectedIds, loading, loadError, message, busy, storageRevision,
    catalogQuery, changeCatalog, catalogTotal, categories, managing: managing && session?.user.role === "admin", toggleManagement, archiveReason, setArchiveReason,
    selectionError,
    keyword, setKeyword, folder, setFolder, folders, readingFilter, setReadingFilter, bookSort, setBookSort, editor, setEditor, editorError, remove, setRemove, removeError,
    setSelectedId, load, startEditor, startVersion, save, collect, requestRemove, confirmRemove, download
  };
}
