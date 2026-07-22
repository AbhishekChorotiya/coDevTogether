import { afterEach, describe, expect, it, vi } from "vitest";
import { compileCode, CompilerError } from "./compilerApi";

describe("compileCode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the correct Java filename", async () => {
    vi.stubEnv("VITE_COMPILER_API_URL", "https://compiler.example");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stdout: "Hello", stderr: "" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(compileCode("public class Main {}", "java")).resolves.toEqual({
      stdout: "Hello",
      stderr: "",
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      fileName: "Main.java",
      language: "java",
    });
  });

  it("rejects unsupported languages before making a request", async () => {
    await expect(compileCode("", "ruby")).rejects.toBeInstanceOf(CompilerError);
  });

  it("uses the same-origin server proxy by default", async () => {
    vi.stubEnv("VITE_COMPILER_API_URL", "");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stdout: "", stderr: "" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await compileCode("console.log('hello')", "javascript");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/compile",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
