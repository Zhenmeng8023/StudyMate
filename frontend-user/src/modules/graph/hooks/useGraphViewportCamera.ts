import { useCallback, useEffect, useMemo, useRef, useState, type RefObject, type WheelEvent } from "react";
import {
  buildGraphMinimapViewport,
  clampGraphZoom,
  centerGraphViewportOnRect,
  resetGraphViewport as resetViewportState,
  zoomGraphViewport
} from "@studymate/graph-core";
import type {
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphNodePayload
} from "../../../api/client";
import {
  buildCombinedBounds,
  buildClearedFocusNavigationLocation,
  buildFocusPreviewViewport,
  minimapScale,
  stageHeight,
  stageWidth,
  type FocusPreview
} from "../lib/workspaceControllerHelpers";

type ViewportMutationOptions = {
  captureHistory?: boolean;
  label?: string;
  status?: string;
};

type GraphViewportCameraOptions = {
  graphDetail: GraphDetailPayload | null;
  locationPathname: string;
  locationSearch: string;
  navigate: (target: { pathname: string; search: string }) => void;
  onPreviewViewport: (viewport: GraphDocumentPayload["viewport"], status: string) => void;
  onSelectNode: (nodeId: string) => void;
  onStatusMessage: (message: string) => void;
  onViewportDocumentChange: (
    mutator: (draft: GraphDocumentPayload) => void,
    options?: ViewportMutationOptions
  ) => void;
  requestedFocus: FocusPreview | null;
  requestedFocusKey: string;
  requestedGraphId: string;
  stageRef: RefObject<HTMLDivElement | null>;
  stageViewport: { width: number; height: number };
};

export function useGraphViewportCamera(options: GraphViewportCameraOptions) {
  const [focusPreview, setFocusPreview] = useState<FocusPreview | null>(null);
  const consumedFocusRef = useRef("");
  const graphDetailRef = useRef<GraphDetailPayload | null>(options.graphDetail);
  graphDetailRef.current = options.graphDetail;
  const callbacksRef = useRef({
    navigate: options.navigate,
    onPreviewViewport: options.onPreviewViewport
  });
  callbacksRef.current = {
    navigate: options.navigate,
    onPreviewViewport: options.onPreviewViewport
  };
  const document = options.graphDetail?.document ?? null;
  const minimapViewport = useMemo(() => {
    return document
      ? buildGraphMinimapViewport({
          viewport: document.viewport,
          stage: options.stageViewport,
          world: { width: stageWidth, height: stageHeight },
          scale: minimapScale
        })
      : null;
  }, [document, options.stageViewport.height, options.stageViewport.width]);

  const zoomGraph = useCallback(
    (delta: number, status: string) => {
      options.onViewportDocumentChange(
        (draft) => {
          draft.viewport = zoomGraphViewport(draft.viewport, delta);
        },
        { captureHistory: false, status, label: "调整缩放" }
      );
    },
    [options]
  );

  const fitViewportToDocument = useCallback(() => {
    const currentDetail = graphDetailRef.current;
    const stageElement = options.stageRef.current;
    const nodes = currentDetail?.document.nodes ?? [];
    if (!currentDetail || !stageElement || nodes.length === 0) {
      options.onStatusMessage("当前没有可适配视图的节点");
      return;
    }

    const bounds = buildCombinedBounds(nodes);
    const padding = 96;
    const availableWidth = Math.max(stageElement.clientWidth - padding * 2, 240);
    const availableHeight = Math.max(stageElement.clientHeight - padding * 2, 200);
    const targetZoom = clampGraphZoom(
      Math.min(availableWidth / Math.max(bounds.width, 1), availableHeight / Math.max(bounds.height, 1)),
      0.4,
      1.4,
      currentDetail.document.viewport.zoom
    );
    const nextViewport = centerGraphViewportOnRect({
      rect: {
        x: bounds.left,
        y: bounds.top,
        width: bounds.width,
        height: bounds.height
      },
      stage: {
        width: stageElement.clientWidth,
        height: stageElement.clientHeight
      },
      zoom: targetZoom
    });

    options.onViewportDocumentChange(
      (draft) => {
        draft.viewport = nextViewport;
      },
      { captureHistory: false, status: "已按内容适配画布视图", label: "适配视图" }
    );
  }, [options]);

  const resetViewport = useCallback(() => {
    options.onViewportDocumentChange(
      (draft) => {
        draft.viewport = resetViewportState(draft.viewport, { x: 140, y: 120, zoom: 1 });
      },
      { captureHistory: false, status: "已重置画布视野", label: "重置视野" }
    );
  }, [options]);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      zoomGraph(event.deltaY < 0 ? 0.08 : -0.08, "已调整缩放，等待保存");
    },
    [zoomGraph]
  );

  const focusNode = useCallback(
    (node: GraphNodePayload) => {
      if (!options.graphDetail || !options.stageRef.current) {
        return;
      }

      const nextViewport = centerGraphViewportOnRect({
        rect: node,
        stage: {
          width: options.stageRef.current.clientWidth,
          height: options.stageRef.current.clientHeight
        },
        zoom: options.graphDetail.document.viewport.zoom
      });

      options.onViewportDocumentChange(
        (draft) => {
          draft.viewport = {
            ...draft.viewport,
            ...nextViewport
          };
        },
        { captureHistory: false, status: `已定位到节点 ${node.title}`, label: "聚焦节点" }
      );
      options.onSelectNode(node.id);
    },
    [options]
  );

  useEffect(() => {
    const currentDetail = graphDetailRef.current;
    if (!currentDetail || !options.stageRef.current || !options.requestedFocus) {
      return;
    }
    if (options.requestedGraphId && currentDetail.id !== options.requestedGraphId) {
      return;
    }
    if (options.requestedFocusKey && consumedFocusRef.current === options.requestedFocusKey) {
      return;
    }

    consumedFocusRef.current = options.requestedFocusKey;
    callbacksRef.current.onPreviewViewport(
      buildFocusPreviewViewport(options.requestedFocus, currentDetail, options.stageRef.current),
      `已定位到 ${options.requestedFocus.label}`
    );
    setFocusPreview(options.requestedFocus);
    callbacksRef.current.navigate(buildClearedFocusNavigationLocation(options.locationPathname, options.locationSearch));

    const timer = window.setTimeout(() => {
      setFocusPreview(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [
    options.graphDetail?.id,
    options.locationPathname,
    options.locationSearch,
    options.requestedFocus,
    options.requestedFocusKey,
    options.requestedGraphId,
    options.stageRef
  ]);

  return {
    focusNode,
    fitViewportToDocument,
    focusPreview,
    handleWheel,
    minimapViewport,
    resetViewport,
    zoomGraph
  };
}
