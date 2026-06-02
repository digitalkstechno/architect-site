import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const siteUpdateService = {
  async getAllUpdates() {
    return api.get(endPointApi.siteUpdates);
  },
  async getUpdatesByProject(projectId: string) {
    return api.get(`${endPointApi.siteUpdates}?projectId=${projectId}`);
  },
  async createUpdate(updateData: any) {
    return api.post(endPointApi.siteUpdates, updateData);
  },
  async deleteUpdate(id: string) {
    return api.delete(endPointApi.siteUpdateById(id));
  },
  async uploadPhotos(projectId: string, files: File[]) {
    const formData = new FormData();
    formData.append("project", projectId);
    files.forEach(file => {
      formData.append("images", file);
    });
    return api.post(`${endPointApi.siteUpdates}/upload`, formData);
  },
};
