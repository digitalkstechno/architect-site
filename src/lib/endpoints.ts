/**
 * Centralized API endpoints for the Architect site
 */
export interface EndPointApi {
  // Auth
  login: string;
  register: string;
  getMe: string;
  forgotPassword: string;
  resetPassword: string;

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

  // Messages
  messages: string;
  messageConversations: string;
  messagesByContact: (contactId: string) => string;
  markMessagesRead: (contactId: string) => string;
  deleteMessage: (id: string) => string;

  // Working SOPs
  workingSOPs: string;
  workingSOPById: (id: string) => string;

  // Materials
  materialRequests: string;
  materialRequestById: (id: string) => string;

  // Invoices
  invoices: string;
  invoiceById: (id: string) => string;

  // Guest Logins
  guestLogins: string;

  // Documents
  documents: string;
  documentById: (id: string) => string;

  // Dashboard
  dashboard: string;

  // Agencies
  agencyRegister: string;
  agencyPending: string;
  agencyRoles: string;
  agencyById: (id: string) => string;
  agencyApprove: (id: string) => string;
  agencyReject: (id: string) => string;
  agencySendOtp: string;
  agencyVerifyOtp: string;

  // Notifications
  notifications: string;
  notificationRead: (id: string) => string;
  notificationReadAll: string;

  // Company
  company: string;
}

const endPointApi: EndPointApi = {
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  getMe: "/auth/me",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",

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

  // Messages
  messages: "/messages",
  messageConversations: "/messages/conversations",
  messagesByContact: (contactId: string) => `/messages/${contactId}`,
  markMessagesRead: (contactId: string) => `/messages/${contactId}/read`,
  deleteMessage: (id: string) => `/messages/${id}`,

  // Working SOPs
  workingSOPs: "/working-sops",
  workingSOPById: (id: string) => `/working-sops/${id}`,

  // Materials
  materialRequests: "/material-requests",
  materialRequestById: (id: string) => `/material-requests/${id}`,

  // Invoices
  invoices: "/invoices",
  invoiceById: (id: string) => `/invoices/${id}`,

  // Guest Logins
  guestLogins: "/guest-logins",

  // Documents
  documents: "/documents",
  documentById: (id: string) => `/documents/${id}`,

  // Dashboard
  dashboard: "/dashboard",

  // Agencies
  agencyRegister: "/agencies/register",
  agencyPending: "/agencies/pending",
  agencyRoles: "/agencies/roles",
  agencyById: (id: string) => `/agencies/${id}`,
  agencyApprove: (id: string) => `/agencies/${id}/approve`,
  agencyReject: (id: string) => `/agencies/${id}/reject`,
  agencySendOtp: "/agencies/send-otp",
  agencyVerifyOtp: "/agencies/verify-otp",

  // Notifications
  notifications: "/notifications",
  notificationRead: (id: string) => `/notifications/${id}/read`,
  notificationReadAll: "/notifications/read-all",

  // Company
  company: "/company",
};

export default endPointApi;
