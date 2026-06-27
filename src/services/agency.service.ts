import { api } from "./api";
import endPointApi from "@/lib/endpoints";

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
    const response = await api.post(endPointApi.agencyRegister, data);
    return response.data;
  },
  
  getPendingRegistrations: async () => {
    const response = await api.get(endPointApi.agencyPending);
    return Array.isArray(response) ? response : (response.data || []);
  },

  getRoles: async () => {
    const response = await api.get(endPointApi.agencyRoles);
    return Array.isArray(response) ? response : (response.data || []);
  },

  getRegistrationById: async (id: string) => {
    const response = await api.get(endPointApi.agencyById(id));
    return response.data || response;
  },

  approveRegistration: async (id: string) => {
    const response = await api.post(endPointApi.agencyApprove(id), {});
    return response.data;
  },

  rejectRegistration: async (id: string) => {
    const response = await api.post(endPointApi.agencyReject(id), {});
    return response.data;
  },

  sendOtp: async (email: string) => {
    const response = await api.post(endPointApi.agencySendOtp, { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post(endPointApi.agencyVerifyOtp, { email, otp });
    return response.data;
  }
};
