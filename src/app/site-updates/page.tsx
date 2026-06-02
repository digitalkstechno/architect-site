"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Calendar, Plus, Construction, TrendingUp, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { useProjects } from "@/lib/projects-store";
import toast from "react-hot-toast";

const stageOptions = ["Layout", "Excavation", "Foundation", "Structure", "Brick Work", "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover"];

export default function SiteUpdatesPage() {
  const { user } = useAuth();
  const { updates, createUpdate, isHydrated } = useSiteUpdates();
  const { projects } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project: "", update: "", stage: stageOptions[0], progress: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !form.project) {
      setForm(f => ({ ...f, project: projects[0].id }));
    }
  }, [projects]);

  const canAdd = user?.role === "supervisor" || user?.role === "architect" || user?.role === "director" || user?.role === "site-engineer";

  const visibleUpdates = user?.role === "client"
    ? updates.filter(u => u.projectId === user.projectId || (u.project as any)?._id === user.projectId)
    : updates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.update.trim()) return;
    if (!form.project) {
      toast.error("Please select a project");
      return;
    }

    setIsLoading(true);
    try {
      await createUpdate({
        projectId: form.project,
        project: projects.find(p => p.id === form.project)?.name || form.project,
        update: form.update,
        progress: Number(form.progress) || 0,
        stage: form.stage,
        addedBy: user?.name,
      });
      toast.success("Site update posted successfully!");
      setForm(f => ({ ...f, update: "", progress: "" }));
      setShowForm(false);
    } catch (error) {
      console.error("Error posting site update:", error);
      toast.error("Failed to post site update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Site Updates</h1>
          <p className="text-xs text-slate-500 font-medium">Daily construction progress logs</p>
        </div>
        {canAdd && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-2 shadow-md shadow-indigo-100 font-bold text-xs">
            <Plus className="w-4 h-4" /> Add Site Update
          </Button>
        )}
      </div>

      {/* Add Update Form */}
      {showForm && (
        <Card className="p-4 border-2 border-indigo-100 bg-indigo-50/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">New Site Update</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-8 w-8">
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Project</label>
                <select
                  value={form.project}
                  onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Current Stage</label>
                <select
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {stageOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Update Description</label>
              <textarea
                value={form.update}
                onChange={e => setForm(f => ({ ...f, update: e.target.value }))}
                placeholder="Describe today's site progress..."
                rows={2}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Overall Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                placeholder="e.g., 55"
                className="w-32 h-9 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowForm(false)} className="text-xs">Cancel</Button>
              <Button size="sm" type="submit" disabled={isLoading} className="text-xs">
                {isLoading ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative space-y-4">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100" />

        {visibleUpdates.length === 0 && (
          <p className="text-center text-slate-400 text-xs font-medium py-10">No updates yet.</p>
        )}

        {visibleUpdates.map((update, idx) => (
          <div key={update.id} className="relative pl-12 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-indigo-500 shadow-sm z-10" />
            
            <Card className="p-3 hover:shadow-md transition-all border-slate-100 group-hover:border-indigo-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                    <Construction className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{(update.project as any)?.name || update.project}</h3>
                      {update.stage && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {update.stage}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">{update.update}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {update.progress}% Complete
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Camera className="w-3.5 h-3.5" />
                        {update.photos || 0} Photos
                      </div>
                      {update.addedBy && (
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                          By {update.addedBy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100 self-start sm:self-center">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(update.date || (update as any).createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
