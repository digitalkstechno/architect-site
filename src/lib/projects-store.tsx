"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { projectService } from "@/services/project.service";
import { ProjectManagementFlow, DesignTask, SiteExecutionTask } from "./types/project-flow";

export type StageStatus = "Pending" | "In Progress" | "Completed";
export type LifecycleStatus = "Pending" | "In Progress" | "Completed";

export type ProjectStage = {
  name: string;
  status: StageStatus;
};

export type ProjectLifecyclePhase = {
  name: string;
  status: LifecycleStatus;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: string;
  progress: number;
  budget: number | string;
  received: number | string;
  pending: number | string;
  supervisorId?: string;
  supervisor?: any;
  workerIds?: string[];
  workers?: any[];
  phase?: string;
  lifecycle?: ProjectLifecyclePhase[];
  stages: ProjectStage[];
  flow?: ProjectManagementFlow;
};

type CreateProjectInput = Omit<
  Project,
  "id" | "progress" | "received" | "pending" | "status" | "phase"
> & {
  id?: string;
  progress?: number;
  received?: string;
  pending?: string;
  status?: string;
  phase?: string;
};

type ProjectsContextType = {
  projects: Project[];
  isHydrated: boolean;
  getProjectById: (id: string) => Project | undefined;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  updateStageStatus: (projectId: string, stageName: string, status: StageStatus) => Promise<void>;
  updateLifecycleStatus: (projectId: string, phaseName: string, status: LifecycleStatus) => void;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

function createDesignTask(title: string): DesignTask {
  return {
    id: "dt_" + Math.random().toString(36).substr(2, 9),
    title,
    assignedTo: [],
    status: "Pending",
    progress: 0,
    deadline: "",
    documents: [],
    comments: [],
    activityLogs: [],
  };
}

function createExecutionTask(stage: string): SiteExecutionTask {
  return {
    id: "et_" + Math.random().toString(36).substr(2, 9),
    stage,
    status: "Pending",
    progress: 0,
    images: [],
    materials: [],
    labourAttendance: [],
    notes: [],
    delays: [],
  };
}

function initializeFlow(): ProjectManagementFlow {
  return {
    officeWork: {
      civil: {
        layoutPlan: createDesignTask("Layout Plan Management"),
        detailedLayout: createDesignTask("Detailed Layout Plan"),
        elevationExterior: createDesignTask("Elevation & Exterior Design"),
        columnFooting: createDesignTask("Column & Footing Drawings"),
        groundPlinthBeam: createDesignTask("Ground Beam & Plinth Beam Drawings"),
        boringUGT: createDesignTask("Boring & UGT Tank Details"),
        slabBeamColumn: createDesignTask("Slab / Beam / Column Details"),
        workingDrawings: createDesignTask("Working Drawings"),
        elevationWorking: createDesignTask("Elevation Working"),
        drainageLayout: createDesignTask("Drainage Layout"),
      },
      interior: {
        furnitureLayout: createDesignTask("Furniture Layout"),
        soLayout: createDesignTask("SO Layout"),
        electricLayout: createDesignTask("Electric Layout"),
        loopingLayout: createDesignTask("Looping Layout"),
        acLayout: createDesignTask("AC Layout"),
        ceilingLayout: createDesignTask("Ceiling Layout"),
        plumbingLayout: createDesignTask("Plumbing Layout"),
        machineWorking: createDesignTask("Machine Working"),
        cncDrawings: createDesignTask("CNC Drawings"),
        softFurnishing: createDesignTask("Soft Furnishing Details"),
        model3D: createDesignTask("3D Model & Rendering"),
      },
    },
    siteWork: {
      civil: {
        boring: createExecutionTask("Boring"),
        foundation: createExecutionTask("Foundation"),
        plinthWork: createExecutionTask("Plinth Work"),
        drainageLine: createExecutionTask("Drainage Line"),
        structuralWork: createExecutionTask("Column, Beam & Slab Work"),
        brickWork: createExecutionTask("Brick Work"),
        plasterWork: createExecutionTask("Plaster Work"),
      },
      interior: {
        plumbing: createExecutionTask("Plumbing Work"),
        electric: createExecutionTask("Electric Work"),
        acPiping: createExecutionTask("AC Piping"),
        pestControl: createExecutionTask("Pest Control"),
        tilesStone: createExecutionTask("Tiles & Stone Work"),
        furniture: createExecutionTask("Furniture Work"),
        paint: createExecutionTask("Color/Paint Work"),
        cleaning: createExecutionTask("Cleaning Work"),
        lightingSurface: createExecutionTask("Surface Lighting & Headboard"),
        lightingDecoration: createExecutionTask("Lighting & Decoration"),
        appliances: createExecutionTask("Appliances & Accessories Installation"),
      },
    },
  };
}

function computeProgressFromStages(stages: ProjectStage[]): number {
  if (!stages || stages.length === 0) return 0;
  const completed = stages.filter((s) => s.status === "Completed").length;
  return Math.round((completed / stages.length) * 100);
}

function computeStatusFromProgress(progress: number): string {
  if (progress <= 0) return "Planned";
  if (progress >= 100) return "Completed";
  return "In Progress";
}

function computePhaseFromLifecycle(lifecycle?: ProjectLifecyclePhase[]): string | undefined {
  if (!lifecycle || lifecycle.length === 0) return undefined;
  const inProgress = lifecycle.find((p) => p.status === "In Progress");
  return inProgress?.name ?? lifecycle[lifecycle.length - 1]?.name;
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from Backend
  const fetchProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      if (data && data.length > 0) {
        // Map backend _id to id for frontend compatibility
        const mappedProjects = data.map((p: any) => ({
          ...p,
          id: p._id,
          workerIds: p.workers?.map((w: any) => typeof w === 'string' ? w : w._id) || [],
          supervisorId: typeof p.supervisor === 'string' ? p.supervisor : p.supervisor?._id,
          clientId: typeof p.client === 'string' ? p.client : p.client?._id,
          client: p.client?.name || p.client,
        }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error("Failed to fetch projects from backend", error);
    } finally {
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchProjects();
    else setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      if (token) fetchProjects();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("refreshProjects", fetchProjects);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("refreshProjects", fetchProjects);
    };
  }, []);

  const api = useMemo<ProjectsContextType>(() => {
    const getProjectById = (id: string) => projects.find((p) => p.id === id);

    const createProject = async (input: CreateProjectInput): Promise<Project> => {
      try {
        const payload = {
          name: input.name,
          client: input.clientId || input.client,
          location: input.location,
          startDate: input.startDate,
          expectedCompletion: input.expectedCompletion,
          budget: input.budget,
          designer: (input as any).designerId,
          stages: input.stages,
        };
        const data = await projectService.createProject(payload);
        await fetchProjects();
        return { ...data, id: data._id } as any;
      } catch (error) {
        console.error("Failed to create project on backend", error);
        throw error;
      }
    };

    const updateProject = async (id: string, patch: Partial<Project>) => {
      try {
        const payload = {
          ...patch,
          client: patch.clientId || patch.client,
          designer: (patch as any).designerId || (patch as any).designer?._id,
          supervisor: patch.supervisorId || patch.supervisor?._id,
          workers: patch.workerIds || patch.workers,
        };
        await projectService.updateProject(id, payload);
        await fetchProjects();
      } catch (error) {
        console.error("Failed to update project on backend", error);
        // Fallback to local update if API fails (optional, but good for UX)
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      }
    };

    const deleteProject = async (id: string) => {
      try {
        await projectService.deleteProject(id);
        await fetchProjects();
      } catch (error) {
        console.error("Failed to delete project on backend", error);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    };

    const updateStageStatus = async (projectId: string, stageName: string, status: StageStatus) => {
      try {
        await projectService.updateStage(projectId, { stageName, status });
        await fetchProjects();
      } catch (error) {
        console.error("Failed to update stage status on backend", error);
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const stages = (p.stages ?? []).map((s) => (s.name === stageName ? { ...s, status } : s));
            const progress = computeProgressFromStages(stages);
            const statusText = computeStatusFromProgress(progress);
            return { ...p, stages, progress, status: statusText };
          })
        );
      }
    };

    const updateLifecycleStatus = (projectId: string, phaseName: string, status: LifecycleStatus) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const lifecycle = (p.lifecycle ?? []).map((ph) => (ph.name === phaseName ? { ...ph, status } : ph));
          const phase = computePhaseFromLifecycle(lifecycle) ?? p.phase;
          return { ...p, lifecycle, phase };
        })
      );
    };

    return {
      projects,
      isHydrated,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      updateStageStatus,
      updateLifecycleStatus,
      fetchProjects,
    };
  }, [projects, isHydrated]);

  return <ProjectsContext.Provider value={api}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
}

