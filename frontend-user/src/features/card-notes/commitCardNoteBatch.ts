export async function commitCardNoteBatch<T extends { id: string }>(
  drafts: T[],
  create: (draft: T) => Promise<{ generatedCards: Array<{ id: string }> }>
) {
  const results = await Promise.allSettled(drafts.map(create));
  return results.reduce<{ createdCount: number; cardId?: string; succeededIds: string[]; failedIds: string[]; error: string }>((summary, result, index) => {
    if (result.status === "fulfilled") {
      return { ...summary, createdCount: summary.createdCount + result.value.generatedCards.length,
        cardId: summary.cardId || result.value.generatedCards[0]?.id, succeededIds: [...summary.succeededIds, drafts[index].id] };
    }
    return { ...summary, failedIds: [...summary.failedIds, drafts[index].id],
      error: summary.error || (result.reason instanceof Error ? result.reason.message : "写入复习卡片失败。") };
  }, { createdCount: 0, succeededIds: [], failedIds: [], error: "" });
}
