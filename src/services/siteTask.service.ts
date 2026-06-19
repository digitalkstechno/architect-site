import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const siteTaskService = {
  async getAllTasks() {
    return api.get(endPointApi.siteTasks);
  },
  async getPaginatedTasks(params: { page: number; limit: number; category?: string; assignedTo?: string; project?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.category) query.append("category", params.category);
    if (params.assignedTo) query.append("assignedTo", params.assignedTo);
    if (params.project) query.append("project", params.project);
    if (params.search) query.append("search", params.search);
    return api.get(`${endPointApi.siteTasks}?${query.toString()}`);
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
