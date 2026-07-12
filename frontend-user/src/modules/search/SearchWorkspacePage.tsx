import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthSession,
  SearchGroupPayload,
  SearchResponsePayload,
  SearchResultType,
  searchAll
} from "../../api/client";
import { DataState } from "../../design-system/primitives";

const searchGroupOrder: SearchResultType[] = ["material", "post", "note", "graph", "card"];

const groupLabels: Record<SearchResultType, string> = {
  material: "\u8d44\u6599",
  post: "\u793e\u533a",
  note: "\u7b14\u8bb0",
  graph: "\u56fe\u8c31",
  card: "\u5361\u7247"
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
      returnedCount: 0,
      results: []
    }))
  };
}

function buildSearchCompleteMessage(payload: SearchResponsePayload): string {
  const partialGroups = payload.groups.filter((group) => group.count > group.returnedCount && group.returnedCount > 0);
  if (partialGroups.length === 0) {
    return `\u641c\u7d22\u5b8c\u6210\uff0c\u5171 ${payload.total} \u6761\u7ed3\u679c\u3002`;
  }

  return `\u641c\u7d22\u5b8c\u6210\uff0c\u5171 ${payload.total} \u6761\u7ed3\u679c\u3002\u90e8\u5206\u5206\u7ec4\u5f53\u524d\u4ec5\u5c55\u793a\u9996\u6279\u5185\u5bb9\uff0c\u53ef\u7ee7\u7eed\u7f29\u5c0f\u5173\u952e\u8bcd\u6216\u5207\u6362\u7c7b\u578b\u67e5\u770b\u3002`;
}

