import { useState } from "react";

const priorities = [
  {
    summary: "Wholesale inquiry from Austin bar owner — response drafted",
    actions: ["Approve", "Edit"],
    id: 1,
  },
  {
    summary: "LinkedIn post ready to publish",
    actions: ["Approve", "Edit"],
    id: 2,
  },
  {
    summary: "Invoice #1042 overdue $840",
    actions: ["View", "Dismiss"],
    id: 3,
  },
];

const mockChat = [
  {
    role: "user" as const,
    text: "What should I focus on today?",
  },
  {
    role: "chief" as const,
    text: "Three things: approve the wholesale reply sitting in inbox, fix that Amazon listing before it costs you rank, and sign off on tomorrow's LinkedIn post. Everything else is handled.",
  },
];

export default function ChiefPanel() {
  const [input, setInput] = useState("");

  return (
    <aside className="w-[300px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <span className="text-sm font-bold text-foreground tracking-wide">CHIEF</span>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Priorities */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Today's Priorities
          </p>
          <div className="space-y-2">
            {priorities.map((item) => (
              <div
                key={item.id}
                className="bg-background/50 border border-border rounded-lg p-2.5"
              >
                <p className="text-xs text-foreground leading-relaxed mb-2">
                  {item.summary}
                </p>
                <div className="flex gap-1.5">
                  <button className="text-[10px] font-medium bg-primary text-primary-foreground px-2 py-1 rounded transition-colors duration-150 hover:bg-[#9a2f4d]">
                    {item.actions[0]}
                  </button>
                  <button className="text-[10px] font-medium text-muted-foreground border border-border px-2 py-1 rounded hover:text-foreground transition-colors duration-150">
                    {item.actions[1]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Mini Chat */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Chat
          </p>
          <div className="space-y-2">
            {mockChat.map((msg, i) => (
              <div
                key={i}
                className={`text-xs p-2.5 rounded-lg ${
                  msg.role === "chief"
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                <span className="font-semibold text-[10px] block mb-1">
                  {msg.role === "chief" ? "CHIEF" : "You"}
                </span>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Chief anything..."
            className="flex-1 text-xs bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-[#9a2f4d] transition-colors duration-150">
            →
          </button>
        </div>
      </div>
    </aside>
  );
}
