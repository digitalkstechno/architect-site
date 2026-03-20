"use client";

import {
  UserCircle2, Building2, Bell, ShieldCheck, CreditCard,
  Save, Trash2, Palette, Briefcase, Users, Plus, X, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useRoles, ALL_PAGES, RoleConfig } from "@/lib/role-context";

type SettingTab = "profile" | "company" | "notifications" | "security" | "roles";

const initialNotifs = { siteProgress: true, paymentReminders: true, workerUpdates: false, clientMessaging: true };

const COLOR_OPTIONS = ["indigo", "blue", "orange", "green", "purple", "rose", "slate", "teal"];

const colorClass: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  indigo: { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-600" },
  blue:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-600" },
  orange: { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500" },
  green:  { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-600" },
  purple: { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-600" },
  rose:   { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-600" },
  slate:  { bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   dot: "bg-slate-600" },
  teal:   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-600" },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { roles, addRole, deleteRole, updateRolePages } = useRoles();
  const [activeTab, setActiveTab] = useState<SettingTab>("notifications");
  const [notifs, setNotifs] = useState(initialNotifs);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("teal");
  const [savedMsg, setSavedMsg] = useState(false);

  const isArchitect = user?.role === "architect";

  const tabs = [
    { id: "profile",       label: "My Profile",      icon: UserCircle2 },
    { id: "company",       label: "Company Info",     icon: Building2 },
    { id: "notifications", label: "Notifications",    icon: Bell },
    { id: "security",      label: "Security",         icon: ShieldCheck },
    ...(isArchitect ? [{ id: "roles", label: "Role Management", icon: Users }] : []),
  ];

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleTogglePage = (role: RoleConfig, pageKey: string) => {
    if (role.id === "architect") return;
    const has = role.pages.includes(pageKey);
    const updated = has ? role.pages.filter(p => p !== pageKey) : [...role.pages, pageKey];
    updateRolePages(role.id, updated);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const created = addRole(newRoleName, newRoleColor);
    setExpandedRole(created.id);
    setNewRoleName("");
    setNewRoleColor("teal");
    setShowAddRole(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-sm font-medium text-slate-500">Customize your workspace and account preferences</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
          {savedMsg ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {savedMsg ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Tab Nav */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as SettingTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}>
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl font-bold text-indigo-600 border-2 border-dashed border-indigo-200 relative group cursor-pointer hover:bg-indigo-100 transition-colors">
                    {user?.name?.split(" ").map(n => n[0]).join("") ?? "U"}
                    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">
                      {typeof user?.role === "string" ? user.role : user?.role?.roleName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name",     value: user?.name ?? "" },
                    { label: "Email Address", value: user?.email ?? "" },
                    { label: "Phone Number",  value: "+1 (555) 902-1234" },
                    { label: "Role",          value: typeof user?.role === "string" ? user.role : user?.role?.roleName ?? "" },
                  ].map(f => (
                    <div key={f.label} className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">{f.label}</label>
                      <input defaultValue={f.value} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company */}
            {activeTab === "company" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Company Name",    value: "ArchiSite Pro Designs" },
                  { label: "Tax ID / VAT",    value: "US-9283-1234" },
                  { label: "Office Address",  value: "123 Architecture Lane, CA 90210" },
                  { label: "Company Website", value: "www.archisite.pro" },
                ].map(f => (
                  <div key={f.label} className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  </div>
                ))}
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {[
                  { id: "siteProgress",     title: "Site Progress Alerts",  desc: "Get notified when a construction stage is marked complete.", icon: Briefcase },
                  { id: "paymentReminders", title: "Payment Reminders",     desc: "Receive alerts for overdue and pending client payments.",    icon: CreditCard },
                  { id: "workerUpdates",    title: "Worker Updates",        desc: "Stay informed about worker check-ins and task assignments.", icon: UserCircle2 },
                  { id: "clientMessaging",  title: "Client Messaging",      desc: "Real-time notifications for new client messages.",           icon: Bell },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                        <item.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle
                      checked={notifs[item.id as keyof typeof notifs]}
                      onChange={() => setNotifs(p => ({ ...p, [item.id]: !p[item.id as keyof typeof notifs] }))}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {["Current Password", "New Password", "Confirm New Password"].map(label => (
                  <div key={label} className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  </div>
                ))}
                <Button>Update Password</Button>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500 mt-1">Add an extra layer of security</p>
                  </div>
                  <Toggle checked={false} onChange={() => {}} />
                </div>
              </div>
            )}

            {/* ── ROLE MANAGEMENT ── */}
            {activeTab === "roles" && isArchitect && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Role Management</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Create roles, set page access. Changes reflect on Login &amp; Sidebar instantly.
                    </p>
                  </div>
                  <Button onClick={() => setShowAddRole(v => !v)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Role
                  </Button>
                </div>

                {/* Add Role Form */}
                {showAddRole && (
                  <div className="p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">Create New Role</p>
                      <button onClick={() => setShowAddRole(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="flex gap-3">
                      <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                        placeholder="e.g. QA Inspector, Foreman..."
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <div className="flex gap-2 items-center">
                        {COLOR_OPTIONS.map(c => (
                          <button key={c} type="button" onClick={() => setNewRoleColor(c)}
                            className={cn(
                              "w-6 h-6 rounded-full transition-all border-2",
                              colorClass[c]?.dot ?? "bg-slate-400",
                              newRoleColor === c ? "border-slate-900 scale-125" : "border-transparent"
                            )} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      New role starts with Dashboard access only. Expand it below to add more pages.
                    </p>
                    <Button onClick={handleAddRole} className="w-full">Create Role</Button>
                  </div>
                )}

                {/* Roles List */}
                <div className="space-y-3">
                  {roles.map(role => {
                    const c = colorClass[role.color] ?? colorClass.slate;
                    const isExpanded = expandedRole === role.id;
                    return (
                      <div key={role.id}
                        className={cn("rounded-2xl border-2 overflow-hidden transition-all duration-200",
                          isExpanded ? "border-indigo-300 shadow-md" : "border-slate-100")}>

                        {/* Role Row */}
                        <div className={cn("flex items-center justify-between px-5 py-4", isExpanded ? "bg-indigo-50" : "bg-white")}>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={cn("w-3 h-3 rounded-full flex-shrink-0", c.dot)} />
                            <span className="text-sm font-bold text-slate-900">{role.name}</span>
                            {!role.canDelete && (
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                System
                              </span>
                            )}
                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border", c.bg, c.text, c.border)}>
                              {role.pages.length} / {ALL_PAGES.length} pages
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                              className={cn(
                                "text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
                                isExpanded
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              )}>
                              {isExpanded ? "Done" : "Edit Access"}
                            </button>
                            {role.canDelete && (
                              <button onClick={() => { deleteRole(role.id); if (expandedRole === role.id) setExpandedRole(null); }}
                                className="text-xs font-bold text-red-500 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-all">
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Page Permissions */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50 space-y-4 animate-in slide-in-from-top-1 duration-150">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {role.id === "architect" ? "Architect has access to all pages (locked)" : "Toggle pages to grant or revoke access"}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {ALL_PAGES.map(page => {
                                const hasAccess = role.pages.includes(page.key);
                                const locked = role.id === "architect";
                                return (
                                  <button key={page.key} type="button"
                                    disabled={locked}
                                    onClick={() => handleTogglePage(role, page.key)}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                                      hasAccess
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
                                      locked && "opacity-50 cursor-not-allowed"
                                    )}>
                                    <CheckCircle2 className={cn("w-3.5 h-3.5 flex-shrink-0", hasAccess ? "text-white" : "text-slate-300")} />
                                    {page.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          {activeTab !== "roles" && (
            <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-2xl"><Trash2 className="w-6 h-6 text-red-600" /></div>
                <div>
                  <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-700/70 mt-1">Irreversibly delete your account and all associated project data.</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95">
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