export function SearchWorkspacePage(props: { session: AuthSession | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { keyword, selectedTypes } = useSearchState();
  const [payload, setPayload] = useState<SearchResponsePayload>(() => emptySearchResponse(""));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("\u8f93\u5165\u5173\u952e\u8bcd\u540e\u5f00\u59cb\u641c\u7d22\u3002");
  const [groupPages, setGroupPages] = useState<Partial<Record<SearchResultType, number>>>({});

  const filterSummary = selectedTypes.length
    ? selectedTypes.map((type) => groupLabels[type]).join(" / ")
    : "\u5168\u90e8\u7c7b\u578b";

  useEffect(() => {
    setGroupPages({});
  }, [keyword, selectedTypes]);

  useEffect(() => {
    let canceled = false;

    async function runSearch() {
      if (!keyword) {
        setLoading(false);
        setErrorMessage("");
        setPayload(emptySearchResponse(""));
        setMessage("\u5728\u9876\u90e8\u641c\u7d22\u6846\u8f93\u5165\u5173\u952e\u8bcd\u5e76\u6309\u56de\u8f66\u3002");
        return;
      }

      setLoading(true);
      setErrorMessage("");

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
        setErrorMessage("");
        setMessage(buildSearchCompleteMessage(nextPayload));
      } catch (error) {
        if (canceled) {
          return;
        }

        setPayload(emptySearchResponse(keyword));
        setErrorMessage(error instanceof Error ? error.message : "\u641c\u7d22\u5931\u8d25");
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
  const searchState = useMemo(() => {
    if (!keyword) {
      return {
        kind: "empty" as const,
        title: "\u8f93\u5165\u5173\u952e\u8bcd\u5f00\u59cb\u641c\u7d22",
        description: "\u5728\u9876\u90e8\u641c\u7d22\u6846\u8f93\u5165\u5173\u952e\u8bcd\u5e76\u6309\u56de\u8f66\u3002"
      };
    }

    if (loading) {
      return {
        kind: "loading" as const,
        title: selectedTypes.length ? `\u6b63\u5728\u641c\u7d22 ${filterSummary}` : "\u6b63\u5728\u641c\u7d22\u5168\u7ad9\u5185\u5bb9",
        description: selectedTypes.length
          ? `\u8bf7\u7a0d\u5019\uff0c\u6b63\u5728\u6309\u5f53\u524d\u7b5b\u9009\u805a\u5408 ${filterSummary} \u7ed3\u679c\u3002`
          : "\u8bf7\u7a0d\u5019\uff0c\u6b63\u5728\u6309\u5f53\u524d\u5173\u952e\u8bcd\u805a\u5408\u53ef\u8bbf\u95ee\u7684\u5b66\u4e60\u8d44\u4ea7\u3002"
      };
    }

    if (errorMessage) {
      return {
        kind: "error" as const,
        title: "\u641c\u7d22\u6682\u65f6\u4e0d\u53ef\u7528",
        description: errorMessage
      };
    }

    if (payload.total === 0) {
      return {
        kind: "empty" as const,
        title: "\u5f53\u524d\u7b5b\u9009\u6ca1\u6709\u547d\u4e2d\u7ed3\u679c",
        description: "\u53ef\u4ee5\u5c1d\u8bd5\u7f29\u77ed\u5173\u952e\u8bcd\uff0c\u6216\u8005\u5207\u56de\u201c\u5168\u90e8\u7c7b\u578b\u201d\u91cd\u65b0\u641c\u7d22\u3002"
      };
    }

    return null;
  }, [errorMessage, filterSummary, keyword, loading, payload.total, selectedTypes.length]);

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
          <p className="eyebrow">\u5168\u7ad9\u641c\u7d22</p>
          <h1>{keyword ? `"${keyword}"` : "\u8f93\u5165\u5173\u952e\u8bcd\u5f00\u59cb\u641c\u7d22"}</h1>
          <p className="header-copy">
            \u6309\u7c7b\u578b\u805a\u5408\u8d44\u6599\u3001\u793e\u533a\u3001\u7b14\u8bb0\u3001\u56fe\u8c31\u548c\u5361\u7247\uff1b\u767b\u5f55\u540e\u4f1a\u5305\u542b\u4f60\u6709\u6743\u9650\u8bbf\u95ee\u7684\u4e2a\u4eba\u5b66\u4e60\u8d44\u4ea7\u3002
          </p>
        </div>
      </header>

      <div className="search-workspace">
        <section className="section-frame">
          <div className="section-frame-head">
            <div>
              <p className="eyebrow">\u7ed3\u679c\u6982\u89c8</p>
              <h2>{searchState ? "\u641c\u7d22\u72b6\u6001" : `${payload.total} \u6761\u7ed3\u679c`}</h2>
            </div>
          </div>
          {searchState ? (
            <DataState description={searchState.description} kind={searchState.kind} title={searchState.title} />
          ) : (
            <p className="panel-copy">{message}</p>
          )}
          {keyword ? (
            <div className="search-filter-rail">
              <div aria-label="\u641c\u7d22\u7c7b\u578b\u7b5b\u9009" className="chip-row" role="group">
                <button
                  aria-pressed={selectedTypes.length === 0}
                  className={selectedTypes.length === 0 ? "filter-chip active" : "filter-chip"}
                  onClick={() => handleTypeFilter([])}
                  type="button"
                >
                  \u5168\u90e8\u7c7b\u578b
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
                \u5f53\u524d\u7b5b\u9009\uff1a{filterSummary}\u3002\u7ed3\u679c\u6309\u5185\u5bb9\u7c7b\u578b\u5206\u7ec4\uff0c\u65b9\u4fbf\u5feb\u901f\u5207\u6362\u56de\u5bf9\u5e94\u5b66\u4e60\u573a\u666f\u3002
              </p>
            </div>
          ) : null}
        </section>

        {!searchState ? (
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
        ) : null}
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
  const hasPartialBatch = props.group.count > props.group.returnedCount;

  return (
    <article className="section-frame slim">
      <div className="section-frame-head">
        <div>
          <p className="eyebrow">{groupLabels[props.group.type]}</p>
          <h2>{props.group.count}</h2>
        </div>
      </div>
      {hasPartialBatch ? (
        <p className="panel-copy">{`\u5f53\u524d\u4ec5\u5c55\u793a\u9996\u6279 ${props.group.returnedCount} / ${props.group.count} \u6761\u7ed3\u679c\u3002`}</p>
      ) : null}
      <div className="search-result-list">
        {visibleResults.map((item) => (
          <Link className="search-result-card" key={`${item.type}:${item.id}`} to={item.url}>
            <strong>{item.title}</strong>
            <span>{item.source}</span>
            <p>{item.summary}</p>
          </Link>
        ))}
        {props.keyword && props.group.results.length === 0 ? <p className="panel-copy">\u6682\u65e0\u5339\u914d\u7ed3\u679c\u3002</p> : null}
      </div>
      {totalPages > 1 ? (
        <div className="search-pagination">
          <p className="panel-copy">{`\u7b2c ${currentPage} / ${totalPages} \u9875`}</p>
          <div className="search-pagination-controls">
            <button
              aria-label={`${groupLabels[props.group.type]}\u4e0a\u4e00\u9875`}
              className="filter-chip"
              disabled={currentPage <= 1}
              onClick={() => props.onPageChange(props.group.type, Math.max(1, currentPage - 1))}
              type="button"
            >
              \u4e0a\u4e00\u9875
            </button>
            <button
              aria-label={`${groupLabels[props.group.type]}\u4e0b\u4e00\u9875`}
              className="filter-chip"
              disabled={currentPage >= totalPages}
              onClick={() => props.onPageChange(props.group.type, Math.min(totalPages, currentPage + 1))}
              type="button"
            >
              \u4e0b\u4e00\u9875
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
