import { lazy, type ReactNode, Suspense, useSyncExternalStore } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { AuthSession } from "../api/client";
import { logoutUser } from "../api/client";
import { clearSessionInvalidation, persistSession, readSession, subscribeSession } from "./sessionStore";
import { ShellFrame } from "./shell/ShellFrame";

const LoginPage = lazy(() => import("../pages/AuthPages").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../pages/AuthPages").then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const MaterialsPage = lazy(() => import("../pages/MaterialsPage").then((module) => ({ default: module.MaterialsPage })));
const CommunityPage = lazy(() => import("../pages/CommunityPage").then((module) => ({ default: module.CommunityPage })));
const NotesPage = lazy(() => import("../pages/NotesPage").then((module) => ({ default: module.NotesPage })));
const ReaderPage = lazy(() => import("../pages/ReaderPage").then((module) => ({ default: module.ReaderPage })));
const GraphPage = lazy(() => import("../pages/GraphReviewPages").then((module) => ({ default: module.GraphPage })));
const ReviewWorkspaceRoute = lazy(() => import("../pages/GraphReviewPages").then((module) => ({ default: module.ReviewWorkspaceRoute })));
const AiPage = lazy(() => import("../pages/AiPage").then((module) => ({ default: module.AiPage })));
const SettingsPage = lazy(() => import("../pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const SearchWorkspacePage = lazy(() => import("../modules/search/SearchWorkspacePage").then((module) => ({ default: module.SearchWorkspacePage })));
const SharePage = lazy(() => import("../pages/SharePage").then((module) => ({ default: module.SharePage })));

function RouteLoadingState() {
  return (
    <div className="route-loading-state" role="status" aria-live="polite">
      <span className="route-loading-state__spinner" aria-hidden="true" />
      <div>
        <strong>正在打开学习空间</strong>
        <p>正在加载当前功能与最近上下文…</p>
      </div>
    </div>
  );
}

function LazyBoundary(props: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoadingState />}>{props.children}</Suspense>;
}

export function RequireAuth(props: { session: AuthSession | null; children: ReactNode }) {
  const location = useLocation();
  if (!props.session) {
    return <Navigate replace state={{ from: location.pathname + location.search }} to="/login" />;
  }

  return <>{props.children}</>;
}

export function PublicShellRoute(props: { session: AuthSession | null; onLogout: () => void }) {
  const location = useLocation();
  return (
    <ShellFrame onLogout={props.onLogout} session={props.session}>
      <LazyBoundary><Outlet key={location.pathname} /></LazyBoundary>
    </ShellFrame>
  );
}

export function ProtectedShellRoute(props: { session: AuthSession | null; onLogout: () => void }) {
  const location = useLocation();
  return (
    <RequireAuth session={props.session}>
      <ShellFrame onLogout={props.onLogout} session={props.session}>
        <LazyBoundary><Outlet key={location.pathname} /></LazyBoundary>
      </ShellFrame>
    </RequireAuth>
  );
}

export function App() {
  const session = useSyncExternalStore(subscribeSession, readSession, readSession);
  const navigate = useNavigate();

  function handleSession(nextSession: AuthSession | null) {
    persistSession(nextSession);
  }

  async function handleLogout() {
    try {
      if (session) await logoutUser(session);
    } catch {
      // Network logout errors should not leave a stale local session behind.
    } finally {
      clearSessionInvalidation();
      handleSession(null);
      navigate("/", { replace: true });
    }
  }

  return (
    <LazyBoundary>
      <Routes>
        <Route element={<LoginPage onLogin={handleSession} />} path="/login" />
        <Route element={<RegisterPage onRegister={handleSession} />} path="/register" />
        <Route element={<PublicShellRoute onLogout={() => void handleLogout()} session={session} />}>
          <Route element={<DashboardPage session={session} />} index />
          <Route element={<MaterialsPage session={session} />} path="materials" />
          <Route element={<CommunityPage />} path="community" />
          <Route element={<SearchWorkspacePage session={session} />} path="search" />
          <Route element={<SharePage />} path="share/:token" />
        </Route>
        <Route element={<ProtectedShellRoute onLogout={() => void handleLogout()} session={session} />}>
          <Route element={<ReaderPage session={session as AuthSession} />} path="reader" />
          <Route element={<ReaderPage session={session as AuthSession} />} path="reader/:materialId" />
          <Route element={<NotesPage session={session as AuthSession} />} path="notes" />
          <Route element={<GraphPage session={session as AuthSession} />} path="graph" />
          <Route element={<ReviewWorkspaceRoute session={session as AuthSession} />} path="review" />
          <Route element={<AiPage session={session as AuthSession} />} path="ai" />
          <Route element={<SettingsPage session={session as AuthSession} />} path="settings" />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </LazyBoundary>
  );
}
