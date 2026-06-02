/**
 * Centralized API endpoints for the Architect site
 */
export interface EndPointApi {
  // Auth
  login: string;
  register: string;
  getMe: string;

  // Projects
  projects: string;
  projectById: (id: string) => string;
  updateProjectStage: (id: string) => string;

  // Office Tasks
  officeTasks: string;
  officeTaskById: (id: string) => string;

  // Site Tasks
  siteTasks: string;
  siteTaskById: (id: string) => string;

  // Site Updates
  siteUpdates: string;
  siteUpdateById: (id: string) => string;

  // Roles
  roles: string;
  roleById: (id: string) => string;

  // Attendance
  attendance: string;
  attendanceById: (id: string) => string;

  // Clients
  clients: string;
  clientById: (id: string) => string;

  // Payments
  payments: string;
  paymentById: (id: string) => string;

  // Users / Staff
  users: string;
  userById: (id: string) => string;

  // Tasks (General/Legacy)
  tasks: string;
  taskById: (id: string) => string;
  tasksByProject: (projectId: string) => string;

  // Site Photos
  sitePhotos: string;
  sitePhotoById: (id: string) => string;
}

const endPointApi: EndPointApi = {
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  getMe: "/auth/me",

  // Projects
  projects: "/projects",
  projectById: (id: string) => `/projects/${id}`,
  updateProjectStage: (id: string) => `/projects/${id}/stage`,

  // Office Tasks
  officeTasks: "/office-tasks",
  officeTaskById: (id: string) => `/office-tasks/${id}`,

  // Site Tasks
  siteTasks: "/site-tasks",
  siteTaskById: (id: string) => `/site-tasks/${id}`,

  // Site Updates
  siteUpdates: "/site-updates",
  siteUpdateById: (id: string) => `/site-updates/${id}`,

  // Roles
  roles: "/roles",
  roleById: (id: string) => `/roles/${id}`,

  // Attendance
  attendance: "/attendance",
  attendanceById: (id: string) => `/attendance/${id}`,

  // Clients
  clients: "/clients",
  clientById: (id: string) => `/clients/${id}`,

  // Payments
  payments: "/payments",
  paymentById: (id: string) => `/payments/${id}`,

  // Users / Staff
  users: "/users",
  userById: (id: string) => `/users/${id}`,

  // Tasks (General/Legacy)
  tasks: "/tasks",
  taskById: (id: string) => `/tasks/${id}`,
  tasksByProject: (projectId: string) => `/tasks?project=${projectId}`,

  // Site Photos
  sitePhotos: "/site-photos",
  sitePhotoById: (id: string) => `/site-photos/${id}`,
};

export default endPointApi;
