import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "javascript", label: "JavaScript", badge: "JS", hint: "main.js" },
  { value: "python", label: "Python", badge: "PY", hint: "main.py" },
  { value: "java", label: "Java", badge: "JV", hint: "Main.java" },
];

describe("Select", () => {
  it("opens and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="Programming language" value="javascript" options={options} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /programming language: javascript/i }));
    expect(screen.getByRole("listbox", { name: /programming language/i })).toBeVisible();
    await user.click(screen.getByRole("option", { name: /python/i }));
    expect(onChange).toHaveBeenCalledWith("python");
  });

  it("supports arrow-key selection and restores trigger focus", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="Programming language" value="javascript" options={options} onChange={onChange} />,
    );

    const trigger = screen.getByRole("button", { name: /programming language: javascript/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("python");
    expect(trigger).toHaveFocus();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(
      <Select label="Programming language" value="javascript" options={options} onChange={vi.fn()} />,
    );

    const trigger = screen.getByRole("button", { name: /programming language: javascript/i });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
