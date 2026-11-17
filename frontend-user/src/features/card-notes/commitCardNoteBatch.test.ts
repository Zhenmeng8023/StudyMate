import { describe, expect, it, vi } from "vitest";
import { commitCardNoteBatch } from "./commitCardNoteBatch";

describe("commitCardNoteBatch", () => {
  it("separates successful and failed drafts so retry only submits unfinished work", async () => {
    const create = vi.fn().mockResolvedValueOnce({ generatedCards: [{ id: "card-1" }, { id: "card-2" }] }).mockRejectedValueOnce(new Error("网络中断"));
    expect(await commitCardNoteBatch([{ id: "a" }, { id: "b" }], create)).toEqual({
      createdCount: 2, cardId: "card-1", succeededIds: ["a"], failedIds: ["b"], error: "网络中断"
    });
  });
  it("summarizes successful batches and supplies a useful non-Error fallback", async () => {
    expect(await commitCardNoteBatch([{ id: "a" }], async () => ({ generatedCards: [{ id: "c" }] }))).toEqual({ createdCount: 1, cardId: "c", succeededIds: ["a"], failedIds: [], error: "" });
    expect((await commitCardNoteBatch([{ id: "a" }], async () => { throw null; })).error).toBe("写入复习卡片失败。");
  });
});
