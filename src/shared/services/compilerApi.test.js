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
});
