"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Calendar, Plus, Construction, TrendingUp, Camera, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api-config";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { useProjects } from "@/lib/projects-store";
import { toast } from "react-toastify";

const stageOptions = ["Layout", "Excavation", "Foundation", "Structure", "Brick Work", "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover"];

export default function SiteUpdatesPage() {
  const { user } = useAuth();
  const { updates, isLoading, createUpdate, deleteUpdate } = useSiteUpdates();
  const { projects } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    projectId: "", 
    update: "", 
    stage: stageOptions[0], 
    progress: "",
    images: [] as File[]
  });

  useEffect(() => {
    if (projects.length > 0 && !form.projectId) {
      setForm(f => ({ ...f, projectId: projects[0].id }));
    }
  }, [projects]);

  const canAdd = user?.role === "supervisor" || user?.role === "architect";

  const visibleUpdates = user?.role === "client"
    ? updates.filter(u => u.projectId === user.projectId)
    : updates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.update.trim() || !form.projectId) return;
    
    setIsSubmitting(true);
    try {
      const selectedProject = projects.find(p => p.id === form.projectId);
      await createUpdate({
        projectId: form.projectId,
        project: selectedProject?.name || "Unknown",
        update: form.update,
        stage: form.stage,
        progress: Number(form.progress) || 0,
        images: form.images
      });
      
      setForm({ 
        projectId: projects[0]?.id || "", 
        update: "", 
        stage: stageOptions[0], 
        progress: "",
        images: []
      });
      setShowForm(false);
      toast.success("Site update posted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error posting update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;
    try {
      await deleteUpdate(id);
      toast.success("Update deleted");
    } catch (err: any) {
      toast.error(err.message || "Error deleting update");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm(f => ({ ...f, images: [...f.images, ...Array.from(e.target.files!)] }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Site Updates</h2>
          <p className="text-sm font-medium text-slate-500">Chronological log of construction progress</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowForm(true)} className="gap-2 self-start">
            <Plus className="w-5 h-5" />
            Add Site Update
          </Button>
        )}
      </div>

      {/* Add Update Form */}
      {showForm && (
        <Card className="p-8 border-2 border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">New Site Update</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Project</label>
                <select
                  value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Stage</label>
                <select
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {stageOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Update Description</label>
              <textarea
                value={form.update}
                onChange={e => setForm(f => ({ ...f, update: e.target.value }))}
                placeholder="Describe today's site progress..."
                rows={3}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Overall Progress (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                  placeholder="e.g., 55"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Add Photos</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <span className="text-xs font-bold text-slate-400">{form.images.length} Selected</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post Update
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Updates Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-10">
        {visibleUpdates.length === 0 && (
          <p className="text-center text-slate-400 font-medium py-10">No updates yet.</p>
        )}
        {visibleUpdates.map((update, idx) => (
          <div key={update.id} className="flex gap-8 group">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
                <Construction className="w-6 h-6 text-indigo-600 group-hover:text-white transition-all duration-500" />
              </div>
              {idx !== visibleUpdates.length - 1 && <div className="w-px flex-1 bg-slate-100 my-4" />}
            </div>
            <div className="pb-10 border-b border-slate-50 last:border-0 last:pb-0 flex-1 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{update.project}</h3>
                  {update.stage && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {update.stage}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {update.date}
                  </div>
                  {canAdd && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(update.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">{update.update}</p>
              
              {/* Image Preview if available */}
              {update.images && update.images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {update.images.map((img, i) => (
                    <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={`${API_BASE_URL}${img}`} alt="Site" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-1">
                <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" />
                  {update.progress}% Complete
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Camera className="w-4 h-4" />
                  {update.photos} Photos
                </span>
                {update.addedBy && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    By {update.addedBy}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
