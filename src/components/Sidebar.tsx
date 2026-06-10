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
  dashboard: LayoutDashboard,
  projects: Briefcase,
  "office-work": PenTool,
  "site-work": Hammer,
  tasks: CheckSquare,
  "office-team": Users,
  "site-team": HardHat,
  clients: UserCircle2,
  "site-photos": Camera,
  attendance: BookOpen,
  "working-sop": ClipboardList,
  payments: CreditCard,
  invoices: ClipboardList,
  calendar: Calendar,
  reports: BarChart3,
  messages: MessageSquare,
  "agency-register": Building2,
  "agency-approvals": Briefcase,
  settings: Settings,
};

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  "office-work": "Office Work",
  "site-work": "Site Work",
  tasks: "Tasks",
  "office-team": "Office Team",
  "site-team": "Site Team",
  clients: "Clients",
  "site-photos": "Site Photos",
  attendance: "Attendance",
  "working-sop": "Working SOP",
  payments: "Payments",
  invoices: "Invoices",
  calendar: "Calendar",
  reports: "Reports",
  messages: "Messages",
  "agency-register": "Agency Register",
  "agency-approvals": "Pending Agencies",
  settings: "Settings",
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
      <div className="w-60 h-screen bg-white text-slate-800 flex flex-col items-center justify-center border-r border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
    <div className="w-60 h-screen bg-gradient-to-b from-primary-100 via-primary-50/50 to-white text-slate-800 flex flex-col relative border-r border-slate-200">
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-premium p-1.5 rounded-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">ArchiSite</span>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-slate-800 hover:bg-slate-100" onClick={onMobileClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.key} href={item.href} onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 tracking-tight border-l-4 rounded-r-xl rounded-l-none",
                isActive
                  ? "bg-gradient-to-r from-primary-100/60 to-primary-50/20 text-primary-700 font-semibold border-primary-600 pl-2.5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 border-transparent hover:border-slate-200 pl-2.5"
              )}>
              <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-105", isActive ? "text-primary-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Status Card */}
      {/* <div className="mx-4 my-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
          <span className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">ArchiSite Engine</p>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-premium rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </div> */}

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 border border-primary-200/50 font-bold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium tracking-wider">
              {roleConfig?.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || (typeof user?.role === 'string' ? user.role : 'User')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
