import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDeck,
  createDeckCard,
  getTodayReviewQueue,
  listDeckCards,
  listDecks,
  reviewCard
} from "../../api/client";
import type { AuthSession } from "../../api/client";
import { ReviewWorkspacePage } from "./ReviewWorkspacePage";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    createDeck: vi.fn(),
    createDeckCard: vi.fn(),
    getTodayReviewQueue: vi.fn(),
    listDeckCards: vi.fn(),
    listDecks: vi.fn(),
    reviewCard: vi.fn()
  };
});

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const listDecksMock = vi.mocked(listDecks);
const listDeckCardsMock = vi.mocked(listDeckCards);
const getTodayReviewQueueMock = vi.mocked(getTodayReviewQueue);
const reviewCardMock = vi.mocked(reviewCard);

describe("ReviewWorkspacePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(createDeck).mockReset();
    vi.mocked(createDeckCard).mockReset();
    listDecksMock.mockReset();
    listDeckCardsMock.mockReset();
    getTodayReviewQueueMock.mockReset();
    reviewCardMock.mockReset();

    listDecksMock.mockResolvedValue([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "期末复习",
        description: "高频概念",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listDeckCardsMock.mockResolvedValue([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "什么是图谱？",
        back: "节点和关系。",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 1,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "什么是图谱？",
            back: "节点和关系。",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });
    reviewCardMock.mockResolvedValue({
      reviewId: "review-1",
      schedule: {
        cardId: "card-1",
        userId: "user-1",
        dueAt: "2026-06-03T12:00:00Z",
        intervalDays: 1,
        easeFactor: 2.5,
        repetitionCount: 1,
        lapseCount: 0,
        state: "review",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    });
  });

  it("shows the due card and writes back a review rating", async () => {
    const user = userEvent.setup();
    render(<ReviewWorkspacePage session={session} />);

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
    expect(within(screen.getByLabelText("复习进度")).getByText(/到期/)).toHaveTextContent("1 到期");

    await user.click(screen.getByRole("button", { name: /显示答案/ }));
    expect(screen.getAllByText("节点和关系。").length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: "Good 记得" }));

    await waitFor(() => {
      expect(reviewCardMock).toHaveBeenCalledWith(
        session,
        "card-1",
        expect.objectContaining({
          rating: "good"
        })
      );
    });
    expect(await screen.findByText(/已记录复习，下次/)).toBeInTheDocument();
    expect(screen.getByText("今天的队列已经清空")).toBeInTheDocument();
  });

  it("renders the shared error state when the initial review workspace bootstrap fails", async () => {
    listDecksMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));

    render(<ReviewWorkspacePage session={session} />);

    expect(await screen.findByRole("heading", { level: 2, name: "复习工作台暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("复习工作台加载失败")).toBeInTheDocument();
  });

  it("keeps rendering the current card while surfacing a shared stale state after refresh fails", async () => {
    const user = userEvent.setup();
    render(<ReviewWorkspacePage session={session} />);

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();

    listDecksMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));

    await user.click(screen.getByRole("button", { name: /刷新/ }));

    expect(await screen.findByRole("heading", { level: 2, name: "复习队列需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("复习队列刷新失败")).toBeInTheDocument();
    expect(screen.getByText("什么是图谱？")).toBeInTheDocument();
  });

  it("uses the shared select when creating a deck from review management", async () => {
    vi.mocked(createDeck).mockResolvedValueOnce({
      id: "deck-2",
      ownerUserId: "user-1",
      title: "Public deck",
      description: "Shared deck",
      visibility: "public",
      cardCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    const user = userEvent.setup();
    render(<ReviewWorkspacePage session={session} />);

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开卡组管理" }));
    await user.click(screen.getByRole("button", { name: "新建" }));

    const visibilitySelect = screen.getByRole("combobox");
    expect(visibilitySelect).toHaveClass("ds-select");

    await user.type(screen.getByLabelText("卡组标题"), "Public deck");
    await user.selectOptions(visibilitySelect, "public");
    await user.click(screen.getByRole("button", { name: /创建卡组/ }));

    await waitFor(() => {
      expect(vi.mocked(createDeck)).toHaveBeenCalledWith(
        session,
        expect.objectContaining({
          title: "Public deck",
          visibility: "public"
        })
      );
    });
  });
});
