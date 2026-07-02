import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthSession,
  SearchGroupPayload,
  SearchResponsePayload,
  SearchResultType,
  searchAll
} from "../../api/client";

const searchGroupOrder: SearchResultType[] = ["material", "post", "note", "graph", "card"];

const groupLabels: Record<SearchResultType, string> = {
  material: "资料",
  post: "社区",
  note: "笔记",
  graph: "图谱",
  card: "卡片"
};

const searchFetchLimit = 12;
const groupPageSize = 4;

function normalizeSearchTypes(raw: string | null): SearchResultType[] {
  if (!raw) {
    return [];
  }

  const allowed = new Set<SearchResultType>(searchGroupOrder);
  const seen = new Set<SearchResultType>();
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is SearchResultType => allowed.has(value as SearchResultType))
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

function useSearchState() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      keyword: params.get("q")?.trim() ?? "",
      selectedTypes: normalizeSearchTypes(params.get("types"))
    };
  }, [location.search]);
}

function emptySearchResponse(query: string): SearchResponsePayload {
  return {
    query,
    total: 0,
    groups: searchGroupOrder.map((type) => ({
      type,
      count: 0,
      results: []
    }))
  };
}

export function SearchWorkspacePage(props: { session: AuthSession | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { keyword, selectedTypes } = useSearchState();
  const [payload, setPayload] = useState<SearchResponsePayload>(() => emptySearchResponse(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("输入关键词后开始搜索。");
  const [groupPages, setGroupPages] = useState<Partial<Record<SearchResultType, number>>>({});

  const filterSummary = selectedTypes.length
    ? selectedTypes.map((type) => groupLabels[type]).join(" / ")
    : "全部类型";

  useEffect(() => {
    setGroupPages({});
  }, [keyword, selectedTypes]);

  useEffect(() => {
    let canceled = false;

    async function runSearch() {
      if (!keyword) {
        setLoading(false);
        setPayload(emptySearchResponse(""));
        setMessage("在顶部搜索框输入关键词并按回车。");
        return;
      }

      setLoading(true);
      setMessage(
        selectedTypes.length
          ? `正在搜索 ${filterSummary} 结果。`
          : "正在搜索资料、社区，以及你可访问的笔记、图谱和卡片。"
      );
      try {
        const nextPayload = await searchAll(props.session, {
          query: keyword,
          types: selectedTypes.length ? selectedTypes : undefined,
          limit: searchFetchLimit
        });
        if (canceled) {
          return;
        }
        setPayload(nextPayload);
        setMessage(`搜索完成，共 ${nextPayload.total} 条结果。`);
      } catch (error) {
        if (canceled) {
          return;
        }
        setPayload(emptySearchResponse(keyword));
        setMessage(error instanceof Error ? error.message : "搜索失败");
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    void runSearch();
    return () => {
      canceled = true;
    };
  }, [filterSummary, keyword, props.session, selectedTypes]);

  const groups = payload.groups.length ? payload.groups : emptySearchResponse(keyword).groups;

  function handleTypeFilter(nextTypes: SearchResultType[]) {
    const params = new URLSearchParams(location.search);
    if (keyword) {
      params.set("q", keyword);
    } else {
      params.delete("q");
    }

    if (nextTypes.length) {
      params.set("types", nextTypes.join(","));
    } else {
      params.delete("types");
    }

    navigate({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : ""
    });
  }

  function handleTypeToggle(type: SearchResultType) {
    const isOnlyCurrentType = selectedTypes.length === 1 && selectedTypes[0] === type;
    handleTypeFilter(isOnlyCurrentType ? [] : [type]);
  }

  function handleGroupPageChange(type: SearchResultType, nextPage: number) {
    setGroupPages((current) => ({
      ...current,
      [type]: nextPage
    }));
  }

  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">全站搜索</p>
          <h1>{keyword ? `"${keyword}"` : "输入关键词开始搜索"}</h1>
          <p className="header-copy">
            v1 搜索通过后端 MySQL fallback 返回分组结果；登录后会附带你的私有笔记、图谱和卡片。
          </p>
        </div>
      </header>

      <div className="search-workspace">
        <section className="section-frame">
          <div className="section-frame-head">
            <div>
              <p className="eyebrow">结果概览</p>
              <h2>{loading ? "加载中" : `${payload.total} 条结果`}</h2>
            </div>
          </div>
          <p className="panel-copy">{message}</p>
          <div className="search-filter-rail">
            <div aria-label="搜索类型筛选" className="chip-row" role="group">
              <button
                aria-pressed={selectedTypes.length === 0}
                className={selectedTypes.length === 0 ? "filter-chip active" : "filter-chip"}
                onClick={() => handleTypeFilter([])}
                type="button"
              >
                全部类型
              </button>
              {searchGroupOrder.map((type) => (
                <button
                  aria-pressed={selectedTypes.includes(type)}
                  className={selectedTypes.includes(type) ? "filter-chip active" : "filter-chip"}
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  type="button"
                >
                  {groupLabels[type]}
                </button>
              ))}
            </div>
            <p className="panel-copy">
              当前筛选：{filterSummary}。每组当前批次最多拉取 {searchFetchLimit} 条，并按每页 {groupPageSize} 条切换。
            </p>
          </div>
        </section>

        {keyword && !loading && payload.total === 0 ? (
          <section className="section-frame">
            <div className="section-frame-head">
              <div>
                <p className="eyebrow">空结果</p>
                <h2>当前筛选没有命中结果</h2>
              </div>
            </div>
            <p className="panel-copy">可以尝试缩短关键词，或者切回“全部类型”重新搜索。</p>
          </section>
        ) : null}

        <section className="search-section-grid">
          {groups.map((group: SearchGroupPayload) => (
            <SearchGroupSection
              currentPage={groupPages[group.type] ?? 1}
              group={group}
              key={group.type}
              keyword={keyword}
              onPageChange={handleGroupPageChange}
            />
          ))}
        </section>
      </div>
    </>
  );
}

function SearchGroupSection(props: {
  group: SearchGroupPayload;
  keyword: string;
  currentPage: number;
  onPageChange: (type: SearchResultType, nextPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(props.group.results.length / groupPageSize));
  const currentPage = Math.min(props.currentPage, totalPages);
  const visibleResults = props.group.results.slice((currentPage - 1) * groupPageSize, currentPage * groupPageSize);

  return (
    <article className="section-frame slim">
      <div className="section-frame-head">
        <div>
          <p className="eyebrow">{groupLabels[props.group.type]}</p>
          <h2>{props.group.count}</h2>
        </div>
      </div>
      <div className="search-result-list">
        {visibleResults.map((item) => (
          <Link className="search-result-card" key={`${item.type}:${item.id}`} to={item.url}>
            <strong>{item.title}</strong>
            <span>{item.source}</span>
            <p>{item.summary}</p>
          </Link>
        ))}
        {props.keyword && props.group.results.length === 0 ? <p className="panel-copy">暂无匹配结果。</p> : null}
      </div>
      {totalPages > 1 ? (
        <div className="search-pagination">
          <p className="panel-copy">{`第 ${currentPage} / ${totalPages} 页`}</p>
          <div className="search-pagination-controls">
            <button
              aria-label={`${groupLabels[props.group.type]}上一页`}
              className="filter-chip"
              disabled={currentPage <= 1}
              onClick={() => props.onPageChange(props.group.type, Math.max(1, currentPage - 1))}
              type="button"
            >
              上一页
            </button>
            <button
              aria-label={`${groupLabels[props.group.type]}下一页`}
              className="filter-chip"
              disabled={currentPage >= totalPages}
              onClick={() => props.onPageChange(props.group.type, Math.min(totalPages, currentPage + 1))}
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
