import { useState, type FormEvent } from "react";
import type { MaterialPayload } from "../../api/client";
import { createDocumentDraft, materialTypeLabels, licenseStatusLabels, type LibraryDocumentDraft, type LibraryMode } from "./libraryDocument";

export function LibraryDocumentEditor(props: {
  mode: LibraryMode;
  material?: MaterialPayload;
  versionOf?: MaterialPayload;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onSave: (draft: LibraryDocumentDraft, file: File | null) => void;
}) {
  const [draft, setDraft] = useState(() => props.versionOf ? { ...createDocumentDraft(props.versionOf), edition: "", changeSummary: "" } : createDocumentDraft(props.material));
  const [file, setFile] = useState<File | null>(null);
  const editing = Boolean(props.material);
  function setField<Field extends keyof LibraryDocumentDraft>(field: Field, value: LibraryDocumentDraft[Field]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }
  function selectFile(next: File | null) {
    setFile(next);
    if (!next) return;
    setDraft((current) => ({
      ...current,
      title: current.title || next.name.replace(/\.[^.]+$/, ""),
      description: current.description || `用于阅读与学习的资料：${next.name}`
    }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    props.onSave(draft, file);
  }
  return (
    <section className="library-editor" aria-label={editing ? "编辑资料信息" : "上传资料表单"}>
      <h2>{props.versionOf ? "发布官方资料新版" : editing ? "编辑资料信息" : props.mode === "official" ? "发布官方资料" : "上传到个人知识库"}</h2>
      <p>{props.mode === "official" ? "发布后可在官方资料库浏览。请确认资料来源与传播授权。" : "仅自己可见，保存后即可阅读，无需提交审核。"}</p>
      {props.versionOf ? <p>为《{props.versionOf.title}》上传新的 PDF。旧版原件、批注、笔记、阅读进度与收藏保留，不自动迁移。</p> : null}
      <form className="form-stack" onSubmit={submit}>
        {!editing ? <label>选择文件<input accept=".pdf,application/pdf" aria-label="选择文件" disabled={props.busy} onChange={(event) => selectFile(event.target.files?.[0] || null)} type="file" /><small>仅支持 PDF，单个文件不超过 50 MiB；上传时将检查文件内容。</small></label> : <p>原文件保持不变，避免已保存的批注与页码错位。</p>}
        <label>资料标题<input disabled={props.busy} maxLength={200} minLength={4} onChange={(event) => setField("title", event.target.value)} required value={draft.title} /></label>
        <label>资料简介<textarea disabled={props.busy} minLength={10} onChange={(event) => setField("description", event.target.value)} required rows={3} value={draft.description} /></label>
        <label>分类<input disabled={props.busy} maxLength={64} minLength={2} onChange={(event) => setField("category", event.target.value)} required value={draft.category} /></label>
        {props.versionOf ? <label>版本更新说明<textarea required minLength={1} maxLength={500} disabled={props.busy} value={draft.changeSummary} onChange={(event) => setField("changeSummary", event.target.value)} rows={3} /></label> : null}
        {props.mode === "official" ? <fieldset className="official-metadata-fields" disabled={props.busy}><legend>来源与出版信息</legend>
          <label>资料类型<select aria-label="资料类型" value={draft.materialType} onChange={(event) => setField("materialType", event.target.value as LibraryDocumentDraft["materialType"])}>{Object.entries(materialTypeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>作者／机构<input maxLength={200} value={draft.author} onChange={(event) => setField("author", event.target.value)} /></label>
          <label>来源链接<input type="url" maxLength={2048} pattern="https?://.+" placeholder="https://" value={draft.sourceUrl} onChange={(event) => setField("sourceUrl", event.target.value)} /></label>
          <label>出版年份<input type="number" min={1000} max={new Date().getFullYear() + 1} value={draft.publicationYear} onChange={(event) => setField("publicationYear", event.target.value)} /></label>
          <label>版本说明<input maxLength={120} value={draft.edition} onChange={(event) => setField("edition", event.target.value)} /></label>
          <label>授权状态<select aria-label="授权状态" value={draft.licenseStatus} onChange={(event) => setField("licenseStatus", event.target.value as LibraryDocumentDraft["licenseStatus"])}>{Object.entries(licenseStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </fieldset> : null}
        {props.mode === "personal" ? <label>文件夹<input disabled={props.busy} maxLength={120} onChange={(event) => setField("folderName", event.target.value)} placeholder="如：数据结构课程" value={draft.folderName} /></label> : null}
        <label>标签<input disabled={props.busy} onChange={(event) => setField("tags", event.target.value)} placeholder="用逗号分隔" value={draft.tags} /></label>
        {file ? <p className="muted-copy">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p> : null}
        {props.error ? <p role="alert">{props.error}</p> : null}
        <div className="detail-actions">
          <button className="primary-button" disabled={props.busy} type="submit">{props.busy ? "保存中…" : props.versionOf ? "确认发布新版" : editing ? "保存资料信息" : props.mode === "official" ? "确认发布" : "上传并保存"}</button>
          <button className="secondary-button" disabled={props.busy} onClick={props.onCancel} type="button">取消</button>
        </div>
      </form>
    </section>
  );
}
