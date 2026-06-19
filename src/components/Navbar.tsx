"use client";

import { Bell, Search, UserCircle, Settings, Menu, X, CheckCircle2, Clock, AlertCircle, MessageSquare, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useNotification } from "@/lib/notification-context";
import { Pause, Play } from "lucide-react";
import { attendanceService } from "@/services/attendance.service";
import toast from "react-hot-toast";
import { useTheme } from "@/lib/theme-context";

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
  if (pathname === "/settings") return "System Settings";
  if (pathname === "/site-photos") return "Site Documentation";
  if (pathname === "/messages") return "Communication Hub";
  return "Dashboard";
};

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Time Tracker State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  const fetchStatus = () => {
    const isOfficeUser = user && (user.team?.toLowerCase() === "office" || String(user.role).toLowerCase() === "office");
    if (isOfficeUser) {
      attendanceService.getMyStatus().then((res: any) => {
        if (res && res.logs && res.logs.length > 0) {
          const lastLog = res.logs[res.logs.length - 1];
          if (!lastLog.checkOut) {
            setIsClockedIn(true);
            const startTime = new Date(lastLog.checkIn).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            setTimer(elapsed);

            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = setInterval(() => {
              setTimer(prev => prev + 1);
            }, 1000);
          } else {
            setIsClockedIn(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          }
        } else {
          setIsClockedIn(false);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
      }).catch(console.error);
    }
  };

  useEffect(() => {
    fetchStatus();
    window.addEventListener("attendance_updated", fetchStatus);
    return () => {
      window.removeEventListener("attendance_updated", fetchStatus);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
        toast.success("Clocked In Successfully");
        window.dispatchEvent(new Event("attendance_updated"));
      } else {
        await attendanceService.checkOut();
        setIsClockedIn(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        toast.success(`Clocked Out. Total time: ${formatTimer(timer)}`);
        window.dispatchEvent(new Event("attendance_updated"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (pathname === "/login") return null;

  const { notifications, unreadCount, unreadMessageCount, markAsRead, markAllAsRead } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return { Icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'task_completed': return { Icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' };
      default: return { Icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-50' };
    }
  };

  return (
    <>
      {/* Overlay for closing dropdowns when clicking outside */}
      {(showNotifications || showSettings || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowNotifications(false);
            setShowSettings(false);
            setShowProfileMenu(false);
          }}
        />
      )}

      <header className="h-14 bg-gradient-to-r from-white via-primary-50/50 to-primary-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 fixed top-0 right-0 left-0 lg:left-60 z-40 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onMenuToggle}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-slate-900 dark:text-white tracking-tight">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
              {user?.role} / {pathname === "/" ? "Overview" : pathname.split("/")[1]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex relative group">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
            <input
              type="text"
              placeholder="Quick search..."
              className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-500 w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            {/* Time Tracker for Office Staff */}
            {(user?.team?.toLowerCase() === "office" || user?.role?.toLowerCase() === "office") && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-inner mr-2 transition-all duration-500">
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Shift Duration</span>
                  <span className={cn(
                    "text-xs font-mono font-bold leading-none",
                    isClockedIn ? "text-primary-600 animate-pulse" : "text-slate-400"
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
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  )}
                  title={isClockedIn ? "Clock Out" : "Clock In"}
                >
                  {isClockedIn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="relative">
              <Link href="/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full border border-white flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-sm animate-in zoom-in">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 relative", showNotifications && "bg-slate-100 text-primary-600")}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                  setShowProfileMenu(false);
                }}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 uppercase tracking-widest"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">No notifications yet.</p>
                    ) : notifications.map((n) => {
                      const { Icon, color, bg } = getIcon(n.type);
                      return (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={cn(
                            "px-4 py-3 transition-colors cursor-pointer flex gap-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                            n.isRead
                              ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                              : "bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-50 dark:hover:bg-primary-900/40"
                          )}
                        >
                          <div className={cn("mt-0.5 p-1 rounded-full", bg, color, "dark:bg-slate-800 dark:text-slate-300")}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <p className={cn("text-xs leading-tight", n.isRead ? "font-medium text-slate-600 dark:text-slate-400" : "font-bold text-slate-900 dark:text-slate-200")}>{n.text}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">View All Notifications</Button>
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
                  setShowProfileMenu(false);
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Quick Settings</h3>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                      <UserCircle className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Preferences
                    </button>
                    <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-800" />
                    <div className="px-4 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dark Mode</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTheme();
                        }}
                        className={cn("w-8 h-4 rounded-full relative cursor-pointer transition-colors duration-300", theme === "dark" ? "bg-primary-500" : "bg-slate-200")}
                      >
                        <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300", theme === "dark" ? "translate-x-4" : "translate-x-0.5")} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 lg:mx-2 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowSettings(false);
                  setShowNotifications(false);
                }}
                className={cn(
                  "flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group",
                  showProfileMenu && "bg-slate-50 dark:bg-slate-800"
                )}
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/80 transition-colors flex-shrink-0">
                  <UserCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-1">{user?.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/settings?tab=profile" onClick={() => setShowProfileMenu(false)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link href="/settings?tab=security" onClick={() => setShowProfileMenu(false)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Security
                    </Link>
                    <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
