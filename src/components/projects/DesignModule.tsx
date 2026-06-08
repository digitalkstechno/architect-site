"use client";

import { OfficeTask, OfficeTaskStatus } from "@/lib/office-tasks-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, FileText, Plus, ChevronRight, Camera } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface DesignModuleProps {
  tasks: OfficeTask[];
  projectId: string;
  updateTaskStatus?: (id: string, status: OfficeTaskStatus) => void;
}

export function DesignModule({ tasks, projectId, updateTaskStatus }: DesignModuleProps) {
  if (!tasks) return <div className="p-10 text-center text-slate-500">Design data not available.</div>;

  const civilTasks = tasks.filter(t => t.category === "Civil");
  const interiorTasks = tasks.filter(t => t.category === "Interior");
  console.log("DesignModule tasks:", tasks);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="space-y-4 md:pr-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Civil Designing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {civilTasks.map((task) => (
            <DesignTaskCard key={task.id} task={task} onStatusChange={(status) => updateTaskStatus?.(task.id, status)} />
          ))}
        </div>
      </div>

      <div className="space-y-4 md:pl-8 md:border-l md:border-slate-200 mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Interior Designing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {interiorTasks.map((task) => (
            <DesignTaskCard key={task.id} task={task} onStatusChange={(status) => updateTaskStatus?.(task.id, status)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DesignTaskCard({ task, onStatusChange }: { task: OfficeTask, onStatusChange?: (status: OfficeTaskStatus) => void }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const statusColors = {
    "Pending": "bg-slate-100 text-slate-500 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
    "Completed": "bg-green-50 text-green-600 border-green-200",
  };

  const statusOptions: OfficeTaskStatus[] = ["Pending", "In Progress", "Completed"];

  return (
    <>
      <Card className="p-2.5 space-y-2.5 hover:shadow-md transition-all group border-slate-200">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{task.title}</h4>
            <select
              value={task.status}
              onChange={(e) => onStatusChange?.(e.target.value as OfficeTaskStatus)}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-md border font-black uppercase tracking-tighter focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer",
                statusColors[task.status]
              )}
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
            <FileText className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter font-mono">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${task.progress}%` }} 
            />
          </div>
        </div>

        {task.images && task.images.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-hide">
            {task.images.slice(0, 2).map((img, i) => (
              <div key={i} className="w-6 h-6 rounded-md overflow-hidden border border-slate-100 flex-shrink-0">
                <img src={img} alt="Design" className="w-full h-full object-cover" />
              </div>
            ))}
            {task.images.length > 2 && (
              <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                +{task.images.length - 2}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-2">
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            {task.assignedTo && task.assignedTo.length > 0 ? (
              task.assignedTo.map((user, i) => (
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

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={task.title}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge className="text-[10px]">{task.status}</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-sm font-bold text-slate-700">{task.progress}%</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Camera className="w-3 h-3" /> Design Photos ({task.images?.length || 0})
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {task.images?.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 group relative">
                  <img src={img} alt={`Design ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    VIEW FULL
                  </a>
                </div>
              ))}
              {(!task.images || task.images.length === 0) && (
                <div className="col-span-3 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                  No photos uploaded yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</h4>
            <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-inner italic">
              {task.notes || "No additional notes provided."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
