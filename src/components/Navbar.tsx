"use client";

import { Bell, Search, UserCircle, Settings, Menu, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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

  const notifications = [
    { id: 1, text: "Foundation complete at Modern Villa", time: "2m ago", icon: CheckCircle2, color: "text-green-500" },
    { id: 2, text: "New message from Alice Johnson", time: "15m ago", icon: Clock, color: "text-blue-500" },
    { id: 3, text: "Payment overdue for Lakeview project", time: "1h ago", icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <>
      {/* Overlay for closing dropdowns when clicking outside */}
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
          <h1 className="text-sm lg:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
            {getPageTitle(pathname)}
          </h1>
        </div>

      <div className="flex items-center gap-2 lg:gap-6">
  

        <div className="flex items-center gap-1 lg:gap-2 border-l border-slate-200 pl-2 lg:pl-6">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("relative", showNotifications && "bg-indigo-50 text-indigo-600")}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-6 py-2 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Mark all read</button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 border-b border-slate-50 last:border-0">
                      <div className={cn("p-2 rounded-xl bg-slate-50 h-fit", n.color)}>
                        <n.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 leading-tight">{n.text}</p>
                        <p className="text-[10px] font-medium text-slate-400">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 pt-4 text-center">
                  <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest">View All Notifications</Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className={showSettings ? "bg-indigo-50 text-indigo-600" : ""}
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {showSettings && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-6 py-2 border-b border-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">Quick Settings</h3>
                </div>
                <div className="py-2">
                  <button className="w-full px-6 py-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <UserCircle className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="w-full px-6 py-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Preferences
                  </button>
                  <div className="mx-6 my-2 border-t border-slate-50" />
                  <div className="px-6 py-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dark Mode</span>
                    <div className="w-8 h-4 bg-slate-200 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 lg:mx-2 hidden sm:block" />

          <button className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all duration-200 group">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
              <UserCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[100px]">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  </>
);
}
