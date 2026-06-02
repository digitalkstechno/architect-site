"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { 
  PlayCircle, 
  CheckCircle2, 
  ClipboardList, 
  HardHat, 
  PenTool, 
  Hammer, 
  Droplets, 
  Zap, 
  ShieldCheck,
  Plus,
  Video,
  X,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type SOPVideo = {
  id: string;
  title: string;
  videoUrl: string;
  allowedRoles: string[];
  stage: string;
};

const INITIAL_VIDEOS: SOPVideo[] = [
  { id: "1", title: "Plumbing Installation SOP", videoUrl: "#", allowedRoles: ["director", "architect", "supervisor"], stage: "Plumbing Agency" },
  { id: "2", title: "Electrical Safety SOP", videoUrl: "#", allowedRoles: ["director", "architect", "site-engineer"], stage: "Electrical Agency" },
];

export default function WorkingSOPPage() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [videos, setVideos] = useState<SOPVideo[]>(INITIAL_VIDEOS);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    videoUrl: "",
    allowedRoles: [] as string[],
    stage: "Plumbing Agency"
  });

  const isAdmin = user?.role === "director" || user?.role === "architect";

  const sopStages = [
    { title: "Plumbing Agency", icon: Droplets, desc: "Water line layout, drainage mapping, and fixture installation standards.", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Electrical Agency", icon: Zap, desc: "Conduit placement, wiring safety protocols, and point distribution.", color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Structure Agency", icon: Hammer, desc: "Column casting, beam reinforcement, and slab curing guidelines.", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Interior Agency", icon: PenTool, desc: "Furniture framing, false ceiling heights, and finishing quality checks.", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Painting Agency", icon: Droplets, desc: "Wall preparation, putty application, and final coat finishing.", color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Safety & QA", icon: ShieldCheck, desc: "Site safety equipment, material quality audits, and safety checks.", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const video: SOPVideo = {
      id: Date.now().toString(),
      ...newVideo
    };
    setVideos(prev => [...prev, video]);
    setIsAddModalOpen(false);
    setNewVideo({ title: "", videoUrl: "", allowedRoles: [], stage: "Plumbing Agency" });
  };

  const toggleRole = (roleId: string) => {
    setNewVideo(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(roleId)
        ? prev.allowedRoles.filter(id => id !== roleId)
        : [...prev.allowedRoles, roleId]
    }));
  };

  const handleDelete = async () => {
    if (!sopToDelete) return;
    try {
      // For local state management
      setVideos(prev => prev.filter(v => v.id !== sopToDelete));
      setIsConfirmOpen(false);
      setSopToDelete(null);
    } catch (error) {
      console.error("Error deleting SOP:", error);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-8 sm:p-12 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-white/10">
              <ClipboardList className="w-3.5 h-3.5" /> Operations Manual
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 uppercase">Working SOP</h1>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
              Standard Operating Procedures to maintain excellence across all project phases.
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl h-12 px-6 font-black uppercase tracking-widest gap-2 bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl relative z-10 border-0"
            >
              <Plus className="w-4 h-4" />
              Upload SOP
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-10 bg-slate-900 text-white border-slate-800 space-y-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <HardHat className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight leading-tight">Master Workflow Guidelines</h3>
            <p className="text-slate-400 font-medium leading-relaxed">Our SOPs ensure consistent quality across all sites.</p>
          </div>
          <div className="space-y-4 pt-6 border-t border-white/10">
            {["Site Preparation Checklist", "Material Receiving SOP", "Daily Log Submission", "Quality Audit Reports"].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sopStages.map((sop) => {
            const stageVideos = videos.filter(v => v.stage === sop.title);
            const canSeeAny = stageVideos.some(v => v.allowedRoles.includes(user?.role || ""));

            return (
              <Card key={sop.title} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all duration-500 cursor-pointer relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-12 h-12 ${sop.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <sop.icon className={`w-6 h-6 ${sop.color}`} />
                  </div>
                  {canSeeAny ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-600 text-[9px] font-black text-white rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                      <PlayCircle className="w-3 h-3" />
                      {stageVideos.length} Video{stageVideos.length > 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-[9px] font-black text-slate-400 rounded-lg uppercase tracking-widest border border-slate-100">
                      <Lock className="w-3 h-3" />
                      Restricted
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-2 relative z-10">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{sop.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{sop.desc}</p>
                </div>
                
                {canSeeAny && (
                  <div className="mt-5 pt-5 border-t border-slate-50 space-y-2.5 relative z-10">
                    {stageVideos.map(v => (
                      v.allowedRoles.includes(user?.role || "") && (
                        <div key={v.id} className="flex items-center justify-between group/video">
                          <span className="text-[10px] font-bold text-slate-600 group-hover/video:text-indigo-600 truncate mr-4">{v.title}</span>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSopToDelete(v.id);
                                  setIsConfirmOpen(true);
                                }}
                                className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                            <PlayCircle className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
                
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-50/50 rounded-full group-hover:scale-150 transition-all duration-700 -z-0" />
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload SOP Video"
        className="max-w-2xl"
      >
        <form onSubmit={handleAddVideo} className="space-y-8 p-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Video Title</label>
              <Input 
                placeholder="e.g., Column Casting SOP" 
                value={newVideo.title}
                onChange={e => setNewVideo(v => ({ ...v, title: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">SOP Agency/Stage</label>
              <select 
                className="w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                value={newVideo.stage}
                onChange={e => setNewVideo(v => ({ ...v, stage: e.target.value }))}
                required
              >
                {sopStages.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Video Upload / URL</label>
            <div className="flex gap-4">
              <Input 
                placeholder="Paste video link (YouTube/Vimeo) or use upload" 
                value={newVideo.videoUrl}
                onChange={e => setNewVideo(v => ({ ...v, videoUrl: e.target.value }))}
                className="rounded-xl flex-1"
              />
              <Button type="button" variant="outline" className="rounded-xl gap-2 border-dashed border-slate-300">
                <Video className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest block">Select Roles to Grant Access</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    newVideo.allowedRoles.includes(role.id)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    newVideo.allowedRoles.includes(role.id) ? "bg-white" : "bg-slate-300"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{role.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic">Only users with selected roles will be able to view this SOP video.</p>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-10 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
              Publish SOP
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete SOP Video"
        message="Are you sure you want to delete this SOP video? This will remove access for all assigned roles."
      />
    </div>
  );
}
