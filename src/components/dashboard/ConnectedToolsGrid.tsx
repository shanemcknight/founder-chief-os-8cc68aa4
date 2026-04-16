import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";

type Tool = {
  name: string;
  url: string;
  connected: boolean;
};

const tools: Tool[] = [
  { name: "Shopify", url: "https://admin.shopify.com", connected: true },
  { name: "ShipStation", url: "https://ship12.shipstation.com", connected: true },
  { name: "QuickBooks", url: "https://app.qbo.intuit.com", connected: true },
  { name: "Klaviyo", url: "https://www.klaviyo.com/dashboard", connected: true },
  { name: "Gmail", url: "https://mail.google.com", connected: true },
  { name: "LinkedIn", url: "https://www.linkedin.com", connected: true },
  { name: "Apollo", url: "https://app.apollo.io", connected: true },
  { name: "Amazon", url: "https://sellercentral.amazon.com", connected: false },
  { name: "HubSpot", url: "https://app.hubspot.com", connected: false },
  { name: "Google Analytics", url: "https://analytics.google.com", connected: false },
];

export default function ConnectedToolsGrid() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Connected Tools
        </span>
        <button
          onClick={() => navigate("/settings")}
          className="text-[10px] text-primary hover:underline"
        >
          Manage
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tools.map((tool) =>
          tool.connected ? (
            <button
              key={tool.name}
              onClick={() => window.open(tool.url, "_blank")}
              title={`Open ${tool.name} in new tab`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/30 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs font-medium text-foreground">{tool.name}</span>
            </button>
          ) : (
            <button
              key={tool.name}
              onClick={() => navigate("/settings")}
              title={`Connect ${tool.name}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border/50 text-muted-foreground hover:bg-muted/30 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium">+ {tool.name}</span>
            </button>
          )
        )}

        <button
          onClick={() => navigate("/settings")}
          title="Add a new integration"
          className="flex items-center gap-1.5 border-dashed border border-primary/40 text-primary text-xs font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <PlusCircle size={12} />
          Add
        </button>
      </div>
    </div>
  );
}
