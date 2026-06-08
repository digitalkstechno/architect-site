"use client";

import { 
  Briefcase, 
  Construction, 
  Clock, 
  CreditCard,
  CheckCircle,
  HardHat,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/projects-store";
import { useSiteTasks } from "@/lib/site-tasks-store";
import { useOfficeTasks } from "@/lib/office-tasks-store";

export default function DashboardCards() {
  const { projects } = useProjects();
  const { siteTasks } = useSiteTasks();
  const { officeTasks } = useOfficeTasks();

  const completedProjects = projects.filter(p => p.status === "Completed").length;
  const pendingProjects = projects.filter(p => p.status !== "Completed").length;

  const stats = [
    { 
      label: "Completed Projects", 
      value: completedProjects.toString(), 
      icon: CheckCircle, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    { 
      label: "Pending Projects", 
      value: pendingProjects.toString(), 
      icon: Construction, 
      color: "text-green-600", 
      bg: "bg-green-50",
      border: "border-green-100"
    },
    { 
      label: "Site Tasks", 
      value: siteTasks.length.toString(), 
      icon: HardHat, 
      color: "text-orange-600", 
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
    { 
      label: "Office Tasks", 
      value: officeTasks.length.toString(), 
      icon: FileText, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className={cn(
            "p-6 bg-white rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-5",
            stat.border
          )}
        >
          <div className={cn("p-3 rounded-xl", stat.bg)}>
            <stat.icon className={cn("w-6 h-6", stat.color)} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">{stat.label}</p>
            <p className="text-2xl font-medium text-slate-900 tracking-tight font-mono">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
