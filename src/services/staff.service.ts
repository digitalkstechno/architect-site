import { api } from "./api";
import { Role } from "./role.service";
import endPointApi from "@/lib/endpoints";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  team: string;
  isActive: boolean;
  experience?: number;
}

export const staffService = {
  async getAllStaff(params?: any): Promise<StaffMember[]> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get(`${endPointApi.users}${query}`);
  },

  async getStaffById(id: string): Promise<StaffMember> {
    return api.get(endPointApi.userById(id));
  },

  async updateStaff(id: string, staffData: any): Promise<StaffMember> {
    return api.put(endPointApi.userById(id), staffData);
  },

  async deleteStaff(id: string): Promise<any> {
    return api.delete(endPointApi.userById(id));
  },

  async createStaff(staffData: any): Promise<StaffMember> {
    // Staff creation is usually through registration or a specific admin endpoint
    // Here we use the auth register endpoint for adding staff
    return api.post(endPointApi.register, staffData);
  },
};
