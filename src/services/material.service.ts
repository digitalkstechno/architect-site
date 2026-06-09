import { api } from "./api";

export interface MaterialRequest {
  _id: string;
  project: any;
  requestedBy: any;
  materialName: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export const materialService = {
  async getRequestsByProject(projectId: string): Promise<MaterialRequest[]> {
    return api.get(`/material-requests?project=${projectId}`);
  },
  async createRequest(data: any): Promise<MaterialRequest> {
    return api.post("/material-requests", data);
  },
  async updateRequest(id: string, data: any): Promise<MaterialRequest> {
    return api.put(`/material-requests/${id}`, data);
  },
  async deleteRequest(id: string): Promise<any> {
    return api.delete(`/material-requests/${id}`);
  }
};
