// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createCompilerHandler, ONECOMPILER_EXEC_URL } from "./compilerProxy";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe("OneCompiler proxy", () => {
  it("forwards the client-app payload to the supplied endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify({ stdout: "Hello\n", stderr: "" }),
    });
    const response = createResponse();

    await createCompilerHandler({ fetchImpl })(
      { body: { code: "print('Hello')", language: "python", fileName: "ignored.py" } },
      response,
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      ONECOMPILER_EXEC_URL,
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({
      properties: {
        language: "python",
        files: [{ name: "main.py", content: "print('Hello')" }],
        stdin: null,
      },
    });
    expect(response.body).toEqual({ stdout: "Hello\n", stderr: "" });
  });

  it("rejects unsupported languages without calling OneCompiler", async () => {
    const fetchImpl = vi.fn();
    const response = createResponse();

    await createCompilerHandler({ fetchImpl })(
      { body: { code: "puts 'hello'", language: "ruby" } },
      response,
    );

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
