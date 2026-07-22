import { Code2, FileText, MessageSquare, TerminalSquare } from "lucide-react";

const TABS = [
  { id: "problem", label: "Problem", icon: FileText },
  { id: "code", label: "Code", icon: Code2 },
  { id: "output", label: "Output", icon: TerminalSquare },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

export function MobileWorkspaceTabs({ activeTab, onChange, messageCount }) {
  return (
    <nav
      className="grid grid-cols-4 rounded-lg bg-foreground p-1 md:hidden"
      role="tablist"
      aria-label="Workspace panels"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`mobile-${id}-panel`}
            className={`relative flex min-w-0 flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
              active ? "bg-background text-primary shadow-sm" : "text-secondary"
            }`}
            onClick={() => onChange(id)}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="truncate">{label}</span>
            {id === "chat" && messageCount > 0 && (
              <span className="absolute right-1 top-1 min-w-4 rounded-full bg-secondary px-1 text-[8px] leading-4 text-background">
                {messageCount > 99 ? "99+" : messageCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
