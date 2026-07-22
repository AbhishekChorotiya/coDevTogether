import { LANGUAGES, isLanguage } from "../../features/editor/languages";

const DEFAULT_TIMEOUT_MS = 10_000;

export class CompilerError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "CompilerError";
  }
}

export async function compileCode(code, language, options = {}) {
  if (!isLanguage(language)) {
    throw new CompilerError("Choose a supported language before running code.");
  }

  const baseUrl = (import.meta.env.VITE_COMPILER_API_URL || "").replace(/\/$/, "");

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(`${baseUrl}/api/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        language,
        fileName: LANGUAGES[language].fileName,
      }),
      signal,
    });

    if (!response.ok) {
      throw new CompilerError(`Compiler request failed (${response.status}).`);
    }

    const result = await response.json();
    if (!result || typeof result !== "object") {
      throw new CompilerError("The compiler returned an invalid response.");
    }

    return {
      stdout: typeof result.stdout === "string" ? result.stdout : "",
      stderr: typeof result.stderr === "string" ? result.stderr : "",
    };
  } catch (error) {
    if (error instanceof CompilerError) throw error;
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new CompilerError("Compilation timed out. Please try again.", {
        cause: error,
      });
    }
    throw new CompilerError("Unable to reach the compiler service.", {
      cause: error,
    });
  }
}
