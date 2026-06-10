import { api } from "./api";

export interface AgencyRegistration {
  _id: string;
  agencyName: string;
  mobile: string;
  email: string;
  businessType: { _id: string; name: string } | string;
  officeAddress?: string;
  profilePhoto?: string;
  experience?: number;
  servicesOffered?: string[];
  workingCities?: string[];
  aboutUs?: string;
  projectPhotos?: string[];
  completedProjectsCount?: number;
  instagramLink?: string;
  clientReviews?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export const agencyService = {
  submitRegistration: async (data: any) => {
    const response = await api.post("/agencies/register", data);
    return response.data;
  },
  
  getPendingRegistrations: async () => {
    const response = await api.get("/agencies/pending");
    return Array.isArray(response) ? response : (response.data || []);
  },

  getRoles: async () => {
    const response = await api.get("/agencies/roles");
    return Array.isArray(response) ? response : (response.data || []);
  },

  getRegistrationById: async (id: string) => {
    const response = await api.get(`/agencies/${id}`);
    return response.data || response;
  },

  approveRegistration: async (id: string) => {
    const response = await api.post(`/agencies/${id}/approve`, {});
    return response.data;
  },

  rejectRegistration: async (id: string) => {
    const response = await api.post(`/agencies/${id}/reject`, {});
    return response.data;
  },

  sendOtp: async (email: string) => {
    const response = await api.post("/agencies/send-otp", { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post("/agencies/verify-otp", { email, otp });
    return response.data;
  }
};
