"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "architect" | "client" | "supervisor" | "worker";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  projectId?: string; // For clients, supervisors, and workers
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for existing session
    try {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth user:", error);
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: Role) => {
    let userData: User;
    
    switch (role) {
      case "architect":
        userData = { id: "1", name: "Arch. Sarah Connor", email: "sarah@archisite.pro", role: "architect" };
        break;
      case "client":
        userData = { id: "2", name: "Alice Johnson", email: "alice@example.com", role: "client", projectId: "1" };
        break;
      case "supervisor":
        userData = { id: "3", name: "Mike Ross", email: "mike@site.pro", role: "supervisor", projectId: "1" };
        break;
      case "worker":
        userData = { id: "4", name: "John Doe", email: "john@trades.pro", role: "worker", projectId: "1" };
        break;
      default:
        return;
    }

    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
