"use client";

import { useState } from "react";
import { Building2, Mail, Lock, ChevronRight, ShieldCheck, UserCircle2, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, Role } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("architect");
  const { login } = useAuth();

  const roles = [
    { id: "architect", label: "Architect", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: "client", label: "Client", icon: UserCircle2, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "supervisor", label: "Supervisor", icon: HardHat, color: "text-orange-600", bg: "bg-orange-50" },
    { id: "worker", label: "Worker", icon: HardHat, color: "text-green-600", bg: "bg-green-50" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">ArchiSite</h1>
          <p className="text-slate-500 font-medium">Construction Management Reinvented</p>
        </div>

        <Card className="p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id as Role)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 border-2",
                  selectedRole === r.id 
                    ? "bg-white border-indigo-600 shadow-lg shadow-indigo-50" 
                    : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
                )}
              >
                <div className={cn("p-2 rounded-xl", selectedRole === r.id ? r.bg : "bg-white")}>
                  <r.icon className={cn("w-5 h-5", selectedRole === r.id ? r.color : "text-slate-400")} />
                </div>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider", selectedRole === r.id ? "text-indigo-600" : "text-slate-500")}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                icon={Mail}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-base gap-2 group"
            >
              Sign In to Workspace
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account? <button type="button" className="text-indigo-600 font-bold hover:underline">Request Access</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
