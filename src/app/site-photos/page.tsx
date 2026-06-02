"use client";

import { Camera, Plus, Upload, X, Image as ImageIcon, Video, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { sitePhotoService } from "@/services/sitePhoto.service";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

type Photo = {
  id: string;
  src: string;
  caption?: string;
  date: string;
  uploadedBy?: string;
};

export default function SitePhotosPage({ searchParams }: { searchParams: any }) {
  const resolvedSearchParams = searchParams instanceof Promise ? use(searchParams) : searchParams;
  const initialProjectId = resolvedSearchParams?.projectId;

  const { user } = useAuth();
  const { projects, isHydrated: projectsHydrated } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = user?.role !== "client";

  const filteredProjects = user?.role === "client"
    ? projects.filter(p => p.id === user.projectId)
    : projects;

  // Set default project
  useEffect(() => {
    if (projectsHydrated && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(user?.role === "client" && user.projectId ? user.projectId : projects[0].id);
    }
  }, [projectsHydrated, projects, user, selectedProjectId]);

  // Fetch photos when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    sitePhotoService.getPhotosByProject(selectedProjectId)
      .then((data: any) => {
        const mapped = (data || []).map((p: any) => ({
          id: p._id || p.id,
          src: p.fileUrl,
          caption: p.caption,
          date: new Date(p.createdAt || p.date).toLocaleDateString(),
          uploadedBy: p.uploadedBy?.name || "System",
        }));
        setPhotos(mapped);
      })
      .catch(err => console.error("Failed to fetch photos", err))
      .finally(() => setIsLoading(false));
  }, [selectedProjectId]);

  const refreshPhotos = async () => {
    if (!selectedProjectId) return;
    const data: any = await sitePhotoService.getPhotosByProject(selectedProjectId);
    setPhotos((data || []).map((p: any) => ({
      id: p._id || p.id,
      src: p.fileUrl,
      caption: p.caption,
      date: new Date(p.createdAt || p.date).toLocaleDateString(),
      uploadedBy: p.uploadedBy?.name || "System",
    })));
  };

  // Camera
  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setPreviewPhoto(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setPreviewPhoto(canvas.toDataURL("image/jpeg"));
  };

  const saveCapture = async () => {
    if (!previewPhoto) return;
    setIsUploading(true);
    try {
      const blob = await (await fetch(previewPhoto)).blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      await sitePhotoService.uploadPhotos(selectedProjectId, [file]);
      toast.success("Photo captured and saved!");
      await refreshPhotos();
      stopCamera();
      setShowUploadModal(false);
    } catch (err) {
      console.error("Failed to upload captured photo:", err);
      toast.error("Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      await sitePhotoService.uploadPhotos(selectedProjectId, files);
      toast.success(`${files.length} photos uploaded!`);
      await refreshPhotos();
      setShowUploadModal(false);
    } catch (err) {
      console.error("Failed to upload photos:", err);
      toast.error("Failed to upload photos.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;
    try {
      await sitePhotoService.deletePhoto(photoToDelete);
      toast.success("Photo deleted");
      setPhotos(prev => prev.filter(p => p.id !== photoToDelete));
      setIsConfirmOpen(false);
      setPhotoToDelete(null);
    } catch (err) {
      console.error("Failed to delete photo:", err);
      toast.error("Failed to delete photo");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-row items-center justify-between gap-6">
        <div className="space-y-0.5">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Site Documentation</h2>
          <p className="text-xs font-medium text-slate-500 hidden sm:block">Visual progress tracking and site photos</p>
        </div>
        {canUpload && (
          <Button size="sm" onClick={() => setShowUploadModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Photos</span>
          </Button>
        )}
      </div>

      {/* Project Selector */}
      <div className="flex gap-2 items-center flex-wrap">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Select Project:</label>
        <Select
          options={filteredProjects.map(p => ({ value: p.id, label: p.name }))}
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          className="w-64"
          searchable={true}
        />
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Upload Card */}
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group bg-white shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Add Photo</span>
            </button>
          )}

          {photos.map(photo => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm max-w-[180px]">
              <img
                src={photo.src}
                alt="Site progress"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-white/90 uppercase tracking-wider font-mono">{photo.date}</span>
                    {canUpload && (
                      <button 
                        onClick={() => {
                          setPhotoToDelete(photo.id);
                          setIsConfirmOpen(true);
                        }}
                        className="p-1 bg-red-500/20 hover:bg-red-500 text-white rounded transition-colors backdrop-blur-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-indigo-300 uppercase tracking-widest">{photo.uploadedBy}</span>
                    {photo.caption && <span className="text-[8px] text-white/70 truncate">{photo.caption}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {photos.length === 0 && !canUpload && [1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-slate-300" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Photos</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Photo"
        message="Are you sure you want to delete this site photo? This action cannot be undone."
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Upload Site Photo</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowUploadModal(false); stopCamera(); }}>
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>

              <div className="mb-6">
                <Select
                  label="Project"
                  options={filteredProjects.map(p => ({ value: p.id, label: p.name }))}
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                />
              </div>

              {!cameraActive ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startCamera}
                    disabled={isUploading}
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 transition-all group disabled:opacity-50"
                  >
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-900">Live Camera</p>
                      <p className="text-xs text-slate-500 mt-1">Take photo now</p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-all group disabled:opacity-50"
                  >
                    <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <ImageIcon className="w-8 h-8 text-white" />}
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-900">{isUploading ? "Uploading..." : "Gallery"}</p>
                      <p className="text-xs text-slate-500 mt-1">Choose from device</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium text-center">{cameraError}</div>
                  ) : previewPhoto ? (
                    <div className="space-y-4">
                      <img src={previewPhoto} alt="Preview" className="w-full rounded-2xl border border-slate-200" />
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setPreviewPhoto(null)}>Retake</Button>
                        <Button className="flex-1" onClick={saveCapture} disabled={isUploading}>
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Photo"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <video ref={videoRef} className="w-full rounded-2xl border border-slate-200 bg-black" autoPlay playsInline muted />
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={stopCamera}>Cancel</Button>
                        <Button className="flex-1 gap-2" onClick={capturePhoto}>
                          <Camera className="w-5 h-5" /> Capture
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
    </div>
  );
}
