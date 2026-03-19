"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleId = string; // supports dynamic roles too

export type RoleConfig = {
  id: RoleId;
  name: string;
  color: string;
  pages: string[];
  canDelete: boolean; // false = system role
};

export const ALL_PAGES = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "clients",      label: "Clients" },
  { key: "projects",     label: "Projects" },
  { key: "tasks",        label: "Tasks" },
  { key: "workers",      label: "Workers" },
  { key: "supervisors",  label: "Supervisors" },
  { key: "attendance",   label: "Attendance" },
  { key: "site-updates", label: "Site Updates" },
  { key: "site-photos",  label: "Site Photos" },
  { key: "payment-ledger", label: "Payment Ledger" },
  { key: "bank-brief",    label: "Bank Brief" },
  { key: "project-estimation", label: "Project Estimation" },
  { key: "tenants",      label: "Tenants Management" },
  { key: "plans",        label: "Subscription Plans" },
  { key: "system-users", label: "System Users" },
  { key: "permissions",  label: "Global Permissions" },
  { key: "calendar",     label: "Calendar" },
  { key: "reports",      label: "Reports" },
  { key: "messages",     label: "Messages" },
  { key: "settings",     label: "Settings" },
];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "super-admin", name: "Super Admin", color: "slate", canDelete: false,
    pages: ["dashboard", "tenants", "plans", "system-users", "permissions"],
  },
  {
    id: "TENANT_ADMIN", name: "Tenant Admin", color: "indigo", canDelete: false,
    pages: ALL_PAGES.filter(p => !["tenants", "plans", "system-users", "permissions"].includes(p.key)).map(p => p.key),
  },
  {
    id: "TENANT_CLIENT", name: "Tenant Client", color: "blue", canDelete: false,
    pages: ["dashboard", "site-photos", "payment-ledger", "messages"],
  },
  {
    id: "architect", name: "Architect", color: "indigo", canDelete: false,
    pages: ALL_PAGES.filter(p => !["tenants", "plans", "system-users", "permissions"].includes(p.key)).map(p => p.key),
  },
  {
    id: "client", name: "Client", color: "blue", canDelete: false,
    pages: ["dashboard", "site-photos", "payment-ledger", "messages"],
  },
  {
    id: "supervisor", name: "Supervisor", color: "orange", canDelete: false,
    pages: ["dashboard", "projects", "tasks", "workers", "attendance", "site-updates", "site-photos", "messages"],
  },
  {
    id: "worker", name: "Worker", color: "green", canDelete: false,
    pages: ["dashboard", "site-photos", "messages"],
  },
  {
    id: "accountant", name: "Accountant", color: "purple", canDelete: false,
    pages: ["dashboard", "payment-ledger", "bank-brief", "projects", "reports", "clients"],
  },
  {
    id: "site-engineer", name: "Site Engineer", color: "rose", canDelete: false,
    pages: ["dashboard", "projects", "tasks", "site-updates", "site-photos", "workers", "reports", "messages"],
  },
];

interface RoleContextType {
  roles: RoleConfig[];
  addRole: (name: string, color: string) => RoleConfig;
  deleteRole: (id: string) => void;
  updateRolePages: (id: string, pages: string[]) => void;
  getRoleById: (id: string) => RoleConfig | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
const STORAGE_KEY = "archisite_roles";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ROLES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ROLES;
  });

  // Persist to localStorage whenever roles change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }, [roles]);

  const addRole = (name: string, color: string): RoleConfig => {
    const newRole: RoleConfig = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      color,
      pages: ["dashboard"],
      canDelete: true,
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id || !r.canDelete));
  };

  const updateRolePages = (id: string, pages: string[]) => {
    setRoles(prev => prev.map(r => r.id === id && r.id !== "architect" ? { ...r, pages } : r));
  };

  const getRoleById = (id: string) => roles.find(r => r.id === id);

  return (
    <RoleContext.Provider value={{ roles, addRole, deleteRole, updateRolePages, getRoleById }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRoles must be used within RoleProvider");
  return ctx;
}
