import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const siteTaskService = {
  async getAllTasks() {
    return api.get(endPointApi.siteTasks);
  },
  async getTaskById(id: string) {
    return api.get(endPointApi.siteTaskById(id));
  },
  async createTask(taskData: any) {
    return api.post(endPointApi.siteTasks, taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(endPointApi.siteTaskById(id), taskData);
  },
  async deleteTask(id: string) {
    return api.delete(endPointApi.siteTaskById(id));
  },
  async uploadImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    return api.post(`${endPointApi.siteTaskById(id)}/upload`, formData);
  },
  async deleteImage(id: string, imageUrl: string) {
    return api.delete(`${endPointApi.siteTaskById(id)}/image`, { imageUrl });
  },
};
