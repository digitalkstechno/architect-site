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
  if (!tasks) return <div className="p-10 text-center text-slate-500">Execution data not available.</div>;

  const civilStages = tasks.filter(t => t.category === "Civil");
  const interiorStages = tasks.filter(t => t.category === "Interior");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="space-y-4 md:pr-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Civil Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {civilStages.map((stage) => (
            <ExecutionStageCard key={stage.id} stage={stage} onStatusChange={(status) => updateTaskStatus?.(stage.id, status)} />
          ))}
        </div>
      </div>

      <div className="space-y-4 md:pl-8 md:border-l md:border-slate-200 mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Interior Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {interiorStages.map((stage) => (
            <ExecutionStageCard key={stage.id} stage={stage} onStatusChange={(status) => updateTaskStatus?.(stage.id, status)} />
          ))}
        </div>
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
      <Card className="p-2.5 space-y-2.5 hover:shadow-md transition-all group border-slate-200">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{stage.title}</h4>
            <select
              value={stage.status}
              onChange={(e) => onStatusChange?.(e.target.value as SiteTaskStatus)}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-md border font-black uppercase tracking-tighter focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer",
                statusColors[stage.status as keyof typeof statusColors] || statusColors["Pending"]
              )}
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className={cn(
            "p-1 rounded-lg border shrink-0",
             stage.status === "Completed" ? "bg-green-50 border-green-100 text-green-600" :
             stage.status === "In Progress" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
             "bg-slate-50 border-slate-100 text-slate-400"
          )}>
            {stage.status === "Completed" ? <CheckCircle2 className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter font-mono">
            <span>Progress</span>
            <span>{stage.progress}%</span>
          </div>
          <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${stage.progress}%` }} 
            />
          </div>
        </div>

        {stage.images && stage.images.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-hide">
            {stage.images.slice(0, 2).map((img, i) => (
              <div key={i} className="w-6 h-6 rounded-md overflow-hidden border border-slate-100 flex-shrink-0">
                <img src={img} alt="Execution" className="w-full h-full object-cover" />
              </div>
            ))}
            {stage.images.length > 2 && (
              <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                +{stage.images.length - 2}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-2">
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            {stage.assignedTo && stage.assignedTo.length > 0 ? (
              stage.assignedTo.map((user: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 font-mono shrink-0 shadow-sm">
                    {(user.name || user)[0]}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-slate-700 truncate">{user.name || user}</span>
                    {user.role && <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest truncate">{user.role?.name || user.role}</span>}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unassigned</span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs font-bold uppercase tracking-widest gap-0.5 hover:text-indigo-600 p-0"
            onClick={() => setIsPreviewOpen(true)}
          >
            Info <ChevronRight className="w-3 h-3" />
          </Button>
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
