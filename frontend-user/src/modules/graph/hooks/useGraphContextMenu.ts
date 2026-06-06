import { useCallback, useEffect, useState, type MouseEvent } from "react";
import type { ContextMenuState } from "../lib/workspaceControllerHelpers";

type GraphContextMenuTarget = {
  edgeId?: string;
  nodeId?: string;
};

type GraphContextMenuOptions = {
  onEdgeSelect: (edgeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
};

export function useGraphContextMenu(options: GraphContextMenuOptions) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const openContextMenu = useCallback(
    (event: MouseEvent<HTMLElement | SVGPathElement>, payload?: GraphContextMenuTarget) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu({
        edgeId: payload?.edgeId,
        nodeId: payload?.nodeId,
        x: event.clientX,
        y: event.clientY
      });
      if (payload?.nodeId) {
        options.onNodeSelect(payload.nodeId);
      }
      if (payload?.edgeId) {
        options.onEdgeSelect(payload.edgeId);
      }
    },
    [options]
  );

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [closeContextMenu, contextMenu]);

  return {
    closeContextMenu,
    contextMenu,
    openContextMenu
  };
}
