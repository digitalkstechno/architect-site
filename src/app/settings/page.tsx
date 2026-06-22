"use client";

import {
  UserCircle2, Building2, Bell, ShieldCheck, CreditCard,
  Save, Trash2, Palette, Briefcase, Users, Plus, X, CheckCircle2,
  Eye, EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useRoles, ALL_PAGES, RoleConfig } from "@/lib/role-context";
import { usePermissions } from "@/hooks/use-permissions";
import { api } from "@/services/api";
import endPointApi from "@/lib/endpoints";
import toast from "react-hot-toast";

type SettingTab = "profile" | "company" | "security" | "roles";

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
  const { user, updateUser, logout } = useAuth();
  const { roles, addRole, deleteRole, updateRolePages } = useRoles();
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  
  // Profile State
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "" });
  
  // Security State
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Company State
  const [companyData, setCompanyData] = useState({ name: "", taxId: "", address: "", website: "" });

  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("teal");
  const [savedMsg, setSavedMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { hasAll } = usePermissions("settings");
  const isAdmin = hasAll;

  const tabs = [
    { id: "profile",       label: "My Profile",      icon: UserCircle2 },
    { id: "security",      label: "Security",         icon: ShieldCheck },
    ...(isAdmin ? [{ id: "roles", label: "Role Management", icon: Users }] : []),
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await api.get(endPointApi.company);
        setCompanyData({
          name: data.name || "",
          taxId: data.taxId || "",
          address: data.address || "",
          website: data.website || ""
        });
      } catch (err) {
        console.error("Failed to load company info");
      }
    };
    if (activeTab === "company") fetchCompany();
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "profile") {
        await api.put(endPointApi.userById(user!.id || (user as any)._id), profileData);
        // We update the auth context user data safely using only the fields we changed
        updateUser(profileData); 
        toast.success("Profile updated");
      } else if (activeTab === "company") {
        await api.put(endPointApi.company, companyData);
        toast.success("Company info updated");
      } else if (activeTab === "security") {
        if (!passwordData.newPassword) {
          toast.error("Please enter a new password");
          return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await api.put(endPointApi.userById(user!.id || (user as any)._id), { password: passwordData.newPassword });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password updated securely");
      }

      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePage = (role: RoleConfig, pageKey: string) => {
    if (role.id === "architect" || role.id === "director") return;
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

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This cannot be undone.");
    if (!confirmDelete) return;
    
    setIsSaving(true);
    try {
      await api.delete(endPointApi.userById(user!.id || (user as any)._id));
      toast.success("Account deleted");
      logout();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-sm font-medium text-slate-500">Customize your workspace and account preferences</p>
        </div>
        {activeTab !== "roles" && (
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : savedMsg ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {savedMsg ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
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
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl font-bold text-indigo-600 border-2 border-dashed border-indigo-200 relative transition-colors">
                    {user?.name?.split(" ").map(n => n[0]).join("") ?? "U"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{profileData.name || user?.name}</h3>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">{user?.role?.name || user?.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                    <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Role (Read Only)</label>
                    <input disabled value={user?.role?.name || user?.role || ""} className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}



            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ROLE MANAGEMENT ── */}
            {activeTab === "roles" && isAdmin && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Role Management</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Create roles, set page access. Changes reflect on Login &amp; Sidebar instantly.
                    </p>
                  </div>
                  {/* <Button onClick={() => setShowAddRole(v => !v)} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    New Role
                  </Button> */}
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
                              {(role.id === "architect" || role.id === "director") 
                                ? `${role.name} has access to all pages (locked)` 
                                : "Toggle pages to grant or revoke access"}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {ALL_PAGES.map(page => {
                                const hasAccess = role.pages.includes(page.key);
                                const locked = role.id === "architect" || role.id === "director";
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
              <button 
                onClick={handleDeleteAccount}
                disabled={isSaving}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                {isSaving ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
