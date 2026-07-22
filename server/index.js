import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Server } from "socket.io";
import { createCompileRateLimiter, createCompilerHandler } from "./compilerProxy.js";
import { RoomStore } from "./roomStore.js";
import { registerSocketHandlers } from "./socketHandlers.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, "..");
const distDirectory = path.join(projectRoot, "dist");
const configuredOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedRequest(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === request.headers.host || originHost.startsWith("localhost:");
  } catch {
    return false;
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  maxHttpBufferSize: 256_000,
  perMessageDeflate: false,
  allowRequest: (request, callback) => callback(null, isAllowedRequest(request)),
});

registerSocketHandlers(io, new RoomStore());

app.disable("x-powered-by");
app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.post(
  "/api/compile",
  express.json({ limit: "210kb" }),
  createCompileRateLimiter(),
  createCompilerHandler(),
);
app.use(express.static(distDirectory, { index: false, maxAge: "1h" }));
app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api/")) return next();
  return response.sendFile(path.join(distDirectory, "index.html"));
});
app.use((_request, response) => response.status(404).json({ error: "Not found" }));
app.use((error, _request, response, _next) => {
  if (error?.type === "entity.too.large") {
    return response.status(413).json({
      stdout: "",
      stderr: "Compilation request exceeds the 210 KB limit.",
    });
  }
  if (error instanceof SyntaxError) {
    return response.status(400).json({
      stdout: "",
      stderr: "Compilation request must contain valid JSON.",
    });
  }
  console.error("Unhandled server error", error);
  return response.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT) || 5000;
httpServer.listen(port, () => console.log(`CoDevTogether listening on port ${port}`));

function shutdown() {
  io.close(() => httpServer.close(() => process.exit(0)));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
