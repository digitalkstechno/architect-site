"use client";

import { useState } from "react";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { officeTaskService } from "@/services/officeTask.service";
import { siteTaskService } from "@/services/siteTask.service";

interface TaskImageUploadProps {
  taskId: string;
  type: "Office" | "Site";
  onUploadComplete: () => void;
  existingImages?: string[];
  canDelete?: boolean;
}

export function TaskImageUpload({ taskId, type, onUploadComplete, existingImages = [], canDelete = false }: TaskImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      setPreviews(prev => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExisting = async (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deletingUrl) return;
    setDeletingUrl(imageUrl);
    try {
      if (type === "Office") {
        await officeTaskService.deleteImage(taskId, imageUrl);
      } else {
        await siteTaskService.deleteImage(taskId, imageUrl);
      }
      onUploadComplete();
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      if (type === "Office") {
        await officeTaskService.uploadImages(taskId, selectedFiles);
      } else {
        await siteTaskService.uploadImages(taskId, selectedFiles);
      }
      setSelectedFiles([]);
      setPreviews([]);
      onUploadComplete();
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {existingImages.map((url, i) => (
          <div key={i} className="relative w-16 h-16 flex-shrink-0 group">
            {/* Image - click opens new tab */}
            <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              <img
                src={url}
                alt={`Task ${i}`}
                className="w-16 h-16 rounded-lg object-cover border border-slate-200"
              />
            </a>

            {/* Delete button - only visible on hover, top-right corner */}
            {canDelete && (
              <button
                type="button"
                onClick={(e) => handleDeleteExisting(e, url)}
                disabled={deletingUrl === url}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full items-center justify-center shadow-md z-20 transition-colors hidden group-hover:flex"
              >
                {deletingUrl === url ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        ))}

        {previews.map((url, i) => (
          <div key={i} className="relative w-16 h-16 flex-shrink-0">
            <img src={url} alt={`Preview ${i}`} className="w-16 h-16 rounded-lg object-cover border border-indigo-200 opacity-60" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md z-20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all flex-shrink-0">
          <Camera className="w-5 h-5 text-slate-400" />
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full h-9 rounded-xl text-xs gap-2"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Files`}
        </Button>
      )}
    </div>
  );
}
