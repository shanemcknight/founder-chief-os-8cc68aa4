import { useMemo } from "react";
import { useSocial, STATUS_ORDER, STATUS_LABELS, PLATFORMS, getStatusColor } from "@/contexts/SocialContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { addDays, format, isAfter, isBefore, parseISO, startOfWeek, endOfWeek } from "date-fns";

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "hsl(330, 80%, 60%)", Facebook: "hsl(220, 70%, 50%)", Pinterest: "hsl(0, 75%, 55%)",
  TikTok: "hsl(0, 0%, 40%)", LinkedIn: "hsl(210, 60%, 45%)",
};

export default function SocialPerformancePage() {
  const { posts } = useSocial();
  const today = new Date();
  const thisMonth = format(today, "yyyy-MM");

  const postsThisMonth = posts.filter(p => p.createdAt?.startsWith(thisMonth)).length;
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const postsThisWeek = posts.filter(p => {
    if (!p.scheduledDate) return false;
    const d = parseISO(p.scheduledDate);
    return isAfter(d, weekStart) && isBefore(d, weekEnd);
  }).length;

  const platformData = useMemo(() => {
    return PLATFORMS.map(p => ({
      name: p.name, value: posts.filter(post => post.platforms.includes(p.id)).length,
      color: PLATFORM_COLORS[p.name] || "#666",
    })).filter(d => d.value > 0);
  }, [posts]);

  const barChartData = useMemo(() => {
    return PLATFORMS.map(p => ({
      name: p.name.slice(0, 4), fullName: p.name,
      posts: posts.filter(post => post.platforms.includes(p.id) && post.createdAt?.startsWith(thisMonth)).length,
      color: PLATFORM_COLORS[p.name] || "#666",
    }));
  }, [posts, thisMonth]);

  const pipelineHealth = useMemo(() => {
    return STATUS_ORDER.map(s => ({ status: s, label: STATUS_LABELS[s], count: posts.filter(p => p.status === s).length }));
  }, [posts]);

  const upcoming = useMemo(() => {
    const next7 = addDays(today, 7);
    return posts.filter(p => { if (!p.scheduledDate) return false; const d = parseISO(p.scheduledDate); return isAfter(d, today) && isBefore(d, next7); })
      .sort((a, b) => (a.scheduledDate! > b.scheduledDate! ? 1 : -1));
  }, [posts]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground">Performance</h1>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Posts This Month", value: postsThisMonth },
            { label: "Posts This Week", value: postsThisWeek },
            { label: "Total Posts", value: posts.length },
            { label: "Upcoming (7 days)", value: upcoming.length },
            { label: "Needs Review", value: posts.filter(p => p.status === "review").length },
          ].map(m => (
            <div key={m.label} className="bg-card rounded-xl p-4 border border-border">
              <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Posts by Platform</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {platformData.map(d => <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />{d.name} ({d.value})</div>)}
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Posts per Platform (This Month)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="posts" radius={[4, 4, 0, 0]}>{barChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Pipeline Health</h3>
          <div className="space-y-3">
            {pipelineHealth.map(item => (
              <div key={item.status} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] w-28"><span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.status)}`} />{item.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${getStatusColor(item.status)}`} style={{ width: `${posts.length ? (item.count / posts.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Upcoming Posts (Next 7 Days)</h3>
            <div className="space-y-2">
              {upcoming.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex gap-1">{p.platforms.map(pid => <span key={pid} className="text-sm">{PLATFORMS.find(x => x.id === pid)?.icon}</span>)}</div>
                  <span className="text-sm font-medium flex-1 text-foreground">{p.title || "Untitled"}</span>
                  <span className="text-xs text-muted-foreground">{p.scheduledDate} {p.scheduledTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
