"use client";

import { 
  UserCircle2, 
  Building2, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Globe, 
  ChevronRight,
  Save,
  Trash2,
  Settings as SettingsIcon,
  Shield,
  Palette,
  Briefcase
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { Toggle } from "@/components/ui/Toggle";

type SettingTab = "profile" | "company" | "notifications" | "security" | "billing";

const initialNotificationSettings = {
  siteProgress: true,
  paymentReminders: true,
  workerUpdates: false,
  clientMessaging: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("notifications");
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);

  const handleNotificationChange = (key: keyof typeof initialNotificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: UserCircle2 },
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Login", icon: ShieldCheck },
    { id: "billing", label: "Subscription", icon: CreditCard },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-sm font-medium text-slate-500">Customize your workspace and account preferences</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 group">
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in slide-in-from-right-4 duration-500">
            {activeTab === "profile" && (
              <div className="space-y-10">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl font-bold text-indigo-600 border-2 border-dashed border-indigo-200 relative group cursor-pointer hover:bg-indigo-100 transition-colors">
                    SC
                    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sarah Connor</h3>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Principal Architect</p>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: "First Name", value: "Sarah" },
                    { label: "Last Name", value: "Connor" },
                    { label: "Email Address", value: "sarah@archisite.pro" },
                    { label: "Phone Number", value: "+1 (555) 902-1234" },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                      <input 
                        type="text" 
                        defaultValue={field.value}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest ml-1">Account Biography</h4>
                  <textarea 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-32 resize-none"
                    placeholder="Tell us about yourself..."
                    defaultValue="Principal Architect with 12 years of experience in residential and commercial projects. Specializing in modern, sustainable architecture."
                  />
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: "Company Name", value: "ArchiSite Pro Designs" },
                    { label: "Tax ID / VAT", value: "US-9283-1234" },
                    { label: "Office Address", value: "123 Architecture Lane, CA 90210" },
                    { label: "Company Website", value: "www.archisite.pro" },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                      <input 
                        type="text" 
                        defaultValue={field.value}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                {[
                  { id: "siteProgress", title: "Site Progress Alerts", desc: "Get notified when a construction stage is marked as complete.", icon: Briefcase },
                  { id: "paymentReminders", title: "Payment Reminders", desc: "Receive alerts for overdue and pending client payments.", icon: CreditCard },
                  { id: "workerUpdates", title: "Worker Updates", desc: "Stay informed about worker check-ins and task assignments.", icon: UserCircle2 },
                  { id: "clientMessaging", title: "Client Messaging", desc: "Real-time notifications for new client messages and feedback.", icon: Bell },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                        <item.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</p>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle 
                      checked={notificationSettings[item.id as keyof typeof notificationSettings]}
                      onChange={() => handleNotificationChange(item.id as keyof typeof notificationSettings)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-red-900 tracking-tight">Danger Zone</h3>
                <p className="text-sm font-medium text-red-700/70 leading-relaxed">Irreversibly delete your account and all associated project data.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
