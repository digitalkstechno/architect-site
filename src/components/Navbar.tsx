"use client";

import { Bell, Search, UserCircle, Settings, Menu, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { Pause, Play } from "lucide-react";
import { attendanceService } from "@/services/attendance.service";
import toast from "react-hot-toast";

const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "Dashboard Overview";
  if (pathname.startsWith("/projects")) return "Project Portfolio";
  if (pathname === "/tasks") return "Task Tracker";
  if (pathname === "/workers") return "Agency Directory";
  if (pathname === "/supervisors") return "Client Directory";
  if (pathname === "/clients") return "Office Team Directory";
  // if (pathname === "/site-updates") return "Recent Site Updates";
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
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Time Tracker State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  useEffect(() => {
    if (user && user.team === "Office" && user.trackAttendance) {
      attendanceService.getMyStatus().then((res: any) => {
        if (res && res.logs && res.logs.length > 0) {
          const lastLog = res.logs[res.logs.length - 1];
          if (!lastLog.checkOut) {
            setIsClockedIn(true);
            const startTime = new Date(lastLog.checkIn).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            setTimer(elapsed);

            const interval = setInterval(() => {
              setTimer(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
          }
        }
      }).catch(console.error);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [user]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockToggle = async () => {
    try {
      if (!isClockedIn) {
        await attendanceService.checkIn();
        setIsClockedIn(true);
        setTimer(0);
        const interval = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        toast.success("Clocked In Successfully");
      } else {
        await attendanceService.checkOut();
        setIsClockedIn(false);
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        toast.success(`Clocked Out. Total time: ${formatTimer(timer)}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (pathname === "/login") return null;

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

      <header className="h-14 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-60 z-40 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onMenuToggle}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-slate-900 tracking-tight">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider hidden sm:block">
              {user?.role} / {pathname === "/" ? "Overview" : pathname.split("/")[1]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Quick search..."
              className="bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            {/* Time Tracker for Office Staff */}
            {user?.team === "Office" && user?.trackAttendance && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-inner mr-2 transition-all duration-500">
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Shift Duration</span>
                  <span className={cn(
                    "text-xs font-mono font-bold leading-none",
                    isClockedIn ? "text-indigo-600 animate-pulse" : "text-slate-400"
                  )}>
                    {formatTimer(timer)}
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button
                  onClick={handleClockToggle}
                  className={cn(
                    "p-1.5 rounded-full transition-all active:scale-95 shadow-sm",
                    isClockedIn
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                  title={isClockedIn ? "Clock Out" : "Clock In"}
                >
                  {isClockedIn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 relative", showNotifications && "bg-slate-100 text-primary-600")}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                    <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">Mark all read</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 border-b border-slate-50 last:border-0">
                        <div className={cn("mt-0.5", n.color)}>
                          <n.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{n.text}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2 text-center">
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
                className={cn("h-8 w-8", showSettings && "bg-slate-100 text-primary-600")}
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900">Quick Settings</h3>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                      <UserCircle className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Preferences
                    </button>
                    <div className="mx-4 my-1 border-t border-slate-100" />
                    <div className="px-4 py-2 flex items-center justify-between">
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
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
