import type { AdminRouteKey } from "../router";

export async function runAdminWorkspaceLogin(
  activeView: AdminRouteKey,
  options: {
    bootstrap: (view: AdminRouteKey) => Promise<unknown>;
    clearError: () => void;
    clearSessionInvalidation: () => void;
    fallbackMessage: string;
    getSuccessNotice: () => string;
    resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
    setError: (message: string) => void;
    setLoading: (loading: boolean) => void;
    setNotice: (notice: string) => void;
  }
) {
  const {
    bootstrap,
    clearError,
    clearSessionInvalidation,
    fallbackMessage,
    getSuccessNotice,
    resolveErrorMessage,
    setError,
    setLoading,
    setNotice
  } = options;

  setLoading(true);
  clearError();
  clearSessionInvalidation();

  try {
    await bootstrap(activeView);
    setNotice(getSuccessNotice());
  } catch (error) {
    setError(resolveErrorMessage(error, fallbackMessage));
  } finally {
    setLoading(false);
  }
}
