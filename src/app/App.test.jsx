import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("lobby", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renders the room join form", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /build ideas together/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join room/i })).toBeInTheDocument();
  });

  it("validates missing room details", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /join room/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/enter your name and a room id/i);
  });
});
