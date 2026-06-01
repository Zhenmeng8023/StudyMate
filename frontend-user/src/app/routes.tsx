import { ReactNode, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { AuthSession } from "../api/client";
import { logoutUser } from "../api/client";
import { persistSession, readSession } from "./appShared";
import { ShellFrame } from "./shell/ShellFrame";
import { LoginPage, RegisterPage } from "../pages/AuthPages";
import { DashboardPage } from "../pages/DashboardPage";
import { MaterialsPage } from "../pages/MaterialsPage";
import { CommunityPage } from "../pages/CommunityPage";
import { NotesPage } from "../pages/NotesPage";
import { ReaderPage } from "../pages/ReaderPage";
import { GraphPage, ReviewPage, ReviewWorkspaceRoute } from "../pages/GraphReviewPages";
import { AiPage } from "../pages/AiPage";
import { SettingsPage } from "../pages/SettingsPage";
import { SearchWorkspacePage } from "../modules/search/SearchWorkspacePage";

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
      <Outlet key={location.pathname} />
    </ShellFrame>
  );
}

export function ProtectedShellRoute(props: { session: AuthSession | null; onLogout: () => void }) {
  const location = useLocation();
  return (
    <RequireAuth session={props.session}>
      <ShellFrame onLogout={props.onLogout} session={props.session}>
        <Outlet key={location.pathname} />
      </ShellFrame>
    </RequireAuth>
  );
}

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const navigate = useNavigate();

  function handleSession(nextSession: AuthSession | null) {
    setSession(nextSession);
    persistSession(nextSession);
  }

  async function handleLogout() {
    try {
      if (session) {
        await logoutUser(session);
      }
    } catch {
      // Ignore network logout errors and clear local session anyway.
    } finally {
      handleSession(null);
      navigate("/", { replace: true });
    }
  }

  return (
    <Routes>
      <Route element={<LoginPage onLogin={handleSession} />} path="/login" />
      <Route element={<RegisterPage onRegister={handleSession} />} path="/register" />
      <Route element={<PublicShellRoute onLogout={() => void handleLogout()} session={session} />}>
        <Route element={<DashboardPage session={session} />} index />
        <Route element={<MaterialsPage session={session} />} path="materials" />
        <Route element={<CommunityPage />} path="community" />
        <Route element={<SearchWorkspacePage session={session} />} path="search" />
      </Route>
      <Route element={<ProtectedShellRoute onLogout={() => void handleLogout()} session={session} />}>
        <Route element={<ReaderPage session={session as AuthSession} />} path="reader" />
        <Route element={<ReaderPage session={session as AuthSession} />} path="reader/:materialId" />
        <Route element={<NotesPage session={session as AuthSession} />} path="notes" />
        <Route element={<GraphPage session={session as AuthSession} />} path="graph" />
        <Route element={<ReviewWorkspaceRoute session={session!} />} path="review" />
        <Route element={<AiPage session={session as AuthSession} />} path="ai" />
        <Route element={<SettingsPage session={session as AuthSession} />} path="settings" />
      </Route>
    </Routes>
  );
}
