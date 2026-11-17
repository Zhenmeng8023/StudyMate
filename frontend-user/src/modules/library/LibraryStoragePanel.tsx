import { useEffect, useState } from "react";
import type { AuthSession } from "../../api/types";
import { getStorageUsage, type StorageUsage } from "../../api/storage";

export function formatStorageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const unit = bytes >= 1024 ** 3 ? 3 : bytes >= 1024 ** 2 ? 2 : 1;
  return `${Number((bytes / 1024 ** unit).toFixed(2))} ${["B", "KiB", "MiB", "GiB"][unit]}`;
}

export function LibraryStoragePanel({ session, revision }: { session: AuthSession; revision: number }) {
  const [result, setResult] = useState<{ owner: string; usage: StorageUsage } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let current = true;
    setLoading(true); setError("");
    void getStorageUsage(session).then((usage) => { if (current) setResult({ owner: session.user.id, usage }); })
      .catch((cause: unknown) => { if (current) setError(cause instanceof Error ? cause.message : "读取容量失败，请刷新重试。"); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [session.user.id, session.accessToken, revision, refresh]);
  const usage = result?.owner === session.user.id ? result.usage : null;
  return <section className="library-storage" aria-label="存储空间">
    <header><div><strong>存储空间</strong>{loading ? <span role="status">正在更新容量…</span> : null}</div>
      <button className="ghost-button" aria-label="刷新容量" disabled={loading} onClick={() => setRefresh((value) => value + 1)} type="button">刷新容量</button></header>
    {error ? <p role="alert">{error}{usage ? " 当前显示上次读取的数据。" : ""}</p> : null}
    {!usage && loading ? <div className="library-storage-loading" aria-hidden="true" /> : null}
    {usage ? <>
      <div className="library-storage-metrics"><strong>{formatStorageBytes(usage.usedBytes)} / {formatStorageBytes(usage.quotaBytes)}</strong><span>剩余 {formatStorageBytes(usage.remainingBytes)} · {usage.fileCount} 个上传文件</span></div>
      <progress aria-label="存储空间使用率" max={100} value={Math.min(100, usage.usedBytes / usage.quotaBytes * 100)} />
      {!usage.remainingBytes ? <p role="status">容量已用尽，暂时无法上传新文件；已有资料仍可阅读和下载。</p> : null}
      {usage.unlinkedFileCount ? <details><summary>待核查文件（无显式关联）：{usage.unlinkedFileCount} 个 · {formatStorageBytes(usage.unlinkedBytes)}</summary>
        <p>尚未关联资料、封面或模板的上传文件，可能仍被笔记或图谱旧链接引用，不能直接视为可删除文件。这里只展示，不自动清理。</p>
        <ul>{usage.unlinkedFiles.map((file) => <li key={file.id}><span>{file.originalName}</span><small>{formatStorageBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString("zh-CN")}</small></li>)}</ul>
        {usage.unlinkedFileCount > usage.unlinkedFiles.length ? <p>仅展示最近 {usage.unlinkedFiles.length} 个，统计包含全部待核查文件。</p> : null}
      </details> : null}
    </> : null}
    <p className="library-storage-note">容量按本人上传原件计算，包含历史文件、未关联上传及已归档资料；收藏官方资料不重复占用容量。删除资料目前仅归档，不释放存储。单个 PDF 上限为 50 MiB。</p>
  </section>;
}
