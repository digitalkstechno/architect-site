"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  ChevronRight,
  Phone,
  Eye,
  EyeOff,
  Briefcase,
  Users,
  Camera,
  FileText,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Email → Role Mapping
  const roleCredentials: Record<string, string> = {
    "director@gmail.com": "director",
    "architect@gmail.com": "architect",
    "office@gmail.com": "office-team",
    "engineer@gmail.com": "site-engineer",
    "supervisor@gmail.com": "supervisor",
    "accountant@gmail.com": "accountant",
    "client@gmail.com": "client",
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset email");
      
      setRecoveredPassword("SENT"); // using this as a flag that it was sent successfully
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (isGuest) {
      if (!mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      } else if (mobile.length < 10) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number";
      }
    } else {
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!password.trim()) {
        newErrors.password = "Password is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);
    const loginToast = toast.loading(isGuest ? "Accessing ArchiSite..." : "Signing you in...");

    try {
      if (isGuest) {
        await login("", "", true, mobile);
      } else {
        await login(email, password);
      }
      toast.success("Welcome to ArchiSite!", { id: loginToast });
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Invalid credentials. Please try again.", { id: loginToast });
    } finally {
      setIsLoading(false);
    }
  };

  const guestFeatures = [
    { icon: Briefcase, label: "Work Portfolio", desc: "Explore completed projects" },
    { icon: Camera, label: "Site Photos", desc: "View construction progress" },
    { icon: Users, label: "Meet the Team", desc: "Our architects & engineers" },
    { icon: FileText, label: "Our Process", desc: "How we build excellence" },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel (visible on lg+) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/60 to-slate-900" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ArchiSite</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-300 uppercase tracking-widest">Public Showcase</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Crafting Spaces,<br />
              <span className="text-indigo-400">Building Legacies.</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Explore our portfolio, meet the team, and discover how we turn architectural visions into reality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {guestFeatures.map((f) => (
              <div key={f.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-indigo-300" />
                </div>
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500">© 2025 ArchiSite. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 -right-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="inline-flex bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-200">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">ArchiSite</h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setIsGuest(false)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                !isGuest ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Staff Login
            </button>
            <button
              onClick={() => setIsGuest(true)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                isGuest ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Guest / Public
            </button>
          </div>

          {/* ── GUEST PANEL ── */}
          {isGuest ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Explore as Guest</h2>
                <p className="text-sm text-slate-500">Enter your mobile number to browse our public showcase</p>
              </div>

              {/* What you can see */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">What you'll get access to</p>
                <div className="grid grid-cols-2 gap-2">
                  {guestFeatures.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-3 h-3 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-indigo-800">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (errors.mobile) setErrors(prev => {
                          const { mobile, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-mono focus:outline-none transition-all placeholder:text-slate-300",
                        errors.mobile ? "border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      )}
                    />
                  </div>
                  {errors.mobile && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.mobile}</p>}
                  {!errors.mobile && <p className="text-[11px] text-slate-400 pl-1">No account needed — just your number to continue</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 group"
                >
                  <Eye className="w-4 h-4" />
                  {isLoading ? "Accessing..." : "Explore ArchiSite"}
                  {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Are you a team member?{" "}
                <button onClick={() => setIsGuest(false)} className="text-indigo-600 font-semibold hover:underline">
                  Staff Login →
                </button>
              </p>
            </div>
          ) : isForgotPassword ? (
            /* ── FORGOT PASSWORD PANEL ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500">Enter your email to receive a reset link</p>
              </div>

              {recoveredPassword === "SENT" ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                    <p className="text-sm text-green-800 font-medium mb-1">Check your email!</p>
                    <p className="text-xs text-green-700 mt-2">We've sent a password reset link to <strong>{email}</strong></p>
                  </div>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setRecoveredPassword(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-300",
                          errors.email ? "border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── STAFF LOGIN PANEL ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to your ArchiSite workspace</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => {
                          const { email, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-300",
                        errors.email ? "border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setErrors({}); setRecoveredPassword(null); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => {
                          const { password, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className={cn(
                        "w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-300",
                        errors.password ? "border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all group"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Just browsing?{" "}
                <button onClick={() => setIsGuest(true)} className="text-indigo-600 font-semibold hover:underline">
                  Continue as Guest →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}