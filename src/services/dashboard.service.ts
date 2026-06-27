import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    office: { total: number; pending: number };
    site: { total: number; pending: number };
  };
  finances: {
    totalBudget: number;
    totalReceived: number;
    totalPending: number;
    isHidden?: boolean;
  };
  recentActivity: {
    messages: any[];
    siteUpdates: any[];
    upcomingOfficeTasks: any[];
    upcomingSiteTasks: any[];
    pendingAgencies?: any[];
  };
}

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return api.get(endPointApi.dashboard);
  },
};
