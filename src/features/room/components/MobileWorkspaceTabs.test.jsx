import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobileWorkspaceTabs } from "./MobileWorkspaceTabs";

describe("MobileWorkspaceTabs", () => {
  it("switches workspace panels and shows the chat count", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MobileWorkspaceTabs activeTab="code" onChange={onChange} messageCount={3} />);

    expect(screen.getByRole("tab", { name: /code/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /chat/i }));
    expect(onChange).toHaveBeenCalledWith("chat");
  });
});
