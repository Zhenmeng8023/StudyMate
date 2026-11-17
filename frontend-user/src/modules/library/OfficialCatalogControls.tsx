import type { OfficialCatalogQuery } from "../../api/library";
import { materialTypeLabels } from "./libraryDocument";

export function OfficialCatalogControls({ query, categories, total, loading, managing, onChange }: {
  query: OfficialCatalogQuery; categories: string[]; total: number; loading: boolean; managing: boolean; onChange: (patch: Partial<OfficialCatalogQuery>) => void;
}) {
  return <>
    <div className="official-catalog-filters">
      <label>搜索官方资料<input type="search" value={query.q || ""} maxLength={200} placeholder="标题、作者、简介或标签" onChange={(event) => onChange({ q: event.target.value })} /></label>
      <label>分类筛选<select value={query.category || ""} onChange={(event) => onChange({ category: event.target.value })}><option value="">全部分类</option>{[...new Set([...(query.category ? [query.category] : []), ...categories])].map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>类型筛选<select value={query.materialType || ""} onChange={(event) => onChange({ materialType: event.target.value })}><option value="">全部类型</option>{Object.entries(materialTypeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label>资料排序<select value={query.sort} onChange={(event) => onChange({ sort: event.target.value as OfficialCatalogQuery["sort"] })}><option value="updated">最近更新</option><option value="title">标题排序</option></select></label>
      {managing ? <label>发布状态筛选<select value={query.status} onChange={(event) => onChange({ status: event.target.value as OfficialCatalogQuery["status"] })}><option value="all">全部状态</option><option value="approved">已发布</option><option value="archived">已下架</option><option value="hidden">历史隐藏</option></select></label> : null}
    </div>
    <div className="official-catalog-pagination" aria-label="资料分页"><span>共 {total} 份资料 · 第 {query.page} / {Math.max(1, Math.ceil(total / query.pageSize))} 页</span>
      <button className="ghost-button" type="button" aria-label="上一页资料" disabled={loading || query.page <= 1} onClick={() => onChange({ page: query.page - 1 })}>上一页</button>
      <button className="ghost-button" type="button" aria-label="下一页资料" disabled={loading || query.page * query.pageSize >= total} onClick={() => onChange({ page: query.page + 1 })}>下一页</button></div>
  </>;
}
