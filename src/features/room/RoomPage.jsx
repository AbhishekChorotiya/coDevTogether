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
import { RoomSidebar } from "./components/RoomSidebar";
import { useRoomSession } from "./hooks/useRoomSession";

const LANGUAGE_OPTIONS = LANGUAGE_IDS.map((value) => ({
  value,
  label: LANGUAGES[value].label,
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
  const { theme, setTheme, themes } = useTheme();
  const session = useRoomSession({ roomId, username });
  const [output, setOutput] = useState({ stdout: "", stderr: "" });
  const [isRunning, setIsRunning] = useState(false);
  const compileControllerRef = useRef(null);

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
      session.announceRun();
      toast.success("Compilation finished", { id: toastId });
    } catch (error) {
      setOutput({ stdout: "", stderr: error.message });
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

  const themeOptions = themes.map((value) => ({
    value,
    label: value[0].toUpperCase() + value.slice(1),
  }));

  return (
    <div className={`${theme} flex h-dvh min-w-0 gap-2 overflow-hidden bg-foreground p-2 pl-[72px] text-primary`}>
      <RoomSidebar users={session.users} roomId={roomId} onLeave={leaveRoom} />

      <main className="grid min-w-0 flex-1 grid-rows-[auto_7rem_minmax(0,1fr)_10rem] gap-2 rounded-md bg-background p-2 md:grid-rows-[auto_7rem_minmax(0,1fr)]">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded bg-foreground p-2">
          <div className="flex min-w-0 items-center gap-2">
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex h-9 items-center gap-2 rounded bg-secondary px-3 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              <Play className="size-3" aria-hidden="true" />
              {isRunning ? "Running…" : "Run"}
            </button>
            <Select label="Programming language" value={session.language} options={LANGUAGE_OPTIONS} onChange={session.updateLanguage} />
            <Select label="Color theme" value={theme} options={themeOptions} onChange={setTheme} className="hidden sm:flex" />
          </div>
        </header>

        <section className="overflow-hidden rounded bg-foreground" aria-label="Problem statement">
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

        <section className="min-h-0 overflow-auto rounded bg-[#1e1e1e]" aria-label="Code workspace">
          <Suspense fallback={<div className="grid min-h-full place-items-center text-sm text-slate-300">Loading editor…</div>}>
            <CodeEditor language={session.language} code={session.code} onChange={session.updateCode} />
          </Suspense>
        </section>

        <div className="min-h-0 md:hidden">
          <OutputPanel output={output} />
        </div>
      </main>

      <aside className="hidden w-72 shrink-0 flex-col gap-2 rounded-md bg-background p-2 md:flex" aria-label="Run results">
        <div className="flex h-20 shrink-0 items-center justify-center rounded bg-foreground">
          <span className="font-semibold text-primary">{"<CoDevTogether />"}</span>
        </div>
        <OutputPanel output={output} />
      </aside>

      <ChatPanel messages={session.messages} onSend={session.sendMessage} connectionStatus={session.status} />
      <Toaster position="bottom-center" />
    </div>
  );
}
