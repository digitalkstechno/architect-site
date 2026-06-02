export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Revision Required";

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface DesignDocument {
  id: string;
  name: string;
  fileUrl: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  status: ApprovalStatus;
  notes?: string;
}

export interface DesignTask {
  id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  deadline: string;
  documents: DesignDocument[];
  comments: { user: string; text: string; timestamp: string }[];
  activityLogs: ActivityLog[];
}

export interface CivilDesigning {
  layoutPlan: DesignTask;
  detailedLayout: DesignTask;
  elevationExterior: DesignTask;
  columnFooting: DesignTask;
  groundPlinthBeam: DesignTask;
  boringUGT: DesignTask;
  slabBeamColumn: DesignTask;
  workingDrawings: DesignTask;
  elevationWorking: DesignTask;
  drainageLayout: DesignTask;
}

export interface InteriorDesigning {
  furnitureLayout: DesignTask;
  soLayout: DesignTask;
  electricLayout: DesignTask;
  loopingLayout: DesignTask;
  acLayout: DesignTask;
  ceilingLayout: DesignTask;
  plumbingLayout: DesignTask;
  machineWorking: DesignTask;
  cncDrawings: DesignTask;
  softFurnishing: DesignTask;
  model3D: DesignTask;
}

export interface SiteExecutionTask {
  id: string;
  stage: string;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  startDate?: string;
  endDate?: string;
  images: string[];
  materials: { name: string; quantity: string; cost: number }[];
  labourAttendance: { workerId: string; date: string; status: "Present" | "Absent" }[];
  notes: string[];
  contractorId?: string;
  delays: { reason: string; days: number }[];
}

export interface CivilExecution {
  boring: SiteExecutionTask;
  foundation: SiteExecutionTask;
  plinthWork: SiteExecutionTask; // Pest Control, Earthing sub-tasks
  drainageLine: SiteExecutionTask;
  structuralWork: SiteExecutionTask; // Column, Beam, Slab
  brickWork: SiteExecutionTask;
  plasterWork: SiteExecutionTask;
}

export interface InteriorExecution {
  plumbing: SiteExecutionTask;
  electric: SiteExecutionTask;
  acPiping: SiteExecutionTask;
  pestControl: SiteExecutionTask;
  tilesStone: SiteExecutionTask;
  furniture: SiteExecutionTask;
  paint: SiteExecutionTask;
  cleaning: SiteExecutionTask;
  lightingSurface: SiteExecutionTask;
  lightingDecoration: SiteExecutionTask;
  appliances: SiteExecutionTask;
}

export interface ProjectManagementFlow {
  officeWork: {
    civil: CivilDesigning;
    interior: InteriorDesigning;
  };
  siteWork: {
    civil: CivilExecution;
    interior: InteriorExecution;
  };
}
