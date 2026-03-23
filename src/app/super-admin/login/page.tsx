
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ChevronRight, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useSuperAdminAuth } from "@/lib/superadmin-auth";
import { toast } from "react-toastify";

export default function SuperAdminLogin() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useSuperAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(userName, password);
      toast.success("Super Admin Login successful!");
      router.push("/super-admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dark theme background effects */}
      <div className="absolute top-0 -left-20 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-[2rem] shadow-2xl shadow-indigo-500/20 ring-8 ring-slate-800">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">SaaS Control Plane</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Super Admin Access Only</p>
        </div>

        <Card className="p-10 rounded-[3rem] shadow-2xl border-slate-800 bg-slate-800/50 backdrop-blur-xl space-y-8">
          <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <p className="text-xs font-bold text-indigo-200 leading-relaxed">
              You are accessing the privileged infrastructure management console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <Input 
                type="text" 
                placeholder="superadmin" 
                icon={User} 
                required 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-2xl h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                icon={Lock} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 text-sm font-black uppercase tracking-widest gap-2 group rounded-2xl shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 border-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Authorize Access
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-1" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
