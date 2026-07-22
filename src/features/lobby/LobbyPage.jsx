import { useState } from "react";
import { Home, Sparkles, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Select } from "../../shared/components/Select";
import { useTheme } from "../../shared/hooks/useTheme";
import { generateRoomId, normalizeRoomId } from "../../shared/utils/roomId";

export function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(() => normalizeRoomId(searchParams.get("roomId") || ""));
  const [error, setError] = useState("");
  const { theme, setTheme, themeOptions } = useTheme();

  function handleSubmit(event) {
    event.preventDefault();
    const cleanUsername = username.trim().slice(0, 40);
    const cleanRoomId = normalizeRoomId(roomId);
    if (!cleanUsername || !cleanRoomId) {
      setError("Enter your name and a room ID to continue.");
      return;
    }

    sessionStorage.setItem("codev:username", cleanUsername);
    navigate(`/${encodeURIComponent(cleanRoomId)}`, {
      state: { username: cleanUsername },
    });
  }

  return (
    <div className={`${theme} grid min-h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-x-hidden bg-foreground text-primary`}>
      <header className="flex items-center justify-between gap-3 bg-background px-4 py-3 shadow-sm sm:px-10 sm:py-4 md:px-20">
        <a href="/" className="truncate text-base font-bold tracking-tight sm:text-2xl">{"<CoDevTogether />"}</a>
        <Select label="Color theme" value={theme} options={themeOptions} onChange={setTheme} compactOnMobile />
      </header>

      <main className="mx-auto grid min-h-0 w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-2 lg:gap-10 lg:px-10">
        <section className="max-w-xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary">
            <Sparkles className="size-4" aria-hidden="true" />
            Real-time collaborative coding
          </p>
          <h1 className="text-balance text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Build ideas together, from anywhere.
          </h1>
          <p className="mt-5 max-w-lg text-balance text-base leading-7 text-secondary sm:text-lg">
            Share a room, solve a problem, run code, and keep the conversation beside your editor.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="w-full rounded-xl bg-background p-5 shadow-xl sm:p-8" noValidate>
          <div className="mb-6">
            <h2 className="text-xl font-bold">Join a workspace</h2>
            <p className="mt-1 text-sm text-secondary">Use an invite ID or create a fresh room.</p>
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-semibold">Your name</span>
            <span className="flex h-12 items-center rounded border border-secondary bg-foreground px-3 focus-within:ring-2 focus-within:ring-secondary">
              <UserRound className="mr-2 size-5 shrink-0 text-secondary" aria-hidden="true" />
              <input
                autoComplete="name"
                autoFocus
                maxLength={40}
                className="h-full w-full bg-transparent text-primary outline-none placeholder:text-secondary"
                placeholder="Ada Lovelace"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Room ID</span>
            <span className="flex h-12 items-center rounded border border-secondary bg-foreground px-3 focus-within:ring-2 focus-within:ring-secondary">
              <Home className="mr-2 size-5 shrink-0 text-secondary" aria-hidden="true" />
              <input
                autoComplete="off"
                maxLength={64}
                className="h-full w-full bg-transparent text-primary outline-none placeholder:text-secondary"
                placeholder="codev-team-room"
                value={roomId}
                onChange={(event) => {
                  setRoomId(normalizeRoomId(event.target.value));
                  setError("");
                }}
              />
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              setRoomId(generateRoomId());
              setError("");
            }}
            className="mt-3 text-sm font-semibold text-primary underline decoration-secondary underline-offset-4"
          >
            Generate a room ID
          </button>

          <p className="mt-4 min-h-5 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>

          <button type="submit" className="mt-2 h-12 w-full rounded bg-secondary font-bold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Join room
          </button>
        </form>
      </main>
    </div>
  );
}
