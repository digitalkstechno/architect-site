"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSuperAdminToken, getSuperAdminToken, saLogin, setSuperAdminToken } from "@/lib/superadmin-api";

type SuperAdminAuthContextType = {
  token: string | null;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
};

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

export function SuperAdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(getSuperAdminToken());
    setIsLoading(false);
  }, []);

  const api = useMemo<SuperAdminAuthContextType>(() => {
    const login = async (userName: string, password: string) => {
      const payload = await saLogin(userName, password);
      const t =
        payload?.token ??
        payload?.accessToken ??
        payload?.jwt ??
        payload?.data?.token ??
        payload?.data?.accessToken;
      if (t) {
        setSuperAdminToken(String(t));
        setToken(String(t));
      }
    };

    const logout = () => {
      clearSuperAdminToken();
      setToken(null);
    };

    return { token, isLoading, login, logout };
  }, [token]);

  return <SuperAdminAuthContext.Provider value={api}>{children}</SuperAdminAuthContext.Provider>;
}

export function useSuperAdminAuth() {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error("useSuperAdminAuth must be used within SuperAdminAuthProvider");
  return ctx;
}

