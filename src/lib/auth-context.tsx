"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { setSuperAdminToken, clearSuperAdminToken } from "@/lib/superadmin-api";

// Role is now a string to support dynamic custom roles
export type Role = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | { 
    roleName: string; 
    _id: string; 
    tenantId?: string;
    permissions?: Array<{ module: string; actions: string[] }>;
  };
  projectId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  getEffectiveRole: (u: User | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users for built-in roles
const DEMO_USERS: Record<string, User> = {
  architect:       { id: "1", name: "Arch. Sarah Connor", email: "sarah@archisite.pro",  role: "architect" },
  "super-admin":   { id: "sa-1", name: "Super Admin",    email: "admin@archisite.pro",  role: "super-admin" },
  client:          { id: "2", name: "Alice Johnson",       email: "alice@example.com",    role: "client",        projectId: "1" },
  supervisor:      { id: "3", name: "Mike Ross",           email: "mike@archisite.pro",   role: "supervisor",    projectId: "1" },
  worker:          { id: "4", name: "John Doe",            email: "john@trades.pro",      role: "worker",        projectId: "1" },
  accountant:      { id: "5", name: "Riya Mehta",          email: "riya@archisite.pro",   role: "accountant" },
  "site-engineer": { id: "6", name: "Arjun Kapoor",        email: "arjun@archisite.pro",  role: "site-engineer" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      // Real API call to login
      const res = await fetch("http://localhost:9000/architecture/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: identifier, password }), // Using identifier as userName for API consistency
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.message || "Login failed");
      }

      const userData = payload.data?.user || payload.user;
      const token = payload.data?.token || payload.token;

      if (!userData) throw new Error("User data not found in response");

      const finalUser: User = {
        id: userData.id || userData._id,
        name: userData.userName || userData.name,
        email: userData.email || identifier,
        role: userData.role,
        projectId: userData.projectId,
      };

      setUser(finalUser);
      localStorage.setItem("auth_user", JSON.stringify(finalUser));
      if (token) localStorage.setItem("auth_token", token);
      
      router.push("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const getEffectiveRole = (u: User | null): string => {
    if (!u) return "";
    if (typeof u.role === "string") return u.role;
    return u.role.roleName;
  };

  useEffect(() => {
    const isPublicPath = pathname === "/login" || pathname.startsWith("/super-admin");
    if (!isLoading && !user && !isPublicPath) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getEffectiveRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
