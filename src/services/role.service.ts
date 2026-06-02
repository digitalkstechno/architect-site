import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    return api.get(endPointApi.roles);
  },

  async getRoleById(id: string): Promise<Role> {
    return api.get(endPointApi.roleById(id));
  },

  async createRole(roleData: Partial<Role>): Promise<Role> {
    return api.post(endPointApi.roles, roleData);
  },

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    return api.put(endPointApi.roleById(id), roleData);
  },

  async deleteRole(id: string): Promise<any> {
    return api.delete(endPointApi.roleById(id));
  },
};
