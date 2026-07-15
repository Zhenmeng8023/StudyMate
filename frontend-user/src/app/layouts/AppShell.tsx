import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { CommandBar } from "../chrome/CommandBar";
import { CompactNavigation } from "../navigation/CompactNavigation";
import { PrimaryNavigation } from "../navigation/PrimaryNavigation";
import {
  layoutShowsGlobalSearch,
  layoutUsesCompactNavigation,
  resolveAppLayoutMode
} from "./layoutPolicy";

export function AppShell(props: { children: ReactNode; onLogout: () => void; session: AuthSession | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = resolveAppLayoutMode(location.pathname);
  const [searchText, setSearchText] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const showGlobalCommandBar = mode === "standard" || mode === "studio";

  useEffect(() => {
    setSearchText(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchText.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  const compactNavigation = layoutUsesCompactNavigation(mode);

  return (
    <div className={`shell-root shell-root--${mode}`} data-layout-mode={mode} data-route={location.pathname}>
      <div className="shell-background" />
      <div className={`shell-layout shell-layout--${mode}`}>
        {mode !== "focus" ? compactNavigation ? <CompactNavigation session={props.session} /> : <PrimaryNavigation session={props.session} /> : null}
        <div className={`shell-main shell-main--${mode}`}>
          {showGlobalCommandBar ? (
            <CommandBar
              mode={mode}
              onLogout={props.onLogout}
              onSearchSubmit={handleSearchSubmit}
              onSearchTextChange={setSearchText}
              searchText={searchText}
              session={props.session}
              showSearch={layoutShowsGlobalSearch(mode)}
            />
          ) : null}
          <div className={`main-grid main-grid--${mode} main-grid--single`}>
            <main className={`workspace-surface workspace-surface--${mode}`}>{props.children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
