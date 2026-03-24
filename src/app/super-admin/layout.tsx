
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SuperAdminAuthProvider, useSuperAdminAuth } from "@/lib/superadmin-auth";
import { SA_RESOURCES } from "@/lib/superadmin-api";

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isLoading, logout } = useSuperAdminAuth();

  const isLogin = pathname === "/super-admin/login";

  useEffect(() => {
    if (!isLoading && !token && !isLogin) {
      router.replace("/super-admin/login");
    }
  }, [isLoading, token, isLogin, router]);

  if (isLogin) return <>{children}</>;

  // Show loader only briefly during hydration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none uppercase tracking-wider">Super Admin</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Infrastructure Control</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-bold rounded-xl"
            onClick={() => {
              logout();
              router.push("/super-admin/login");
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 h-fit sticky top-24">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">SaaS Management</p>
            <nav className="space-y-1">
              <Link
                href="/super-admin"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  pathname === "/super-admin" ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              {SA_RESOURCES.map((r) => {
                const href = `/super-admin/${r.key}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const Icon = r.key === "tenant" ? Building2 : 
                             r.key === "subscriptionplan" ? CreditCard : 
                             r.key === "user" ? Users : 
                             r.key === "client" ? UserCheck : ShieldCheck;
                return (
                  <Link
                    key={r.key}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                      active ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {r.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminAuthProvider>
      <Shell>{children}</Shell>
    </SuperAdminAuthProvider>
  );
}
