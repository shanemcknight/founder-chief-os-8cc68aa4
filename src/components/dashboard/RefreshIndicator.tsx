import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshIndicatorProps {
  agoLabel: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  intervalLabel: string;
}

export default function RefreshIndicator({ agoLabel, isRefreshing, onRefresh, intervalLabel }: RefreshIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <span>Auto-refresh: {intervalLabel}</span>
      <span>·</span>
      <span>Updated {agoLabel}</span>
      <button
        onClick={onRefresh}
        className="p-1 rounded hover:bg-muted transition-colors"
        title="Refresh now"
      >
        <RefreshCw size={12} className={cn(isRefreshing && "animate-spin")} />
      </button>
    </div>
  );
}
