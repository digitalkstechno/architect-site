"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { authService } from "@/services/auth.service";
import { useRoles } from "./role-context";

// Role is now a string to support dynamic custom roles
export type Role = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string | any;
  team?: "Office" | "Site";
  trackAttendance?: boolean;
  config?: {
    hoursPerDay: number;
    daysPerMonth: number;
  };
  projectId?: string;
  mobile?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, isGuest?: boolean, mobile?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { refreshRoles } = useRoles();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      const savedToken = localStorage.getItem("token");
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string, isGuest?: boolean, mobile?: string) => {
    if (isGuest) {
      const guestUser: User = {
        id: "guest_" + Date.now(),
        name: "Guest User",
        email: "guest@archisite.pro",
        role: "guest",
        mobile
      };
      setUser(guestUser);
      localStorage.setItem("auth_user", JSON.stringify(guestUser));
      router.push("/guest/home");
      return;
    }

    try {
      const data = (await authService.login({ email, password })) as any;

      const finalUser: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role?.name || data.role,
        team: data.team,
        trackAttendance: data.trackAttendance,
        config: data.config,
      };

      setUser(finalUser);
      localStorage.setItem("auth_user", JSON.stringify(finalUser));
      localStorage.setItem("token", data.token);
      // Dispatch storage event so stores re-fetch with the new token
      window.dispatchEvent(new Event("storage"));
      
      // Refresh roles to ensure correct permissions are loaded for the sidebar
      await refreshRoles();
      
      router.push("/");
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (isLoading) return;
    const isPublicPage = pathname === "/login" || pathname === "/reset-password";
    const isGuestPage = pathname.startsWith("/guest");
    if (!user && !isPublicPage) {
      router.push("/login");
    } else if (user?.role === "guest" && !isGuestPage) {
      // Guest trying to access admin pages → redirect to guest home
      router.push("/guest/home");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
