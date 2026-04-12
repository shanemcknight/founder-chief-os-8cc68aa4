import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isToday, addWeeks, subWeeks } from "date-fns";
import { useSocial, PlatformId, getStatusColor, PLATFORMS } from "@/contexts/SocialContext";
import { cn } from "@/lib/utils";

export default function SocialCalendarPage() {
  const { posts, addPost, openSlideOut } = useSocial();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [platformFilter, setPlatformFilter] = useState<PlatformId | "all">("all");

  const days = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
    }
    return eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
  }, [currentDate, viewMode]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => platformFilter === "all" || p.platforms.includes(platformFilter));
  }, [posts, platformFilter]);

  const getPostsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return filteredPosts.filter(p => p.scheduledDate === dayStr);
  };

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(viewMode === "month"
      ? (dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
      : (dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-foreground">Calendar</h1>
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button onClick={() => setViewMode("month")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", viewMode === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Month</button>
            <button onClick={() => setViewMode("week")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", viewMode === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Week</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value as any)} className="text-xs bg-muted border border-border rounded-md px-2 py-1 outline-none text-foreground">
              <option value="all">All Platforms</option>
              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {viewMode === "month" ? format(currentDate, "MMMM yyyy") : `Week of ${format(startOfWeek(currentDate), "MMM d")}`}
            </span>
            <button onClick={() => navigate(1)} className="p-1 rounded hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded-md transition-colors font-medium">Today</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        <div className={cn("grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden", viewMode === "week" ? "grid-rows-1" : "")}>
          {days.map(day => {
            const dayPosts = getPostsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const today_ = isToday(day);
            return (
              <div key={day.toISOString()} onClick={() => dayPosts.length === 0 && addPost({ scheduledDate: format(day, "yyyy-MM-dd") })}
                className={cn("bg-card p-2 group cursor-pointer transition-colors hover:bg-muted/50 relative", viewMode === "month" ? "min-h-[100px]" : "min-h-[300px]", !inMonth && viewMode === "month" && "opacity-40")}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full", today_ && "bg-primary text-primary-foreground")}>{format(day, "d")}</span>
                  <button onClick={e => { e.stopPropagation(); addPost({ scheduledDate: format(day, "yyyy-MM-dd") }); }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 text-primary bg-primary/10 hover:bg-primary/20 rounded transition-all" title="New post">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, viewMode === "month" ? 3 : 10).map(post => (
                    <button key={post.id} onClick={e => { e.stopPropagation(); openSlideOut(post.id); }}
                      className={cn("w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors", post.status === "posted" ? "bg-emerald-500/15" : post.status === "rejected" ? "bg-red-500/15 opacity-60" : "bg-muted hover:bg-muted/80")}>
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusColor(post.status))} />
                      <span className="truncate text-foreground/80">{post.title || "Untitled"}</span>
                    </button>
                  ))}
                  {dayPosts.length > (viewMode === "month" ? 3 : 10) && (
                    <span className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
