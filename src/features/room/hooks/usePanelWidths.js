import { useCallback, useEffect, useRef, useState } from "react";

export const PANEL_LIMITS = Object.freeze({
  code: { min: 360 },
  result: { min: 240, max: 520, initial: 288 },
  chat: { min: 260, max: 520, initial: 288 },
});

const STORAGE_KEY = "codev:panel-widths";
const SIDEBAR_AND_PAGE_PADDING = 80;
const RESIZE_HANDLE_WIDTH = 10;
const PANEL_GAP_WIDTH = 8;

export function clampWidth(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function readStoredWidths() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return {
      result: clampWidth(
        Number(stored?.result) || PANEL_LIMITS.result.initial,
        PANEL_LIMITS.result.min,
        PANEL_LIMITS.result.max,
      ),
      chat: clampWidth(
        Number(stored?.chat) || PANEL_LIMITS.chat.initial,
        PANEL_LIMITS.chat.min,
        PANEL_LIMITS.chat.max,
      ),
    };
  } catch {
    return {
      result: PANEL_LIMITS.result.initial,
      chat: PANEL_LIMITS.chat.initial,
    };
  }
}

function availablePanelMaximum(panel, widths) {
  const availableWidth = window.innerWidth - SIDEBAR_AND_PAGE_PADDING;
  const chatIsVisible = window.innerWidth >= 1280;
  const handleWidth = chatIsVisible ? RESIZE_HANDLE_WIDTH * 2 : RESIZE_HANDLE_WIDTH;
  const totalGapWidth = chatIsVisible ? PANEL_GAP_WIDTH * 4 : PANEL_GAP_WIDTH * 2;
  const reservedWidth =
    PANEL_LIMITS.code.min +
    handleWidth +
    totalGapWidth +
    (panel === "result" && chatIsVisible ? widths.chat : 0) +
    (panel === "chat" ? widths.result : 0);

  return Math.min(PANEL_LIMITS[panel].max, availableWidth - reservedWidth);
}

function fitWidthsToViewport(widths) {
  if (window.innerWidth < 768) return widths;

  const result = clampWidth(
    widths.result,
    PANEL_LIMITS.result.min,
    availablePanelMaximum("result", widths),
  );
  if (window.innerWidth < 1280) return { ...widths, result };

  const nextWidths = { ...widths, result };
  return {
    ...nextWidths,
    chat: clampWidth(
      widths.chat,
      PANEL_LIMITS.chat.min,
      availablePanelMaximum("chat", nextWidths),
    ),
  };
}

export function usePanelWidths() {
  const [widths, setWidths] = useState(() => fitWidthsToViewport(readStoredWidths()));
  const dragCleanupRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  }, [widths]);

  useEffect(() => {
    function handleWindowResize() {
      setWidths((current) => fitWidthsToViewport(current));
    }

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      dragCleanupRef.current?.();
    };
  }, []);

  const resizeBy = useCallback((panel, amount) => {
    setWidths((current) => ({
      ...current,
      [panel]: clampWidth(
        current[panel] + amount,
        PANEL_LIMITS[panel].min,
        availablePanelMaximum(panel, current),
      ),
    }));
  }, []);

  const beginResize = useCallback((panel, pointerEvent) => {
    pointerEvent.preventDefault();
    pointerEvent.currentTarget.setPointerCapture?.(pointerEvent.pointerId);
    const startX = pointerEvent.clientX;
    const startWidth = widths[panel];

    function handlePointerMove(event) {
      const movement = startX - event.clientX;
      setWidths((latest) => ({
        ...latest,
        [panel]: clampWidth(
          startWidth + movement,
          PANEL_LIMITS[panel].min,
          availablePanelMaximum(panel, latest),
        ),
      }));
    }

    function finishResize() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      dragCleanupRef.current = null;
    }

    dragCleanupRef.current?.();
    dragCleanupRef.current = finishResize;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishResize, { once: true });
    window.addEventListener("pointercancel", finishResize, { once: true });
  }, [widths]);

  const resetWidth = useCallback((panel) => {
    setWidths((current) => ({
      ...current,
      [panel]: PANEL_LIMITS[panel].initial,
    }));
  }, []);

  return { widths, beginResize, resizeBy, resetWidth };
}
