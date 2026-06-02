import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const sitePhotoService = {
  async getPhotosByProject(projectId: string) {
    return api.get(`${endPointApi.sitePhotos}?project=${projectId}`);
  },

  async uploadPhotos(projectId: string, files: File[], caption?: string) {
    const formData = new FormData();
    formData.append("project", projectId);
    if (caption) formData.append("caption", caption);
    files.forEach(file => formData.append("photos", file));
    return api.upload(endPointApi.sitePhotos, formData);
  },

  async deletePhoto(id: string) {
    return api.delete(endPointApi.sitePhotoById(id));
  },
};
