import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface Document {
  _id: string;
  title: string;
  project: any;
  uploadedBy: any;
  documentType: string;
  fileUrl: string;
  version: string;
  notes?: string;
  createdAt: string;
}

export const documentService = {
  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return api.get(`${endPointApi.documents}?project=${projectId}`);
  },
  async createDocument(formData: FormData): Promise<Document> {
    return api.upload(endPointApi.documents, formData);
  },
  async deleteDocument(id: string): Promise<any> {
    return api.delete(endPointApi.documentById(id));
  }
};
