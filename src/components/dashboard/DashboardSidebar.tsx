import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Mail,
  FileText,
  Brain,
  Wrench,
  Settings,
  PlusCircle,
  LogOut,
  Calendar,
  ShieldCheck,
  LayoutGrid,
  Library,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { label: "COMMAND", path: "/dashboard", icon: LayoutDashboard },
  { label: "SALES", path: "/sales", icon: Target },
  { label: "INBOX", path: "/inbox", icon: Mail },
  { label: "PUBLISH", path: "/publish", icon: FileText },
  { label: "CHIEF", path: "/chief", icon: Brain },
  { label: "BUILD", path: "/build", icon: Wrench },
];

const socialSubItems = [
  { label: "Calendar", path: "/social/calendar", icon: Calendar },
  { label: "Approvals", path: "/social/approvals", icon: ShieldCheck },
  { label: "Pipeline", path: "/social/pipeline", icon: LayoutGrid },
  { label: "Library", path: "/social/library", icon: Library },
  { label: "Performance", path: "/social/performance", icon: BarChart3 },
  { label: "Strategy", path: "/social/strategy", icon: Lightbulb },
];

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "text-primary bg-primary/10 border-l-2 border-primary -ml-[2px] pl-[14px]"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  }`;

export default function DashboardSidebar() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isSocialActive = location.pathname.startsWith("/social");
  const [socialOpen, setSocialOpen] = useState(isSocialActive);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Keep social expanded when active
  const showSocialSub = socialOpen || isSocialActive;

  return (
    <aside className="w-[220px] shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
      <div className="px-4 py-4 flex items-center gap-2">
        <span className="text-sm tracking-tight text-foreground">
          <span className="font-bold">MYTHOS</span>{" "}
          <span className="font-normal text-xs text-primary">HQ</span>
        </span>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>

      <nav className="flex-1 py-1 px-2 space-y-0.5">
        {/* COMMAND */}
        <NavLink to="/dashboard" className={linkClass(location.pathname === "/dashboard")}>
          <LayoutDashboard size={16} />
          COMMAND
        </NavLink>

        {/* SOCIAL — expandable */}
        <button
          onClick={() => setSocialOpen(!showSocialSub)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
            isSocialActive
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <BookOpen size={16} />
          <span className="flex-1 text-left">SOCIAL</span>
          {showSocialSub ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
        </button>

        {showSocialSub && (
          <div className="ml-3 pl-3 border-l border-border/40 space-y-0.5 py-1">
            {socialSubItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors duration-150",
                    isActive
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Rest of main nav */}
        {mainNavItems.slice(1).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={linkClass(isActive)}>
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}

        <div className="border-t border-border my-3" />

        <NavLink to="/agents/new" className={linkClass(location.pathname === "/agents/new")}>
          <PlusCircle size={16} />
          Deploy New
        </NavLink>

        <NavLink to="/settings" className={linkClass(location.pathname === "/settings")}>
          <Settings size={16} />
          Settings
        </NavLink>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(145deg, rgba(93,153,146,0.9), rgba(61,110,104,0.95))",
              border: "1px solid rgba(93,153,146,0.6)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(93,153,146,0.3)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Log out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
