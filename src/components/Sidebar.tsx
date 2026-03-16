"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  ClipboardList, 
  CreditCard,
  Building2,
  UserCircle2,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Camera,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

const architectMenu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Workers", href: "/workers", icon: Users },
  { name: "Clients", href: "/clients", icon: UserCircle2 },
  { name: "Site Updates", href: "/site-updates", icon: ClipboardList },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const clientMenu = [
  { name: "My Project", href: "/", icon: LayoutDashboard },
  { name: "Site Photos", href: "/site-photos", icon: ClipboardList },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

const supervisorMenu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Active Projects", href: "/projects", icon: Briefcase },
  { name: "Today's Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Attendance", href: "/workers", icon: Users },
  { name: "Site Logs", href: "/site-updates", icon: ClipboardList },
  { name: "Site Photos", href: "/site-photos", icon: Camera },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

const workerMenu = [
  { name: "My Tasks", href: "/", icon: CheckSquare },
  { name: "Job Locations", href: "/projects", icon: Briefcase },
  { name: "Site Photos", href: "/site-photos", icon: Camera },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

export default function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === "/login") return null;

  const getMenu = () => {
    switch (user?.role) {
      case "architect": return architectMenu;
      case "client": return clientMenu;
      case "supervisor": return supervisorMenu;
      case "worker": return workerMenu;
      default: return [];
    }
  };

  const menuItems = getMenu();

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col relative">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ArchiSite</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden" 
          onClick={onMobileClose}
        >
          <X className="w-5 h-5 text-slate-400" />
        </Button>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {user?.role === 'architect' ? 'Principal Architect' : user?.role?.toUpperCase()}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 truncate mr-2">{user?.name}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
