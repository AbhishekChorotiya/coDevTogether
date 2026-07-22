import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

function formatTime(time) {
  const date = new Date(time);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatMessage({ item }) {
  if (item.type !== "message") {
    return (
      <p className="my-2 self-center rounded-full bg-foreground px-4 py-2 text-xs text-primary">
        {item.message}
      </p>
    );
  }

  return (
    <article className={`flex flex-col px-2 py-3 ${item.self ? "items-end" : "items-start"}`}>
      <span className="text-xs font-semibold text-primary">
        {item.self ? "You" : item.username}
      </span>
      <p className="max-w-[90%] whitespace-pre-wrap break-words rounded-md bg-foreground px-4 py-2 text-sm text-primary">
        {item.message}
      </p>
      <time className="mt-1 text-[10px] text-secondary" dateTime={new Date(item.time).toISOString()}>
        {formatTime(item.time)}
      </time>
    </article>
  );
}

export function ChatPanel({ messages, onSend, connectionStatus, width, mobile = false }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function handleSubmit(event) {
    event.preventDefault();
    if (onSend(text)) setText("");
  }

  return (
    <section
      className={`relative shrink-0 flex-col overflow-hidden rounded-md bg-background pb-16 ${
        mobile ? "flex h-full min-w-0 w-full" : "hidden min-w-[260px] xl:flex"
      }`}
      style={mobile ? undefined : { width }}
      aria-label="Room chat"
    >
      <h2 className="border-b border-foreground px-4 py-3 font-semibold text-primary">Chat</h2>
      <div ref={listRef} className="flex h-full flex-col overflow-y-auto" aria-live="polite">
        {messages.length === 0 && (
          <p className="m-auto px-6 text-center text-sm text-secondary">No messages yet. Say hello to your team.</p>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} item={message} />
        ))}
      </div>
      <form className="absolute bottom-0 left-0 flex w-full gap-2 p-2" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">Chat message</label>
        <input
          id="chat-message"
          maxLength={2_000}
          className="h-10 w-full rounded-full bg-foreground px-4 text-sm text-primary outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          placeholder={connectionStatus === "connected" ? "Type a message…" : "Reconnecting…"}
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={connectionStatus !== "connected"}
        />
        <button
          type="submit"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!text.trim() || connectionStatus !== "connected"}
          aria-label="Send message"
        >
          <SendHorizontal className="size-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
