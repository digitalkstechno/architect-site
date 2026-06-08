"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, CheckSquare, Users, ClipboardList,
  CreditCard, Building2, UserCircle2, Calendar, BarChart3,
  Settings, LogOut, MessageSquare, Camera, X, HardHat, BookOpen,
  PenTool, Hammer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";

const PAGE_ICONS: Record<string, React.ElementType> = {
  dashboard:    LayoutDashboard,
  projects:     Briefcase,
  "office-work": PenTool,
  "site-work":   Hammer,
  tasks:        CheckSquare,
  "office-team": Users,
  "site-team":   HardHat,
  clients:      UserCircle2,
  "site-photos":  Camera,
  attendance:   BookOpen,
  "working-sop": ClipboardList,
  payments:     CreditCard,
  calendar:     Calendar,
  reports:      BarChart3,
  messages:     MessageSquare,
  settings:     Settings,
};

const PAGE_LABELS: Record<string, string> = {
  dashboard:      "Dashboard",
  projects:       "Projects",
  "office-work":  "Office Work",
  "site-work":    "Site Work",
  tasks:          "Tasks",
  "office-team":  "Office Team",
  "site-team":    "Site Team",
  clients:        "Clients",
  "site-photos":  "Site Photos",
  attendance:     "Attendance",
  "working-sop":  "Working SOP",
  payments:       "Payments",
  calendar:       "Calendar",
  reports:        "Reports",
  messages:       "Messages",
  settings:       "Settings",
};

// Custom labels based on roles
const ROLE_PAGE_LABELS: Record<string, Record<string, string>> = {
  director: {
    dashboard: "Director Hub",
  },
  architect: {
    dashboard: "Architect Console",
  },
  "office-team": {
    dashboard: "Office Hub",
  },
  "site-engineer": {
    dashboard: "Engineer View",
  },
  supervisor: {
    dashboard: "Site Overview",
  },
  client: {
    dashboard: "My Dashboard",
    projects: "My Project",
  },
  guest: {
    dashboard: "Showcase",
    projects: "Work Portfolio",
    "working-sop": "Our Process",
  }
};

export default function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { getRoleById, isInitialized } = useRoles();

  if (pathname === "/login") return null;

  if (!isInitialized && user) {
    return (
      <div className="w-60 h-screen bg-slate-900 text-slate-300 flex flex-col items-center justify-center border-r border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const roleName = typeof user?.role === 'string' ? user.role : "";
  const roleId = roleName.toLowerCase().replace(/\s+/g, '-');
  const roleConfig = getRoleById(roleId);
  const allowedPages = roleConfig?.pages ?? [];

  const menuItems = allowedPages.map(pageKey => {
    const roleLabels = ROLE_PAGE_LABELS[roleId] ?? {};
    return {
      key: pageKey,
      name: roleLabels[pageKey] ?? PAGE_LABELS[pageKey] ?? pageKey,
      href: pageKey === "dashboard" ? "/" : `/${pageKey}`,
      icon: PAGE_ICONS[pageKey] ?? LayoutDashboard,
    };
  });

  return (
    <div className="w-60 h-screen bg-slate-900 text-slate-300 flex flex-col relative border-r border-slate-800">
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-1.5 rounded">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-medium text-white tracking-tight">ArchiSite</span>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800" onClick={onMobileClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.key} href={item.href} onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors duration-150 tracking-tight",
                isActive 
                  ? "bg-slate-800 text-white border-l-2 border-primary-500" 
                  : "hover:bg-slate-800 hover:text-white"
              )}>
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary-400" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium tracking-wider">
              {roleConfig?.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || (typeof user?.role === 'string' ? user.role : 'User')}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
