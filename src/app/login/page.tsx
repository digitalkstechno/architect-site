"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, User, Lock, ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-[30rem] h-[30rem] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-blue-200/30 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-[2rem] shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">ArchiSite</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Construction SaaS Platform</p>
        </div>

        <Card className="p-10 rounded-[3rem] shadow-2xl border-slate-100 bg-white/80 backdrop-blur-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
            <p className="text-xs font-medium text-slate-500">Access your construction management workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-xs font-bold text-red-400">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <Input 
                type="text" 
                placeholder="Enter your username" 
                icon={User} 
                required 
                className="rounded-2xl h-12" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot?</button>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                icon={Lock} 
                required 
                className="rounded-2xl h-12" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className={cn(
                "w-full py-4 text-sm font-black uppercase tracking-widest gap-2 group rounded-2xl shadow-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 transition-all duration-300"
              )}
            >
              {loading ? "Authenticating..." : "Sign In to Console"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="text-center pt-2 space-y-4">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Don't have an account?{" "}
              <button type="button" className="text-indigo-600 hover:underline">Request Access</button>
            </p>
            
            <div className="pt-4 border-t border-slate-100">
              <Link 
                href="/super-admin/login" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
