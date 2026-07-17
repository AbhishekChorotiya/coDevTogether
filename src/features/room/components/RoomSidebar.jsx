import { useState } from "react";
import { ChevronRight, Clipboard, LogOut, UserRound } from "lucide-react";
import toast from "react-hot-toast";

function IconButton({ label, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
        danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-foreground text-primary hover:opacity-80"
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export function RoomSidebar({ users, roomId, onLeave }) {
  const [expanded, setExpanded] = useState(false);

  async function copyInvite() {
    try {
      const inviteUrl = new URL(window.location.origin);
      inviteUrl.searchParams.set("roomId", roomId);
      await navigator.clipboard.writeText(inviteUrl.toString());
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy the invite link");
    }
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-background p-2 shadow-xl transition-[width] duration-200 ${
          expanded ? "w-72" : "w-16"
        }`}
        aria-label="Room participants"
      >
        <div className="min-h-0 overflow-hidden">
          <IconButton label={expanded ? "Collapse participants" : "Expand participants"} onClick={() => setExpanded((value) => !value)}>
            <ChevronRight className={`size-5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </IconButton>
          <div className="my-2 h-px bg-foreground" />
          <div className="space-y-2 overflow-y-auto">
            {users.map((user) => (
              <div key={user.socketId} className="flex h-12 items-center gap-3" title={user.username}>
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-primary">
                  <UserRound className="size-7" aria-hidden="true" />
                  <span
                    className={`absolute right-0 top-0 size-3 rounded-full ring-2 ring-background ${user.focus ? "bg-green-600" : "bg-slate-400"}`}
                    aria-label={user.focus ? "Active" : "Away"}
                  />
                </div>
                {expanded && <span className="truncate font-medium text-primary">{user.username}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className={`flex gap-2 ${expanded ? "flex-row" : "flex-col"}`}>
          <IconButton label="Copy invite link" onClick={copyInvite}>
            <Clipboard className="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton label="Leave room" onClick={onLeave} danger>
            <LogOut className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
      </aside>
      {expanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40"
          aria-label="Close participants"
          onClick={() => setExpanded(false)}
        />
      )}
    </>
  );
}
