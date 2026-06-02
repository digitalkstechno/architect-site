"use client";

import { SiteTask, SiteTaskStatus } from "@/lib/site-tasks-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { HardHat, Camera, Hammer, CheckCircle2, AlertCircle, ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface ExecutionModuleProps {
  tasks: SiteTask[];
  projectId: string;
  updateTaskStatus?: (id: string, status: SiteTaskStatus) => void;
}

export function ExecutionModule({ tasks, projectId, updateTaskStatus }: ExecutionModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"civil" | "interior">("civil");

  if (!tasks) return <div className="p-10 text-center text-slate-500">Execution data not available.</div>;

  const civilStages = tasks.filter(t => t.category === "Civil");
  const interiorStages = tasks.filter(t => t.category === "Interior");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab("civil")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-medium transition-all",
            activeSubTab === "civil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-900"
          )}
        >
          Civil Work
        </button>
        <button
          onClick={() => setActiveSubTab("interior")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-medium transition-all",
            activeSubTab === "interior" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-900"
          )}
        >
          Interior Work
        </button>
      </div>

      <div className="space-y-4">
        {(activeSubTab === "civil" ? civilStages : interiorStages).map((stage) => (
          <ExecutionStageCard key={stage.id} stage={stage} onStatusChange={(status) => updateTaskStatus?.(stage.id, status)} />
        ))}
      </div>
    </div>
  );
}

function ExecutionStageCard({ stage, onStatusChange }: { stage: SiteTask, onStatusChange?: (status: SiteTaskStatus) => void }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const statusColors = {
    "Pending": "bg-slate-100 text-slate-500 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
    "Completed": "bg-green-50 text-green-600 border-green-200",
    "Critical": "bg-red-50 text-red-600 border-red-200",
    "Delayed": "bg-orange-50 text-orange-600 border-orange-200",
    "On Track": "bg-blue-50 text-blue-600 border-blue-200",
  };

  const statusOptions: SiteTaskStatus[] = ["On Track", "In Progress", "Completed", "Critical", "Delayed", "Pending"];

  return (
    <>
      <Card className="p-3 hover:shadow-sm transition-all border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
              stage.status === "Completed" ? "bg-green-50 border-green-100 text-green-600" :
              stage.status === "In Progress" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
              "bg-slate-50 border-slate-100 text-slate-400"
            )}>
              {stage.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{stage.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={stage.status}
                  onChange={(e) => onStatusChange?.(e.target.value as SiteTaskStatus)}
                  className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-md border font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer",
                    statusColors[stage.status as keyof typeof statusColors] || statusColors["Pending"]
                  )}
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <Camera className="w-3 h-3" />
                  {stage.images?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex-1 md:w-40 space-y-1">
              <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <span>Progress</span>
                <span>{stage.progress}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${stage.progress}%` }} 
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              onClick={() => setIsPreviewOpen(true)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={stage.title}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge className="text-[10px]">{stage.status}</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-sm font-bold text-slate-700">{stage.progress}%</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Camera className="w-3 h-3" /> Execution Photos ({stage.images?.length || 0})
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {stage.images?.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 group relative">
                  <img src={img} alt={`Execution ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    VIEW FULL
                  </a>
                </div>
              ))}
              {(!stage.images || stage.images.length === 0) && (
                <div className="col-span-3 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                  No photos uploaded yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technical Notes</h4>
            <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-inner italic">
              {stage.notes || "No technical notes provided."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
