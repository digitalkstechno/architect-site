import { api } from "./api";

export interface GuestLogin {
  _id: string;
  mobile: string;
  ipAddress?: string;
  createdAt: string;
}

export const guestLoginService = {
  recordGuestLogin: async (mobile: string) => {
    try {
      const response = await api.post("/guest-logins", { mobile });
      return response;
    } catch (error) {
      console.error("Failed to record guest login", error);
    }
  },

  getGuestLogins: async (): Promise<GuestLogin[]> => {
    try {
      const response = await api.get("/guest-logins");
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Failed to fetch guest logins", error);
      return [];
    }
  },
};
