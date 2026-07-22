import { LANGUAGES, isLanguage } from "../src/features/editor/languages.js";

export const ONECOMPILER_EXEC_URL = "https://onecompiler.com/api/code/exec";

const MAX_CODE_LENGTH = 200_000;
const MAX_RESPONSE_LENGTH = 1_000_000;
const UPSTREAM_TIMEOUT_MS = 9_000;

export function createCompilerHandler({ fetchImpl = fetch } = {}) {
  return async function compilerHandler(request, response) {
    const { code, language } = request.body || {};

    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
      return response.status(400).json({
        stderr: "Code must be a string no larger than 200 KB.",
        stdout: "",
      });
    }
    if (!isLanguage(language)) {
      return response.status(400).json({
        stderr: "Unsupported programming language.",
        stdout: "",
      });
    }

    try {
      const upstreamResponse = await fetchImpl(ONECOMPILER_EXEC_URL, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            language,
            files: [
              {
                name: LANGUAGES[language].fileName,
                content: code,
              },
            ],
            stdin: null,
          },
        }),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });

      const contentLength = Number(upstreamResponse.headers.get("content-length"));
      if (contentLength > MAX_RESPONSE_LENGTH) {
        throw new Error("Compiler response exceeded the size limit.");
      }

      const responseText = await upstreamResponse.text();
      if (responseText.length > MAX_RESPONSE_LENGTH) {
        throw new Error("Compiler response exceeded the size limit.");
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Compiler returned an invalid response.");
      }

      if (!upstreamResponse.ok) {
        return response.status(502).json({
          stdout: "",
          stderr: result?.message || result?.error || "Compiler request failed.",
        });
      }

      return response.json(result);
    } catch (error) {
      const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
      return response.status(502).json({
        stdout: "",
        stderr: timedOut
          ? "The compiler service timed out."
          : "The compiler service is currently unavailable.",
      });
    }
  };
}

export function createCompileRateLimiter({ limit = 30, windowMs = 60_000 } = {}) {
  const clients = new Map();

  return function compileRateLimiter(request, response, next) {
    const now = Date.now();
    const key = request.ip;
    const bucket = clients.get(key);

    if (!bucket || now - bucket.startedAt >= windowMs) {
      clients.set(key, { startedAt: now, count: 1 });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      return response.status(429).json({
        stdout: "",
        stderr: "Too many compilation requests. Please wait and try again.",
      });
    }
    return next();
  };
}
