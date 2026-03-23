"use client";

import { Camera, Plus, MapPin, Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { useProjects } from "@/lib/projects-store";
import { toast } from "react-toastify";

export default function SitePhotosPage() {
  const { user } = useAuth();
  const { updates, isLoading, createUpdate } = useSiteUpdates();
  const { projects } = useProjects();
  
  const [selectedProject, setSelectedProject] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      const roleName = typeof user?.role === "object" ? (user.role as any).roleName : (user?.role || "");
      const isClient = roleName.toLowerCase().includes("client");
      const initial = isClient
        ? (projects.find(p => p.clientId === user?.id)?.id || projects[0].id)
        : projects[0].id;
      setSelectedProject(initial);
    }
  }, [projects, user, selectedProject]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleName = typeof user?.role === "object" ? (user.role as any).roleName : (user?.role || "");
  const isClient = roleName.toLowerCase().includes("client");
  const canUpload = !isClient;

  const filteredProjects = isClient
    ? projects.filter(p => p.id === user?.projectId || p.clientId === user?.id)
    : projects;

  const projectUpdates = updates.filter(u => u.projectId === selectedProject);
  const projectPhotos = projectUpdates.flatMap(u => 
    (u.images || []).map(img => ({
      id: u.id,
      src: img.startsWith('http') ? img : `http://localhost:9000${img}`,
      date: u.date,
      description: u.update
    }))
  );

  // Start live camera
  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
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
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreviewPhoto(dataUrl);
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const saveCapture = async () => {
    if (!previewPhoto) return;
    setIsSubmitting(true);
    try {
      const file = dataURLtoFile(previewPhoto, `site-photo-${Date.now()}.jpg`);
      const selectedProjObj = projects.find(p => p.id === selectedProject);
      
      await createUpdate({
        projectId: selectedProject,
        project: selectedProjObj?.name || "Unknown",
        update: "Photo update from site",
        images: [file]
      });
      
      toast.success("Photo uploaded successfully!");
      stopCamera();
      setShowUploadModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error uploading photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gallery upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const selectedProjObj = projects.find(p => p.id === selectedProject);
      await createUpdate({
        projectId: selectedProject,
        project: selectedProjObj?.name || "Unknown",
        update: "Gallery photos uploaded",
        images: files
      });
      toast.success(`${files.length} photos uploaded!`);
      setShowUploadModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error uploading photos");
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      <div className="flex flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Site Documentation</h2>
          <p className="text-sm font-medium text-slate-500 hidden sm:block">Visual progress tracking and site photos</p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Upload Photos</span>
          </Button>
        )}
      </div>

      {/* Project Selector */}
      <div className="flex gap-3 flex-wrap">
        {filteredProjects.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProject(p.id)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all",
              selectedProject === p.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projectPhotos.map(photo => (
          <div key={photo.id} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm group relative">
            <img src={photo.src} alt="Site photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-[10px] font-bold uppercase tracking-widest">{photo.date}</p>

            </div>
          </div>
        ))}

        {/* Empty placeholders */}
        {projectPhotos.length === 0 && [1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <Camera className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Photos</p>
          </div>
        ))}

        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="aspect-square bg-indigo-50 rounded-[2rem] border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-3 hover:bg-indigo-100 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Add Photo</p>
          </button>
        )}
      </div>

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

              {/* Project select */}
              <div className="mb-6 space-y-2">
                <label className="text-sm font-bold text-slate-700">Project</label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {!cameraActive ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Live Camera */}
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 transition-all group"
                  >
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-900">Live Camera</p>
                      <p className="text-xs text-slate-500 mt-1">Take photo now</p>
                    </div>
                  </button>

                  {/* Gallery Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-900">Gallery</p>
                      <p className="text-xs text-slate-500 mt-1">Choose from device</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium text-center">
                      {cameraError}
                    </div>
                  ) : previewPhoto ? (
                    <div className="space-y-4">
                      <img src={previewPhoto} alt="Preview" className="w-full rounded-2xl border border-slate-200" />
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setPreviewPhoto(null)}>Retake</Button>
                        <Button className="flex-1" onClick={saveCapture}>Save Photo</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <video ref={videoRef} className="w-full rounded-2xl border border-slate-200 bg-black" autoPlay playsInline muted />
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={stopCamera}>Cancel</Button>
                        <Button className="flex-1 gap-2" onClick={capturePhoto}>
                          <Camera className="w-5 h-5" />
                          Capture
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryUpload}
      />
    </div>
  );
}
