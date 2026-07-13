export type AdminViewLoadResult<T> =
  | {
      kind: "success";
      data: T;
    }
  | {
      kind: "error";
      error: unknown;
      status: number | null;
    };

export async function runAdminViewLoadRequest<T>(options: {
  onForbidden?: () => void | Promise<void>;
  readStatus: (error: unknown) => number | null;
  request: () => Promise<T>;
}): Promise<AdminViewLoadResult<T>> {
  const { onForbidden, readStatus, request } = options;

  try {
    return {
      kind: "success",
      data: await request()
    };
  } catch (error) {
    const status = readStatus(error);
    if (status === 403) {
      await onForbidden?.();
    }

    return {
      kind: "error",
      error,
      status
    };
  }
}
