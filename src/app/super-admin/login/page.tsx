"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSuperAdminAuth } from "@/lib/superadmin-auth";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useSuperAdminAuth();
  const [userName, setUserName] = useState("superadmin");
  const [password, setPassword] = useState("admin@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Super Admin</h1>
          <p className="text-slate-500 font-medium">Architecture SaaS control panel</p>
        </div>

        <Card className="p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold">Login failed</p>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                await login(userName, password);
                router.push("/super-admin");
              } catch (err: any) {
                setError(err?.message ?? "Unable to login");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <Input
                placeholder="superadmin"
                icon={Mail}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full py-4 text-base gap-2 group" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

