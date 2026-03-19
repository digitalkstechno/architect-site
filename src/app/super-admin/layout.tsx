"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SuperAdminAuthProvider, useSuperAdminAuth } from "@/lib/superadmin-auth";
import { SA_RESOURCES } from "@/lib/superadmin-api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isLoading, logout } = useSuperAdminAuth();

  const isLogin = pathname === "/super-admin/login";

  // Allow login page without token
  if (isLogin) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    router.replace("/super-admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-none">Super Admin</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SaaS Control Plane</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push("/super-admin/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="bg-white border border-slate-200 rounded-3xl p-4 h-fit sticky top-24">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Modules</p>
          <nav className="space-y-1">
            <Link
              href="/super-admin"
              className={cn(
                "block px-3 py-2.5 rounded-2xl text-sm font-bold transition-all",
                pathname === "/super-admin" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Overview
            </Link>
            {SA_RESOURCES.map((r) => {
              const href = `/super-admin/${r.key}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={r.key}
                  href={href}
                  className={cn(
                    "block px-3 py-2.5 rounded-2xl text-sm font-bold transition-all",
                    active ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {r.label}
                </Link>
              );
            })}
          </nav>
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

