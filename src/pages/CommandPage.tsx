import {
  ShoppingBag,
  Package,
  MailOpen,
  CreditCard,
  Calculator,
  BarChart3,
} from "lucide-react";

const kpis = [
  { label: "Revenue Today", value: "$4,840", barColor: "bg-accent" },
  { label: "Active Agents", value: "7", barColor: "bg-primary" },
  { label: "Emails Pending", value: "3", barColor: "bg-primary" },
  { label: "Social Reach", value: "12.4K", barColor: "bg-success" },
];

const tools = [
  { name: "Shopify", icon: ShoppingBag, metrics: ["$4,840 today", "23 orders", "2 flagged"] },
  { name: "Amazon", icon: Package, metrics: ["$2,210 today", "18 orders", "1 suppressed listing"] },
  { name: "Klaviyo", icon: MailOpen, metrics: ["38.2% open rate", "1 campaign live"] },
  { name: "Stripe", icon: CreditCard, metrics: ["$1,630 today", "0 failed payments"] },
  { name: "QuickBooks", icon: Calculator, metrics: ["$4,200 outstanding", "2 invoices due"] },
  { name: "Google Analytics", icon: BarChart3, metrics: ["1,842 sessions", "3.4% conversion"] },
];

const actions = [
  { text: "Wholesale lead email — Barrel & Oak, Austin TX", btn: "Reply" },
  { text: "Amazon suppressed listing — Smoked Maple Old Fashioned", btn: "Review" },
  { text: "Invoice #1042 overdue — $840 from Barrel & Oak", btn: "Pay" },
  { text: "LinkedIn post scheduled for today — Q2 milestones", btn: "Preview" },
  { text: "Agent Cipher has errors — failed 3 tasks overnight", btn: "Fix" },
];

export default function CommandPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Good morning, Shane.</h1>
        <p className="text-sm text-muted-foreground mt-1">
          7 agents active · 3 items need your attention · Last action 12 min ago
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${kpi.barColor}`} />
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Business Tools */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Connected Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                </div>
                <div className="space-y-0.5">
                  {tool.metrics.map((m, i) => (
                    <p key={i} className={`text-xs ${i === 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {m}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Needs Your Attention</h2>
        <div className="space-y-2">
          {actions.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-card border border-border rounded-lg p-3"
            >
              <p className="text-sm text-foreground">{a.text}</p>
              <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-[#9a2f4d] transition-colors duration-150 shrink-0 ml-3">
                {a.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
