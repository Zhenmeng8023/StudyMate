import { request, withAuth } from "./core";
import type { AuthSession } from "./types";

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  remainingBytes: number;
  fileCount: number;
  unlinkedFileCount: number;
  unlinkedBytes: number;
  unlinkedFiles: Array<{ id: string; originalName: string; size: number; createdAt: string }>;
}

const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const count = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export async function getStorageUsage(session: AuthSession): Promise<StorageUsage> {
  const data = await request<unknown>("/files/storage", { headers: withAuth(session) });
  if (!record(data) || ![data.usedBytes, data.quotaBytes, data.remainingBytes, data.fileCount, data.unlinkedFileCount, data.unlinkedBytes].every(count)
    || !data.quotaBytes || !Array.isArray(data.unlinkedFiles) || !data.unlinkedFiles.every((file: unknown) => record(file)
      && typeof file.id === "string" && typeof file.originalName === "string" && count(file.size) && typeof file.createdAt === "string")) {
    throw new Error("容量数据暂不可用，请刷新重试。");
  }
  return data as unknown as StorageUsage;
}
