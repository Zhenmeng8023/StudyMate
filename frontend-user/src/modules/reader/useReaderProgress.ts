import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { updateReaderProgress } from "../../api/client";
import type { AuthSession, ReaderStatePayload } from "../../api/types";

type Progress = Pick<ReaderStatePayload, "currentPage" | "totalPages" | "progressPercent" | "bookmarks">;
type Pending = { desired: Progress | null; confirmed: string; running: boolean; active: boolean };
const extract = (state: ReaderStatePayload): Progress => ({ currentPage: state.currentPage, totalPages: state.totalPages, progressPercent: state.progressPercent, bookmarks: state.bookmarks });

export function useReaderProgress(session: AuthSession, materialId: string, state: ReaderStatePayload | null, setState: Dispatch<SetStateAction<ReaderStatePayload | null>>) {
  const [error, setError] = useState("");
  const stateRef = useRef(state);
  stateRef.current = state;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const pending = useRef<Pending>({ desired: null, confirmed: "", running: false, active: true });

  useEffect(() => {
    const context: Pending = { desired: null, confirmed: "", running: false, active: true };
    pending.current = context;
    setError("");
    return () => { context.active = false; };
  }, [materialId, session.user.id]);

  async function flush(context: Pending) {
    if (context.running || !context.active) return;
    context.running = true;
    try {
      while (context.active && context.desired && JSON.stringify(context.desired) !== context.confirmed) {
        const request = context.desired;
        const response = await updateReaderProgress(sessionRef.current, materialId, request);
        if (!context.active) return;
        context.confirmed = JSON.stringify(request);
        setError("");
        setState((current) => current?.materialId === materialId ? { ...current, ...context.desired, lastReadAt: response.lastReadAt } : current);
      }
    } catch (cause) {
      if (context.active) setError(cause instanceof Error ? cause.message : "阅读进度保存失败，请重试。");
    } finally {
      context.running = false;
    }
  }

  function save(changes: Partial<Progress>) {
    const current = stateRef.current;
    if (!current || current.materialId !== materialId) return;
    const context = pending.current;
    const base = context.desired || extract(current);
    if (!context.confirmed) context.confirmed = JSON.stringify(base);
    const next = { ...base, ...changes };
    next.progressPercent = next.totalPages ? Math.min(100, Math.round(next.currentPage / next.totalPages * 100)) : base.progressPercent;
    context.desired = next;
    stateRef.current = { ...current, ...next };
    setState((previous) => previous?.materialId === materialId ? { ...previous, ...next } : previous);
    void flush(context);
  }

  return { error, save, retry: () => { void flush(pending.current); } };
}
