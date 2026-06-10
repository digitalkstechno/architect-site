import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const officeTaskService = {
  async getAllTasks() {
    return api.get(endPointApi.officeTasks);
  },
  async getPaginatedTasks(params: { page: number; limit: number; category?: string; assignedTo?: string; project?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.category) query.append("category", params.category);
    if (params.assignedTo) query.append("assignedTo", params.assignedTo);
    if (params.project) query.append("project", params.project);
    return api.get(`${endPointApi.officeTasks}?${query.toString()}`);
  },
  async getTaskById(id: string) {
    return api.get(endPointApi.officeTaskById(id));
  },
  async createTask(taskData: any) {
    return api.post(endPointApi.officeTasks, taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(endPointApi.officeTaskById(id), taskData);
  },
  async deleteTask(id: string) {
    return api.delete(endPointApi.officeTaskById(id));
  },
  async uploadImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    return api.post(`${endPointApi.officeTaskById(id)}/upload`, formData);
  },
  async deleteImage(id: string, imageUrl: string) {
    return api.delete(`${endPointApi.officeTaskById(id)}/image`, { imageUrl });
  },
};
