import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const taskService = {
  async getAllTasks() {
    return api.get(endPointApi.tasks);
  },
  async getTasksByProject(projectId: string) {
    return api.get(endPointApi.tasksByProject(projectId));
  },
  async getTaskById(id: string) {
    return api.get(endPointApi.taskById(id));
  },
  async createTask(taskData: any) {
    return api.post(endPointApi.tasks, taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(endPointApi.taskById(id), taskData);
  },
  async deleteTask(id: string) {
    return api.delete(endPointApi.taskById(id));
  },
};
