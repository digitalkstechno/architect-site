"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import {
  PlayCircle,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Plus,
  Video,
  X,
  Lock,
  Users,
  Edit2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { workingSOPService } from "@/services/workingSOP.service";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

type RoleType = {
  _id: string;
  name: string;
};

type SOPVideo = {
  _id: string;
  title: string;
  videoUrl: string;
  allowedRoles: RoleType[];
};

export default function WorkingSOPPage() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [videos, setVideos] = useState<SOPVideo[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<string | null>(null);
  const [editingSOP, setEditingSOP] = useState<SOPVideo | null>(null);

  type VideoEntry = {
    title: string;
    videoUrl: string;
    file: File | null;
  };
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([{ title: "", videoUrl: "", file: null }]);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { canCreate, canEdit, canDelete, hasAll } = usePermissions("working-sop");
  const isAdmin = hasAll;

  useEffect(() => {
    fetchSOPs();
  }, []);

  const fetchSOPs = async () => {
    try {
      const data = await workingSOPService.getSOPs();
      setVideos(data);
    } catch (error) {
      console.error("Failed to fetch SOPs:", error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSOP(null);
    setVideoEntries([{ title: "", videoUrl: "", file: null }]);
    setSelectedRole("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (video: SOPVideo) => {
    setEditingSOP(video);
    setVideoEntries([{ title: video.title, videoUrl: video.videoUrl, file: null }]);
    setSelectedRole(video.allowedRoles[0]?._id || "");
    setIsAddModalOpen(true);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const invalidEntry = videoEntries.find(v => !v.videoUrl && !v.file);
    if (invalidEntry) {
      alert("Please provide a video URL or upload a file for all entries.");
      return;
    }
    if (!selectedRole) {
      alert("Please select a role.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingSOP) {
        const entry = videoEntries[0];
        const formData = new FormData();
        formData.append("title", entry.title);
        formData.append("allowedRoles", JSON.stringify([selectedRole]));

        if (entry.file) {
          formData.append("video", entry.file);
        } else {
          formData.append("videoUrl", entry.videoUrl);
        }
        await workingSOPService.updateSOP(editingSOP._id, formData);
      } else {
        const promises = videoEntries.map((entry) => {
          const formData = new FormData();
          formData.append("title", entry.title);
          formData.append("allowedRoles", JSON.stringify([selectedRole]));
          if (entry.file) {
            formData.append("video", entry.file);
          } else {
            formData.append("videoUrl", entry.videoUrl);
          }
          return workingSOPService.createSOP(formData);
        });
        await Promise.all(promises);
      }

      await fetchSOPs();
      setIsAddModalOpen(false);
      setEditingSOP(null);
      setVideoEntries([{ title: "", videoUrl: "", file: null }]);
      setSelectedRole("");
    } catch (error) {
      console.error("Failed to save SOP video:", error);
      alert("Failed to upload/update SOP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sopToDelete) return;
    try {
      await workingSOPService.deleteSOP(sopToDelete);
      await fetchSOPs();
      setIsConfirmOpen(false);
      setSopToDelete(null);
    } catch (error) {
      console.error("Error deleting SOP:", error);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-6 sm:p-12 text-white shadow-2xl shadow-indigo-200">
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
          {canCreate && (
            <Button
              onClick={handleOpenAddModal}
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
          {(isAdmin ? roles : roles.filter(r => r.name.toUpperCase() === (user?.role || "").toUpperCase())).map((role: any) => {
            const roleVideos = videos.filter(v => v.allowedRoles.some(r => r._id === role.backendId));
            const userRoleName = user?.role || "";
            const canSeeAny = isAdmin || userRoleName.toUpperCase() === role.name.toUpperCase();

            return (
              <Card key={role.id} className="p-0 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 relative overflow-hidden group/card">
                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 shadow-inner group-hover/card:scale-110 transition-transform duration-500">
                      <Users className="w-7 h-7 text-indigo-600" />
                    </div>
                    {canSeeAny ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-200">
                        <PlayCircle className="w-3.5 h-3.5" />
                        {roleVideos.length} Video{roleVideos.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-xl uppercase tracking-widest border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        Restricted
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900 group-hover/card:text-indigo-600 transition-colors uppercase tracking-tight">{role.name}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">SOP guidelines and procedures for {role.name}.</p>
                  </div>
                </div>

                {canSeeAny && roleVideos.length > 0 && (
                  <div className="bg-slate-50/80 p-6 border-t border-slate-100 space-y-3 relative z-10 h-full min-h-[150px]">
                    {roleVideos.map(v => (
                      <div key={v._id} className="flex items-center justify-between group/video cursor-pointer bg-white hover:bg-indigo-50 p-3 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300" onClick={() => window.open(v.videoUrl, '_blank')}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/video:bg-indigo-600 group-hover/video:text-white transition-colors flex-shrink-0 shadow-sm">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 group-hover/video:text-indigo-900 truncate pr-2">{v.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover/video:opacity-100 transition-opacity">
                          {(canEdit || canDelete) && (
                            <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-200" onClick={(e) => e.stopPropagation()}>
                              {canEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(v);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canEdit && canDelete && <div className="w-px h-4 bg-slate-200" />}
                              {canDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSopToDelete(v._id);
                                    setIsConfirmOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50/50 rounded-full group-hover/card:scale-150 transition-all duration-700 -z-0 blur-2xl" />
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSOP ? "Edit SOP Video" : "Upload SOP Video"}
        className="max-w-2xl"
      >
        <form onSubmit={handleAddVideo} className="space-y-8 p-2">

          <div className="space-y-6 pr-2">
            {videoEntries.map((entry, index) => (
              <div key={index} className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 relative">
                {!editingSOP && videoEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVideoEntries(entries => entries.filter((_, i) => i !== index))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Video Title {videoEntries.length > 1 ? `#${index + 1}` : ''}
                  </label>
                  <Input
                    placeholder="e.g., Column Casting SOP"
                    value={entry.title}
                    onChange={e => setVideoEntries(entries => entries.map((v, i) => i === index ? { ...v, title: e.target.value } : v))}
                    required
                    className="rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Video Upload {editingSOP && <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id={`file-upload-${index}`}
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setVideoEntries(entries => entries.map((v, i) => i === index ? { ...v, file } : v));
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                        className={cn("rounded-xl gap-2 border-dashed w-full sm:w-auto bg-white px-8", entry.file ? "border-indigo-500 text-indigo-600" : "border-slate-300")}
                      >
                        <Video className="w-4 h-4" />
                        {entry.file ? "File Selected" : "Upload Video File"}
                      </Button>
                      {entry.file && (
                        <button type="button" onClick={() => setVideoEntries(entries => entries.map((v, i) => i === index ? { ...v, file: null } : v))} className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-50">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {entry.file && (
                    <p className="text-[10px] font-bold text-indigo-600 truncate">Selected file: {entry.file.name}</p>
                  )}
                  {!entry.file && editingSOP && entry.videoUrl && (
                    <p className="text-[10px] font-bold text-slate-500 truncate mt-1">Current video is saved. Upload a new file to replace it.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!editingSOP && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setVideoEntries(entries => [...entries, { title: "", videoUrl: "", file: null }])}
              className="w-full border-dashed rounded-xl gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Plus className="w-4 h-4" />
              Add Another Video
            </Button>
          )}

          <div className="space-y-3 z-50 pt-4 border-t border-slate-100">
            <Select
              label="SELECT ROLE TO GRANT ACCESS"
              options={roles.map((role: any) => ({ value: role.backendId, label: role.name.toUpperCase() }))}
              value={selectedRole}
              onChange={val => setSelectedRole(val)}
              placeholder="-- Select a Role --"
              className="w-full"
            />
            <p className="text-[10px] font-bold text-slate-400 italic">These SOP videos will only be visible to the selected role.</p>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="px-10 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100" disabled={isLoading}>
              {isLoading ? (editingSOP ? "Updating..." : "Publishing...") : (editingSOP ? "Update SOP" : "Publish SOP")}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete SOP Video"
        message="Are you sure you want to delete this SOP video? This will remove access for the assigned role."
      />
    </div>
  );
}
