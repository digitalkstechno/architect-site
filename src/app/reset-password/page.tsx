"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
          <p className="text-sm text-red-800 font-medium">Invalid Reset Link</p>
          <p className="text-xs text-red-700 mt-1">This password reset link is missing a valid token.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Password Reset Complete!</h2>
          <p className="text-sm text-slate-500">Your password has been successfully updated.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          Proceed to Login
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Create New Password</h2>
        <p className="text-sm text-slate-500">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
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
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
              }}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-300",
                errors.confirmPassword ? "border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              )}
            />
          </div>
          {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <Suspense fallback={<div className="animate-pulse bg-slate-200 w-full h-64 rounded-xl"></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
