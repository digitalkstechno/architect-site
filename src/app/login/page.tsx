"use client";

import { useState } from "react";
import {
  Building2, User, Lock, ChevronRight, Loader2,
  Crown, Building, Users, Briefcase, GraduationCap, Eye, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoles, LOGIN_ROLE_CARDS } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const iconMap: Record<string, any> = {
  Crown,
  Building,
  Users,
  Briefcase,
  GraduationCap,
  Eye,
};

export default function LoginPage() {
  const { login, guestLogin } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [guestContact, setGuestContact] = useState("");
  const [guestContactType, setGuestContactType] = useState<"email" | "mobile">("email");
  const [guestLoading, setGuestLoading] = useState(false);
  const [showGuest, setShowGuest] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      toast.success("Login successful!");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestContact.trim()) {
      toast.error("Please enter a valid email or mobile number");
      return;
    }
    setGuestLoading(true);
    try {
      await guestLogin(guestContact, guestContactType);
      toast.success("OTP sent! Redirecting to Guest Dashboard...");
    } catch (err: any) {
      toast.error(err.message || "Guest login failed. Redirecting anyway...");
    } finally {
      setGuestLoading(false);
    }
  };

  const nonGuestRoles = LOGIN_ROLE_CARDS.filter(role => role.id !== "guest");
  const guestRole = LOGIN_ROLE_CARDS.find(role => role.id === "guest");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex bg-gradient-to-r from-indigo-500 to-blue-500 p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">ArchiSite</h1>
          <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Construction SaaS Platform</p>
        </div>

        {!showGuest ? (
          <Card className="p-8 rounded-3xl shadow-xl border-gray-200 bg-white space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
              <p className="text-xs text-gray-500">Enter your credentials to access your workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-600 ml-1">Role</label>
                <select
                  value={selectedRole || ""}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your role</option>
                  {nonGuestRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-600 ml-1">Email or Username</label>
                <Input
                  type="text"
                  placeholder="Enter email or username"
                  icon={User}
                  required
                  className="rounded-xl h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-medium text-gray-600">Password</label>
                  <button type="button" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot?
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  required
                  className="rounded-xl h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3.5 text-sm font-semibold uppercase tracking-wider gap-2 group rounded-xl",
                  "shadow-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600",
                  "transition-all duration-300",
                  loading && "opacity-80 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-1 space-y-3">
              <p className="text-[11px] text-gray-500">
                Don{"'"}t have an account?{" "}
                <button type="button" className="text-indigo-600 hover:underline font-medium">
                  Request Access
                </button>
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                onClick={() => setShowGuest(true)}
                className={cn(
                  "group w-full px-5 py-2.5 rounded-xl border border-indigo-200",
                  "bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100",
                  "transition-all duration-300 ease-out",
                  "flex items-center justify-center gap-3",
                  "hover:shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-900 font-semibold text-xs">Continue as Guest</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 rounded-3xl shadow-xl border-indigo-300 bg-white space-y-6">
            <div className="text-center space-y-3">
              <button
                onClick={() => setShowGuest(false)}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mx-auto"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Back to Sign In
              </button>
              <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Guest Access</h2>
              <p className="text-xs text-gray-500">Enter your email or mobile to receive an OTP</p>
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-600 ml-1">Contact Method</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestContactType("email")}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all",
                      guestContactType === "email"
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestContactType("mobile")}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all",
                      guestContactType === "mobile"
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-600 ml-1">
                  {guestContactType === "email" ? "Email Address" : "Mobile Number"}
                </label>
                <Input
                  type={guestContactType === "email" ? "email" : "tel"}
                  placeholder={guestContactType === "email" ? "Enter your email" : "Enter mobile number"}
                  icon={User}
                  required
                  className="rounded-xl h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={guestLoading}
                className={cn(
                  "w-full py-3.5 text-sm font-semibold uppercase tracking-wider gap-2 group rounded-xl",
                  "shadow-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600",
                  "transition-all duration-300",
                  guestLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {guestLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue as Guest
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <button type="button" className="text-indigo-600 hover:underline font-medium">
                  Terms of Service
                </button>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
