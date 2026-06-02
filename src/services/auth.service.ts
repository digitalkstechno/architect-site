import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const authService = {
  async login(credentials: any) {
    return api.post(endPointApi.login, credentials);
  },

  async register(userData: any) {
    return api.post(endPointApi.register, userData);
  },

  async getMe() {
    return api.get(endPointApi.getMe);
  },
};
