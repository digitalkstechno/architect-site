import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const attendanceService = {
  async getAllAttendance(params?: any) {
    const query = new URLSearchParams(params).toString();
    return api.get(`${endPointApi.attendance}?${query}`);
  },
  async checkIn() {
    return api.post(`${endPointApi.attendance}/check-in`, {});
  },
  async checkOut() {
    return api.post(`${endPointApi.attendance}/check-out`, {});
  },
  async getMyStatus() {
    return api.get(`${endPointApi.attendance}/my-status`);
  },
  async updateAttendance(id: string, data: any) {
    return api.put(endPointApi.attendanceById(id), data);
  },
};
