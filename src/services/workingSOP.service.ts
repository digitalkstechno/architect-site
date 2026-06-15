import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const workingSOPService = {
  getSOPs: async () => {
    const response = await api.get(endPointApi.workingSOPs);
    return response;
  },

  createSOP: async (formData: FormData) => {
    // using FormData to support file uploads
    const response = await api.post(endPointApi.workingSOPs, formData);
    return response;
  },

  updateSOP: async (id: string, formData: FormData) => {
    const response = await api.put(endPointApi.workingSOPById(id), formData);
    return response;
  },

  deleteSOP: async (id: string) => {
    const response = await api.delete(endPointApi.workingSOPById(id));
    return response;
  },
};
