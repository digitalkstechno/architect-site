import { api } from "./api";
import endPointApi from "@/lib/endpoints";

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
    return api.get(`${endPointApi.materialRequests}?project=${projectId}`);
  },
  async createRequest(data: any): Promise<MaterialRequest> {
    return api.post(endPointApi.materialRequests, data);
  },
  async updateRequest(id: string, data: any): Promise<MaterialRequest> {
    return api.put(endPointApi.materialRequestById(id), data);
  },
  async deleteRequest(id: string): Promise<any> {
    return api.delete(endPointApi.materialRequestById(id));
  }
};
