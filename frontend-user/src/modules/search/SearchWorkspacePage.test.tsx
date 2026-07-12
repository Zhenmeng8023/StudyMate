import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { searchAll } from "../../api/client";
import type { AuthSession, SearchResponsePayload, SearchResultPayload, SearchResultType } from "../../api/client";
import { SearchWorkspacePage } from "./SearchWorkspacePage";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    searchAll: vi.fn()
  };
});

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-07-01T08:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const searchAllMock = vi.mocked(searchAll);

function buildResult(type: SearchResultType, index: number): SearchResultPayload {
  return {
    type,
    id: `${type}-${index}`,
    title: `${type}-title-${index}`,
    summary: `${type}-summary-${index}`,
    url: `/${type}/${index}`,
    source: type === "post" ? "community" : type
  };
}

function buildResponse(input?: Partial<Record<SearchResultType, SearchResultPayload[]>>): SearchResponsePayload {
  const orderedTypes: SearchResultType[] = ["material", "post", "note", "graph", "card"];
  return {
    query: "\u56fe\u8c31",
    total: orderedTypes.reduce((sum, type) => sum + (input?.[type]?.length ?? 0), 0),
    groups: orderedTypes.map((type) => {
      const results = input?.[type] ?? [];
      return {
        type,
        count: results.length,
        returnedCount: results.length,
        results
      };
    })
  };
}

function buildResponseWithCounts(input: Partial<Record<SearchResultType, { count: number; results: SearchResultPayload[] }>>): SearchResponsePayload {
  const orderedTypes: SearchResultType[] = ["material", "post", "note", "graph", "card"];
  return {
    query: "\u56fe\u8c31",
    total: orderedTypes.reduce((sum, type) => sum + (input[type]?.count ?? 0), 0),
    groups: orderedTypes.map((type) => {
      const group = input[type];
      return {
        type,
        count: group?.count ?? 0,
        returnedCount: group?.results.length ?? 0,
        results: group?.results ?? []
      };
    })
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPage(entry: string, nextSession: AuthSession | null = session) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          element={
            <>
              <LocationProbe />
              <SearchWorkspacePage session={nextSession} />
            </>
          }
          path="/search"
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("SearchWorkspacePage", () => {
  beforeEach(() => {
    searchAllMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the empty prompt when no query is provided", () => {
    const { container } = renderPage("/search");

    expect(screen.getByRole("heading", { level: 1, name: "\u8f93\u5165\u5173\u952e\u8bcd\u5f00\u59cb\u641c\u7d22" })).toBeInTheDocument();
    expect(screen.getByText("\u5728\u9876\u90e8\u641c\u7d22\u6846\u8f93\u5165\u5173\u952e\u8bcd\u5e76\u6309\u56de\u8f66\u3002")).toBeInTheDocument();
    expect(container.querySelector(".workspace-header")).not.toBeNull();
    expect(searchAllMock).not.toHaveBeenCalled();
  });

  it("renders the shared loading state while a query is in flight", () => {
    searchAllMock.mockImplementation(() => new Promise(() => undefined));

    renderPage("/search?q=%E5%9B%BE%E8%B0%B1");

    expect(screen.getByRole("heading", { level: 2, name: "\u6b63\u5728\u641c\u7d22\u5168\u7ad9\u5185\u5bb9" })).toBeInTheDocument();
    expect(screen.getByText("\u8bf7\u7a0d\u5019\uff0c\u6b63\u5728\u6309\u5f53\u524d\u5173\u952e\u8bcd\u805a\u5408\u53ef\u8bbf\u95ee\u7684\u5b66\u4e60\u8d44\u4ea7\u3002")).toBeInTheDocument();
  });

  it("shows the backend error message when search fails", async () => {
    searchAllMock.mockRejectedValueOnce(new Error("\u641c\u7d22\u670d\u52a1\u6682\u4e0d\u53ef\u7528"));

    renderPage("/search?q=%E5%9B%BE%E8%B0%B1");

    await expect(screen.findByRole("heading", { level: 2, name: "\u641c\u7d22\u6682\u65f6\u4e0d\u53ef\u7528" })).resolves.toBeInTheDocument();
    await expect(screen.findByText("\u641c\u7d22\u670d\u52a1\u6682\u4e0d\u53ef\u7528")).resolves.toBeInTheDocument();
    expect(searchAllMock).toHaveBeenCalledWith(session, { query: "\u56fe\u8c31", limit: 12 });
  });

  it("syncs type filters into the URL and forwards them to the search API", async () => {
    const user = userEvent.setup();
    searchAllMock.mockResolvedValue(buildResponse({ graph: [buildResult("graph", 1)] }));

    renderPage("/search?q=%E5%9B%BE%E8%B0%B1");

    await waitFor(() => {
      expect(searchAllMock).toHaveBeenCalledWith(session, { query: "\u56fe\u8c31", limit: 12 });
    });

    searchAllMock.mockClear();
    await user.click(screen.getByRole("button", { name: "\u56fe\u8c31" }));

    await waitFor(() => {
      expect(searchAllMock).toHaveBeenCalledWith(session, { query: "\u56fe\u8c31", types: ["graph"], limit: 12 });
    });
    expect(screen.getByTestId("location-search")).toHaveTextContent("?q=%E5%9B%BE%E8%B0%B1&types=graph");
  });

  it("renders source links and paginates the current result batch per group", async () => {
    const user = userEvent.setup();
    searchAllMock.mockResolvedValue(
      buildResponse({
        graph: [
          buildResult("graph", 1),
          buildResult("graph", 2),
          buildResult("graph", 3),
          buildResult("graph", 4),
          buildResult("graph", 5)
        ]
      })
    );

    renderPage("/search?q=%E5%9B%BE%E8%B0%B1&types=graph");

    await expect(screen.findByRole("link", { name: /graph-title-1/ })).resolves.toHaveAttribute("href", "/graph/1");
    expect(screen.getByRole("link", { name: /graph-title-4/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /graph-title-5/ })).not.toBeInTheDocument();
    expect(screen.getByText("\u7b2c 1 / 2 \u9875")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "\u56fe\u8c31\u4e0b\u4e00\u9875" }));

    expect(await screen.findByRole("link", { name: /graph-title-5/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /graph-title-1/ })).not.toBeInTheDocument();
    expect(screen.getByText("\u7b2c 2 / 2 \u9875")).toBeInTheDocument();
  });

  it("explains when only the first returned batch of a larger group is currently visible", async () => {
    searchAllMock.mockResolvedValue(
      buildResponseWithCounts({
        graph: {
          count: 9,
          results: [
            buildResult("graph", 1),
            buildResult("graph", 2),
            buildResult("graph", 3),
            buildResult("graph", 4),
            buildResult("graph", 5)
          ]
        }
      })
    );

    renderPage("/search?q=%E5%9B%BE%E8%B0%B1&types=graph");

    await expect(screen.findByText("9")).resolves.toBeInTheDocument();
    expect(screen.getByText("\u5f53\u524d\u4ec5\u5c55\u793a\u9996\u6279 5 / 9 \u6761\u7ed3\u679c\u3002")).toBeInTheDocument();
  });
});
