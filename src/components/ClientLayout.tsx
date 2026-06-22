"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import GuestLayout from "@/components/GuestLayout";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isInitialized, getRoleById } = useRoles();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isAuthLoading || (user && !isInitialized && pathname !== "/login" && pathname !== "/reset-password")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoginPage = pathname === "/login";
  const isResetPasswordPage = pathname === "/reset-password";
  const isAgencyRegisterPage = pathname === "/agency-register";

  // Prevent flash of unauthorized or layout when user logs out and is being redirected to /login
  if (!user && !isLoginPage && !isResetPasswordPage && !isAgencyRegisterPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-600 dark:border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage || isResetPasswordPage || isAgencyRegisterPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  // Guest users get a full public website layout
  if (user?.role === "guest") {
    return <GuestLayout>{children}</GuestLayout>;
  }

  const roleName = typeof user?.role === 'string' ? user.role : (user?.role?.name || "");
  const roleId = roleName.toLowerCase().replace(/\s+/g, '-');
  const roleConfig = getRoleById(roleId);
  const allowedPages = roleConfig?.pages ?? [];

  const getPageKey = (path: string) => {
    if (path === "/") return "dashboard";
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "dashboard";
    return segments[0];
  };

  const currentPageKey = getPageKey(pathname);
  const EXEMPT_PAGES = ["login", "reset-password", "profile"];

  const isAuthorized = EXEMPT_PAGES.includes(currentPageKey) || allowedPages.includes(currentPageKey);

  return (
    <div className="flex relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:w-60",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onMobileClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="flex-1 min-h-screen lg:pl-60 overflow-x-hidden">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="pt-16 md:pt-20 p-4 md:p-8">
          <div className="mx-auto space-y-8 md:space-y-12">
            {!isAuthorized ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                  <p className="text-slate-500 mb-6">You do not have permission to view this page.</p>
                  <Link href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm inline-block">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
