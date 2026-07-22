import { act, fireEvent, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clampWidth, PANEL_LIMITS, usePanelWidths } from "./usePanelWidths";

describe("resizable panel widths", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
    });
  });

  it("clamps widths to their minimum and maximum", () => {
    expect(clampWidth(100, 240, 520)).toBe(240);
    expect(clampWidth(700, 240, 520)).toBe(520);
  });

  it("resizes panels without crossing their minimum width", () => {
    const { result } = renderHook(() => usePanelWidths());

    act(() => result.current.resizeBy("result", -1_000));
    expect(result.current.widths.result).toBe(PANEL_LIMITS.result.min);

    act(() => result.current.resizeBy("chat", -1_000));
    expect(result.current.widths.chat).toBe(PANEL_LIMITS.chat.min);
  });

  it("restores the default width", () => {
    const { result } = renderHook(() => usePanelWidths());
    act(() => result.current.resizeBy("result", 64));
    act(() => result.current.resetWidth("result"));
    expect(result.current.widths.result).toBe(PANEL_LIMITS.result.initial);
  });

  it("updates a panel while its separator is dragged", () => {
    const { result } = renderHook(() => usePanelWidths());
    const initialWidth = result.current.widths.result;

    act(() => {
      result.current.beginResize("result", {
        clientX: 500,
        pointerId: 1,
        preventDefault: vi.fn(),
        currentTarget: { setPointerCapture: vi.fn() },
      });
    });
    act(() => fireEvent.pointerMove(window, { clientX: 450 }));
    act(() => fireEvent.pointerUp(window));

    expect(result.current.widths.result).toBe(initialWidth + 50);
  });
});
