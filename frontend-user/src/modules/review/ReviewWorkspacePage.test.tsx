import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByText("1 张待复习")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /显示答案/ }));
    expect(screen.getAllByText("节点和关系。").length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: "Good" }));

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
});
