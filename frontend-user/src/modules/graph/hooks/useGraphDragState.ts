import { useCallback, useMemo, useState } from "react";
import {
  buildSelectionBox,
  type AlignmentGuide,
  type DragState,
  type SelectionBox
} from "../lib/workspaceControllerHelpers";

type BeginPanInput = Omit<Extract<DragState, { kind: "pan" }>, "kind">;

type BeginNodeDragInput = Omit<Extract<DragState, { kind: "node" }>, "kind">;

type BeginMultiNodeDragInput = Omit<Extract<DragState, { kind: "multi-node" }>, "kind">;

export function useGraphDragState() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);

  const clearActiveDrag = useCallback(() => {
    setAlignmentGuides([]);
    setSelectionBox(null);
    setDragState(null);
  }, []);

  const beginMarquee = useCallback((startX: number, startY: number) => {
    setAlignmentGuides([]);
    setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
    setDragState({
      kind: "marquee",
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });
  }, []);

  const updateMarquee = useCallback((currentX: number, currentY: number) => {
    setAlignmentGuides([]);
    setDragState((current) => {
      if (!current || current.kind !== "marquee") {
        return current;
      }
      setSelectionBox(buildSelectionBox(current.startX, current.startY, currentX, currentY));
      return {
        ...current,
        currentX,
        currentY
      };
    });
  }, []);

  const beginPan = useCallback((input: BeginPanInput) => {
    setAlignmentGuides([]);
    setSelectionBox(null);
    setDragState({ kind: "pan", ...input });
  }, []);

  const beginNodeDrag = useCallback((input: BeginNodeDragInput) => {
    setAlignmentGuides([]);
    setSelectionBox(null);
    setDragState({ kind: "node", ...input });
  }, []);

  const beginMultiNodeDrag = useCallback((input: BeginMultiNodeDragInput) => {
    setAlignmentGuides([]);
    setSelectionBox(null);
    setDragState({
      ...input,
      kind: "multi-node",
      nodeIds: [...input.nodeIds],
      origins: { ...input.origins }
    });
  }, []);

  return useMemo(
    () => ({
      alignmentGuides,
      beginMarquee,
      beginMultiNodeDrag,
      beginNodeDrag,
      beginPan,
      clearActiveDrag,
      dragState,
      selectionBox,
      setAlignmentGuides,
      updateMarquee
    }),
    [
      alignmentGuides,
      beginMarquee,
      beginMultiNodeDrag,
      beginNodeDrag,
      beginPan,
      clearActiveDrag,
      dragState,
      selectionBox,
      updateMarquee
    ]
  );
}
