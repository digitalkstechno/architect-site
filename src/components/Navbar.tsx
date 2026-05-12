"use client";

import { Bell, UserCircle, Settings, Menu, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "Dashboard Overview";
  if (pathname.startsWith("/projects")) return "Project Portfolio";
  if (pathname === "/tasks") return "Task Tracker";
  if (pathname === "/workers") return "Worker Directory";
  if (pathname === "/clients") return "Client Directory";
  if (pathname === "/site-updates") return "Recent Site Updates";
  if (pathname === "/payments") return "Financial Overview";
  if (pathname === "/calendar") return "Project Schedule";
  if (pathname === "/reports") return "Analytics & Reports";
  if (pathname === "/settings") return "System Settings";
  if (pathname === "/site-photos") return "Site Documentation";
  if (pathname === "/messages") return "Communication Hub";
  return "Dashboard";
};

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const { user, getEffectiveRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (pathname === "/login") return null;

  const role = getEffectiveRole(user);

  // ✅ ROLE MAPPING FIX
  const roleMap: Record<string, string> = {
    TENANT: "Client",
    TENANT_ADMIN: "Architect",
    TENANT_CLIENT: "Client",
    ADMIN: "Architect",
    USER: "Supervisor",
    WORKER: "Worker",
    SUPERVISOR: "Supervisor"
  };

  const displayRole = roleMap[role?.toUpperCase()] || role;

  const notifications = [
    { id: 1, text: "Foundation complete at Modern Villa", time: "2m ago", icon: CheckCircle2, color: "text-green-500" },
    { id: 2, text: "New message from Alice Johnson", time: "15m ago", icon: Clock, color: "text-blue-500" },
    { id: 3, text: "Payment overdue for Lakeview project", time: "1h ago", icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <>
      {(showNotifications || showSettings) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setShowNotifications(false);
            setShowSettings(false);
          }} 
        />
      )}
      
      <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-40 flex items-center justify-between px-4 lg:px-8">
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <h1 className="text-sm lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {getPageTitle(pathname)}
          </h1>
        </div>

        <div className="flex items-center gap-4">

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border py-4">
                <div className="px-4 py-2 border-b">
                  <h3 className="text-sm font-bold">Notifications</h3>
                </div>

                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-gray-50">
                    <n.icon className={`w-4 h-4 ${n.color}`} />
                    <div>
                      <p className="text-xs font-semibold">{n.text}</p>
                      <p className="text-[10px] text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {showSettings && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border py-3">
                <button className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <UserCircle className="w-7 h-7 text-indigo-600" />
            <div className="hidden lg:block" suppressHydrationWarning>
              <p className="text-xs font-bold" suppressHydrationWarning>{user?.name ?? ""}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest" suppressHydrationWarning>
                {displayRole ?? ""}
              </p>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}