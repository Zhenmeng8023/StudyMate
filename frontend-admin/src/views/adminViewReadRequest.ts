export type AdminViewReadResult<T> =
  | {
      kind: "success";
      data: T;
    }
  | {
      kind: "error";
      message: string;
      status: number | null;
    };

export async function runAdminViewReadRequest<T>(options: {
  fallbackMessage: string;
  readStatus: (error: unknown) => number | null;
  request: () => Promise<T>;
}): Promise<AdminViewReadResult<T>> {
  const { fallbackMessage, readStatus, request } = options;

  try {
    return {
      kind: "success",
      data: await request()
    };
  } catch (error) {
    return {
      kind: "error",
      message: error instanceof Error ? error.message : fallbackMessage,
      status: readStatus(error)
    };
  }
}
