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
    query: "图谱",
    total: orderedTypes.reduce((sum, type) => sum + (input?.[type]?.length ?? 0), 0),
    groups: orderedTypes.map((type) => {
      const results = input?.[type] ?? [];
      return {
        type,
        count: results.length,
        results
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
    renderPage("/search");

    expect(screen.getByRole("heading", { level: 1, name: "输入关键词开始搜索" })).toBeInTheDocument();
    expect(screen.getByText("在顶部搜索框输入关键词并按回车。")).toBeInTheDocument();
    expect(searchAllMock).not.toHaveBeenCalled();
  });

  it("shows the backend error message when search fails", async () => {
    searchAllMock.mockRejectedValueOnce(new Error("搜索服务暂不可用"));

    renderPage("/search?q=图谱");

    await expect(screen.findByText("搜索服务暂不可用")).resolves.toBeInTheDocument();
    expect(searchAllMock).toHaveBeenCalledWith(session, { query: "图谱", limit: 12 });
  });

  it("syncs type filters into the URL and forwards them to the search API", async () => {
    const user = userEvent.setup();
    searchAllMock.mockResolvedValue(buildResponse({ graph: [buildResult("graph", 1)] }));

    renderPage("/search?q=图谱");

    await waitFor(() => {
      expect(searchAllMock).toHaveBeenCalledWith(session, { query: "图谱", limit: 12 });
    });

    searchAllMock.mockClear();
    await user.click(screen.getByRole("button", { name: "图谱" }));

    await waitFor(() => {
      expect(searchAllMock).toHaveBeenCalledWith(session, { query: "图谱", types: ["graph"], limit: 12 });
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

    renderPage("/search?q=图谱&types=graph");

    await expect(screen.findByRole("link", { name: /graph-title-1/ })).resolves.toHaveAttribute("href", "/graph/1");
    expect(screen.getByRole("link", { name: /graph-title-4/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /graph-title-5/ })).not.toBeInTheDocument();
    expect(screen.getByText("第 1 / 2 页")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "图谱下一页" }));

    expect(await screen.findByRole("link", { name: /graph-title-5/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /graph-title-1/ })).not.toBeInTheDocument();
    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
  });
});
