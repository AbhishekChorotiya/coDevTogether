import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeEditor } from "./CodeEditor";

describe("CodeEditor", () => {
  it("fills its available workspace height", async () => {
    const { container } = render(
      <div style={{ height: "500px" }}>
        <CodeEditor language="javascript" code="console.log('hello')" onChange={vi.fn()} />
      </div>,
    );

    const wrapper = container.querySelector(".code-editor");
    expect(wrapper).toHaveClass("h-full", "min-h-0");

    await waitFor(() => {
      const editor = container.querySelector(".cm-editor");
      expect(editor).toBeInTheDocument();
      expect(getComputedStyle(editor).height).toBe("100%");
    });
  });
});
