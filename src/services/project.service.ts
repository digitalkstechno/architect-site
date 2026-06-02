import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface Project {
  _id: string;
  name: string;
  client: any;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: string;
  progress: number;
  budget: string;
  received: string;
  pending: string;
  supervisor?: any;
  workers?: any[];
  stages: any[];
  flow?: any;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    return api.get(endPointApi.projects);
  },

  async getProjectById(id: string): Promise<Project> {
    return api.get(endPointApi.projectById(id));
  },

  async createProject(projectData: any): Promise<Project> {
    return api.post(endPointApi.projects, projectData);
  },

  async updateProject(id: string, projectData: any): Promise<Project> {
    return api.put(endPointApi.projectById(id), projectData);
  },

  async deleteProject(id: string): Promise<any> {
    return api.delete(endPointApi.projectById(id));
  },

  async updateStage(id: string, stageData: { stageName: string; status: string }): Promise<Project> {
    return api.post(endPointApi.updateProjectStage(id), stageData); // Backend uses updateStage controller
  },
};
