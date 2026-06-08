"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import GuestLayout from "@/components/GuestLayout";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoginPage = pathname === "/login";
  const isResetPasswordPage = pathname === "/reset-password";

  if (isLoginPage || isResetPasswordPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  // Guest users get a full public website layout
  if (user?.role === "guest") {
    return <GuestLayout>{children}</GuestLayout>;
  }

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
        <main className="pt-28 p-4 md:p-8">
          <div className="pt-10 mx-auto space-y-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
