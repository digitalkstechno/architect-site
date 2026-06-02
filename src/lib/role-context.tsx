"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { roleService } from "@/services/role.service";

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
  { key: "projects",     label: "Projects" },
  { key: "office-work",  label: "Office Work" },
  { key: "site-work",    label: "Site Work" },
  { key: "tasks",        label: "Tasks" },
  { key: "office-team",  label: "Office Team" },
  { key: "site-team",    label: "Site Team" },
  { key: "clients",      label: "Clients" },
  { key: "site-updates", label: "Site Updates" },
  { key: "site-photos",  label: "Site Photos" },
  { key: "attendance",   label: "Attendance" },
  { key: "working-sop",  label: "Working SOP" },
  { key: "payments",     label: "Payments" },
  { key: "calendar",     label: "Calendar" },
  { key: "reports",      label: "Reports" },
  { key: "messages",     label: "Messages" },
  { key: "staff",        label: "Staff Management" },
  { key: "roles",        label: "Role Management" },
  { key: "settings",     label: "Settings" },
];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "director", name: "DIRECTOR", color: "slate", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
  {
    id: "architect", name: "ARCHITECT", color: "indigo", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
  {
    id: "admin", name: "ADMIN", color: "rose", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
  {
    id: "office-team", name: "OFFICE TEAM", color: "blue", canDelete: false,
    pages: ["dashboard", "projects", "office-work", "messages", "calendar"],
  },
  {
    id: "site-engineer", name: "SITE ENGINEER", color: "orange", canDelete: false,
    pages: ["dashboard", "projects", "site-updates", "site-photos", "tasks", "site-team"],
  },
  {
    id: "supervisor", name: "SUPERVISOR", color: "green", canDelete: false,
    pages: ["dashboard", "projects", "tasks", "site-updates"],
  },
  {
    id: "accountant", name: "ACCOUNTANT", color: "purple", canDelete: false,
    pages: ["dashboard", "payments", "reports", "working-sop"],
  },
  {
    id: "client", name: "CLIENT PORTAL", color: "blue", canDelete: false,
    pages: ["dashboard", "projects", "site-updates", "site-photos", "payments", "messages"],
  },
  {
    id: "guest", name: "GUEST MODE", color: "rose", canDelete: false,
    pages: ["dashboard", "projects", "working-sop"],
  },
];

interface RoleContextType {
  roles: RoleConfig[];
  isInitialized: boolean;
  refreshRoles: () => Promise<void>;
  addRole: (name: string, color: string) => RoleConfig;
  deleteRole: (id: string) => void;
  updateRolePages: (id: string, pages: string[]) => void;
  getRoleById: (id: string) => RoleConfig | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from Backend
  const fetchRoles = async () => {
    try {
      const backendRoles = await roleService.getAllRoles();
      if (backendRoles && Array.isArray(backendRoles)) {
        // Map backend roles to RoleConfig
        const mappedRoles: RoleConfig[] = backendRoles.map((r: any) => {
          const hasAll = r.permissions.includes("all");
          
          // Derive pages from permissions
          const derivedPages = hasAll 
            ? ALL_PAGES.map(p => p.key) 
            : ALL_PAGES.filter(p => {
                if (p.key === "dashboard") return true; // Everyone sees dashboard
                return r.permissions.includes(`${p.key}.view`) || r.permissions.includes("all");
              }).map(p => p.key);

          return {
            id: r.name.toLowerCase().replace(/\s+/g, '-'),
            backendId: r._id,
            name: r.name.toUpperCase(),
            color: r.name.toLowerCase() === "director" ? "slate" : "indigo",
            pages: derivedPages,
            canDelete: !["admin", "director", "architect"].includes(r.name.toLowerCase())
          };
        });
        setRoles(mappedRoles);
        setIsInitialized(true);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch roles from backend", error);
    }
    setIsInitialized(true);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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
    // System roles (director, architect) have all-page access locked
    const isSystemRole = id === "architect" || id === "director";
    setRoles(prev => prev.map(r => r.id === id && !isSystemRole ? { ...r, pages } : r));
  };

  const getRoleById = (id: string) => roles.find(r => r.id === id);

  return (
    <RoleContext.Provider value={{ roles, isInitialized, refreshRoles: fetchRoles, addRole, deleteRole, updateRolePages, getRoleById }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRoles must be used within RoleProvider");
  return ctx;
}
