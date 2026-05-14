"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleId = string; // supports dynamic roles too

export type RoleConfig = {
  id: RoleId;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  pages: string[];
  canDelete: boolean;
  description: string;
};

export type LoginRoleCard = {
  id: RoleId;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  redirectPath: string;
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

export const LOGIN_ROLE_CARDS: LoginRoleCard[] = [
  {
    id: "director",
    name: "Director",
    displayName: "Director",
    icon: "Crown",
    color: "from-indigo-500 to-purple-600",
    description: "Full platform access & oversight",
    redirectPath: "/",
  },
  {
    id: "office-team",
    name: "Office Team",
    displayName: "Office Team",
    icon: "Building",
    color: "from-blue-500 to-cyan-600",
    description: "Manage clients & documentation",
    redirectPath: "/clients",
  },
  {
    id: "clients",
    name: "Clients",
    displayName: "Clients",
    icon: "Users",
    color: "from-emerald-500 to-teal-600",
    description: "Track project progress",
    redirectPath: "/",
  },
  {
    id: "agency",
    name: "Agency",
    displayName: "Agency",
    icon: "Briefcase",
    color: "from-indigo-400 to-blue-500",
    description: "Manage workforce & tasks",
    redirectPath: "/workers",
  },
  {
    id: "academy",
    name: "Academy",
    displayName: "Academy",
    icon: "GraduationCap",
    color: "from-purple-500 to-violet-600",
    description: "Financial oversight & reports",
    redirectPath: "/payment-ledger",
  },
  {
    id: "guest",
    name: "Guest",
    displayName: "Guest",
    icon: "Eye",
    color: "from-slate-500 to-gray-600",
    description: "View portfolio & achievements",
    redirectPath: "/guest",
  },
];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "super-admin", name: "Super Admin", displayName: "Super Admin", icon: "Shield", color: "slate", canDelete: false, description: "Platform administrator",
    pages: ["dashboard", "tenants", "plans", "system-users", "permissions"],
  },
  {
    id: "TENANT_ADMIN", name: "Tenant Admin", displayName: "Tenant Admin", icon: "UserCog", color: "indigo", canDelete: false, description: "Tenant administrator",
    pages: ALL_PAGES.filter(p => !["tenants", "plans", "system-users", "permissions"].includes(p.key)).map(p => p.key),
  },
  {
    id: "TENANT_CLIENT", name: "Tenant Client", displayName: "Tenant Client", icon: "UserCheck", color: "blue", canDelete: false, description: "Client user",
    pages: ["dashboard", "site-photos", "payment-ledger", "messages"],
  },
  {
    id: "director", name: "Director", displayName: "Director", icon: "Crown", color: "indigo", canDelete: false, description: "Director role",
    pages: ALL_PAGES.filter(p => !["tenants", "plans", "system-users", "permissions"].includes(p.key)).map(p => p.key),
  },
  {
    id: "office-team", name: "Office Team", displayName: "Office Team", icon: "Building", color: "blue", canDelete: false, description: "Office team role",
    pages: ["dashboard", "clients", "projects", "messages", "site-photos", "calendar"],
  },
  {
    id: "clients", name: "Clients", displayName: "Clients", icon: "Users", color: "emerald", canDelete: false, description: "Client role",
    pages: ["dashboard", "site-photos", "payment-ledger", "messages"],
  },
  {
    id: "agency", name: "Agency", displayName: "Agency", icon: "Briefcase", color: "indigo", canDelete: false, description: "Agency role",
    pages: ["dashboard", "projects", "tasks", "workers", "attendance", "site-updates", "site-photos", "messages"],
  },
  {
    id: "academy", name: "Academy", displayName: "Academy", icon: "GraduationCap", color: "purple", canDelete: false, description: "Academy role",
    pages: ["dashboard", "payment-ledger", "bank-brief", "projects", "reports", "clients"],
  },
  {
    id: "guest", name: "Guest", displayName: "Guest", icon: "Eye", color: "slate", canDelete: false, description: "Guest access",
    pages: ["dashboard"],
  },
  {
    id: "architect", name: "Architect", displayName: "Architect", icon: "Crown", color: "indigo", canDelete: false, description: "Legacy architect role",
    pages: ALL_PAGES.filter(p => !["tenants", "plans", "system-users", "permissions"].includes(p.key)).map(p => p.key),
  },
  {
    id: "client", name: "Client", displayName: "Client", icon: "Users", color: "blue", canDelete: false, description: "Legacy client role",
    pages: ["dashboard", "site-photos", "payment-ledger", "messages"],
  },
  {
    id: "supervisor", name: "Supervisor", displayName: "Supervisor", icon: "HardHat", color: "orange", canDelete: false, description: "Legacy supervisor role",
    pages: ["dashboard", "projects", "tasks", "workers", "attendance", "site-updates", "site-photos", "messages"],
  },
  {
    id: "worker", name: "Worker", displayName: "Worker", icon: "Wrench", color: "green", canDelete: false, description: "Legacy worker role",
    pages: ["dashboard", "site-photos", "messages"],
  },
  {
    id: "accountant", name: "Accountant", displayName: "Accountant", icon: "Calculator", color: "purple", canDelete: false, description: "Legacy accountant role",
    pages: ["dashboard", "payment-ledger", "bank-brief", "projects", "reports", "clients"],
  },
  {
    id: "site-engineer", name: "Site Engineer", displayName: "Site Engineer", icon: "Ruler", color: "rose", canDelete: false, description: "Legacy site engineer role",
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }, [roles]);

  const addRole = (name: string, color: string): RoleConfig => {
    const newRole: RoleConfig = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      displayName: name.trim(),
      icon: "User",
      color,
      pages: ["dashboard"],
      canDelete: true,
      description: "Custom role",
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id || !r.canDelete));
  };

  const updateRolePages = (id: string, pages: string[]) => {
    setRoles(prev => prev.map(r => r.id === id && r.id !== "director" ? { ...r, pages } : r));
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
