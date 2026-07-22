import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Play, Wifi, WifiOff } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ChatPanel } from "../chat/ChatPanel";
import { LANGUAGES, LANGUAGE_IDS } from "../editor/languages";
import { Select } from "../../shared/components/Select";
import { useTheme } from "../../shared/hooks/useTheme";
import { compileCode } from "../../shared/services/compilerApi";
import { OutputPanel } from "./components/OutputPanel";
import { MobileWorkspaceTabs } from "./components/MobileWorkspaceTabs";
import { ResizeHandle } from "./components/ResizeHandle";
import { RoomSidebar } from "./components/RoomSidebar";
import { PANEL_LIMITS, usePanelWidths } from "./hooks/usePanelWidths";
import { useRoomSession } from "./hooks/useRoomSession";

const LANGUAGE_OPTIONS = LANGUAGE_IDS.map((value) => ({
  value,
  label: LANGUAGES[value].label,
  badge: value === "javascript" ? "JS" : value === "python" ? "PY" : value === "java" ? "JV" : "C++",
  hint: LANGUAGES[value].fileName,
}));

const CodeEditor = lazy(() =>
  import("../editor/CodeEditor").then((module) => ({
    default: module.CodeEditor,
  })),
);

export function RoomPage() {
  const { roomId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || sessionStorage.getItem("codev:username") || "";
  const { theme, setTheme, themeOptions } = useTheme();
  const session = useRoomSession({ roomId, username });
  const [output, setOutput] = useState({ stdout: "", stderr: "" });
  const [isRunning, setIsRunning] = useState(false);
  const [mobilePanel, setMobilePanel] = useState("code");
  const compileControllerRef = useRef(null);
  const { widths, beginResize, resizeBy, resetWidth } = usePanelWidths();

  useEffect(() => {
    if (!username) navigate(`/?roomId=${encodeURIComponent(roomId)}`, { replace: true });
  }, [navigate, roomId, username]);

  useEffect(
    () => () => compileControllerRef.current?.abort(),
    [],
  );

  async function handleRun() {
    if (isRunning) return;
    const controller = new AbortController();
    compileControllerRef.current = controller;
    setIsRunning(true);
    const toastId = toast.loading("Compiling…");
    try {
      const result = await compileCode(session.code, session.language, {
        signal: controller.signal,
      });
      setOutput(result);
      setMobilePanel("output");
      session.announceRun();
      toast.success("Compilation finished", { id: toastId });
    } catch (error) {
      setOutput({ stdout: "", stderr: error.message });
      setMobilePanel("output");
      toast.error(error.message, { id: toastId });
    } finally {
      if (compileControllerRef.current === controller) {
        compileControllerRef.current = null;
        setIsRunning(false);
      }
    }
  }

  function leaveRoom() {
    sessionStorage.removeItem("codev:username");
    navigate("/", { replace: true });
  }

  return (
    <div className={`${theme} flex h-dvh min-w-0 gap-2 overflow-hidden bg-foreground p-2 text-primary md:pl-[72px]`}>
      <RoomSidebar users={session.users} roomId={roomId} onLeave={leaveRoom} />

      <main className="grid min-w-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-2 rounded-md bg-background p-2 md:min-w-[360px] md:grid-rows-[auto_7rem_minmax(0,1fr)]">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded bg-foreground p-2">
          <div className="flex min-w-0 items-center gap-2 pl-11 md:pl-0">
            {session.status === "connected" ? (
              <Wifi className="size-4 text-green-600" aria-hidden="true" />
            ) : (
              <WifiOff className="size-4 text-amber-600" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">Room {roomId}</h1>
              <p className="truncate text-[11px] text-secondary">
                {session.error || `${session.users.length} participant${session.users.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex h-11 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold text-background shadow-sm transition hover:opacity-90 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
            >
              <Play className="size-3" aria-hidden="true" />
              {isRunning ? "Running…" : "Run"}
            </button>
            <Select label="Programming language" value={session.language} options={LANGUAGE_OPTIONS} onChange={session.updateLanguage} />
            <Select label="Color theme" value={theme} options={themeOptions} onChange={setTheme} compactOnMobile />
          </div>
        </header>

        <MobileWorkspaceTabs
          activeTab={mobilePanel}
          onChange={setMobilePanel}
          messageCount={session.messages.length}
        />

        <section
          id="mobile-problem-panel"
          role="tabpanel"
          className={`${mobilePanel === "problem" ? "block" : "hidden"} min-h-0 overflow-hidden rounded bg-foreground md:block`}
          aria-label="Problem statement"
        >
          <label className="sr-only" htmlFor="question">Problem statement</label>
          <textarea
            id="question"
            maxLength={20_000}
            className="h-full w-full resize-none bg-transparent p-3 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-secondary"
            placeholder="Paste the problem statement or notes here…"
            value={session.question}
            onChange={(event) => session.updateQuestion(event.target.value)}
          />
        </section>

        <section
          id="mobile-code-panel"
          role="tabpanel"
          className={`${mobilePanel === "code" ? "block" : "hidden"} min-h-0 overflow-hidden rounded bg-[#1e1e1e] md:block`}
          aria-label="Code workspace"
        >
          <Suspense fallback={<div className="grid min-h-full place-items-center text-sm text-slate-300">Loading editor…</div>}>
            <CodeEditor language={session.language} code={session.code} onChange={session.updateCode} />
          </Suspense>
        </section>

        <div
          id="mobile-output-panel"
          role="tabpanel"
          className={`${mobilePanel === "output" ? "min-h-0" : "hidden"} md:hidden`}
        >
          <OutputPanel output={output} />
        </div>

        <div
          id="mobile-chat-panel"
          role="tabpanel"
          className={`${mobilePanel === "chat" ? "min-h-0" : "hidden"} md:hidden`}
        >
          <ChatPanel
            messages={session.messages}
            onSend={session.sendMessage}
            connectionStatus={session.status}
            mobile
          />
        </div>
      </main>

      <ResizeHandle
        label="Resize code and results panels"
        panel="result"
        width={widths.result}
        min={PANEL_LIMITS.result.min}
        max={PANEL_LIMITS.result.max}
        className="md:flex"
        onPointerDown={beginResize}
        onResizeBy={resizeBy}
        onReset={resetWidth}
      />

      <aside
        className="hidden min-w-[240px] shrink-0 flex-col gap-2 rounded-md bg-background p-2 md:flex"
        style={{ width: widths.result }}
        aria-label="Run results"
      >
        <div className="flex h-20 shrink-0 items-center justify-center rounded bg-foreground">
          <span className="font-semibold text-primary">{"<CoDevTogether />"}</span>
        </div>
        <OutputPanel output={output} />
      </aside>

      <ResizeHandle
        label="Resize results and chat panels"
        panel="chat"
        width={widths.chat}
        min={PANEL_LIMITS.chat.min}
        max={PANEL_LIMITS.chat.max}
        className="xl:flex"
        onPointerDown={beginResize}
        onResizeBy={resizeBy}
        onReset={resetWidth}
      />

      <ChatPanel
        messages={session.messages}
        onSend={session.sendMessage}
        connectionStatus={session.status}
        width={widths.chat}
      />
      <Toaster position="bottom-center" />
    </div>
  );
}
