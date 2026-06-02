"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Construction
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isToday,
  startOfDay,
  endOfDay
} from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useOfficeTasks } from "@/lib/office-tasks-store";
import { useSiteTasks } from "@/lib/site-tasks-store";

export default function CalendarPage() {
  const { officeTasks } = useOfficeTasks();
  const { siteTasks } = useSiteTasks();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("All");

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Extract unique projects for the filter
  const allProjects = Array.from(new Set([
    ...officeTasks.map(t => (t.project as any)?.name || t.project),
    ...siteTasks.map(t => (t.project as any)?.name || t.project)
  ])).filter(Boolean) as string[];

  // Filter tasks by selected project
  const filteredOfficeTasks = selectedProject === "All" ? officeTasks : officeTasks.filter(t => ((t.project as any)?.name || t.project) === selectedProject);
  const filteredSiteTasks = selectedProject === "All" ? siteTasks : siteTasks.filter(t => ((t.project as any)?.name || t.project) === selectedProject);

  // Combine office tasks and site tasks into split start/end events
  const combinedTasks: any[] = [];
  
  const processTasks = (tasks: any[], displayType: string, colorClass: string, typeColorClass: string) => {
    tasks.forEach(t => {
      if (!t.startDate && !t.endDate) return;
      
      const pName = (t.project as any)?.name || t.project;
      
      if (t.startDate && t.endDate && t.startDate !== t.endDate) {
        combinedTasks.push({
          ...t,
          displayTitle: `${t.title} - Start`,
          targetDate: new Date(t.startDate),
          displayType,
          colorClass,
          typeColorClass,
          projectName: pName
        });
        combinedTasks.push({
          ...t,
          displayTitle: `${t.title} - End`,
          targetDate: new Date(t.endDate),
          displayType,
          colorClass,
          typeColorClass,
          projectName: pName
        });
      } else {
        const date = t.startDate || t.endDate;
        combinedTasks.push({
          ...t,
          displayTitle: t.title,
          targetDate: new Date(date),
          displayType,
          colorClass,
          typeColorClass,
          projectName: pName
        });
      }
    });
  };

  processTasks(filteredOfficeTasks, "Office Task", "bg-purple-50 border-purple-100 text-purple-700", "text-purple-500");
  processTasks(filteredSiteTasks, "Site Task", "bg-orange-50 border-orange-100 text-orange-700", "text-orange-500");

  // Sort upcoming tasks for the right sidebar
  const upcomingTasks = [...combinedTasks]
    .filter(t => t.targetDate >= startOfDay(new Date()))
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
    .slice(0, 4);

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Schedule</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Monitor construction milestones and deadlines</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-48 p-2 font-medium shadow-sm outline-none cursor-pointer"
            >
              <option value="All">All Projects</option>
              {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <Card className="p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {format(currentMonth, "MMMM yyyy")}
                  </h3>
                  <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="text-slate-400 hover:text-indigo-600">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="text-slate-400 hover:text-indigo-600">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {["Month", "Week", "Day"].map((view) => (
                    <Button
                      key={view}
                      variant={view === "Month" ? "white" : "ghost"}
                      size="sm"
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        view === "Month" ? "text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {view}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                {weekDays.map((day) => (
                  <div key={day} className="bg-slate-50/50 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);

                  const dayEvents = combinedTasks.filter(task => {
                    return isSameDay(day, task.targetDate);
                  });

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "bg-white p-4 h-32 border-slate-50 transition-all hover:bg-slate-50/50 group relative overflow-y-auto custom-scrollbar",
                        !isCurrentMonth && "opacity-20"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold transition-colors w-7 h-7 flex items-center justify-center rounded-lg mb-2",
                        isToday(day) ? "bg-indigo-50 text-indigo-600" : "text-slate-400 group-hover:text-slate-900"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="space-y-1">
                        {dayEvents.map((event, eventIdx) => (
                          <div key={eventIdx} className={cn("p-1.5 border rounded-lg shadow-sm animate-in zoom-in duration-300", event.colorClass)}>
                            <p className="text-[10px] font-bold leading-tight truncate" title={event.displayTitle}>{event.displayTitle}</p>
                            <p className={cn("text-[9px] font-medium uppercase tracking-wider", event.typeColorClass)}>{event.displayType}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Schedule</h3>
              <div className="space-y-6">
                {upcomingTasks.length > 0 ? upcomingTasks.map((task, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className={cn("w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-colors duration-500 shadow-sm shrink-0",
                      task.displayType === "Office Task" ? "bg-purple-50 border-purple-100 group-hover:bg-purple-600" : "bg-orange-50 border-orange-100 group-hover:bg-orange-600"
                    )}>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", 
                        task.displayType === "Office Task" ? "text-purple-400 group-hover:text-purple-200" : "text-orange-400 group-hover:text-orange-200"
                      )}>{format(task.targetDate, "MMM")}</span>
                      <span className={cn("text-sm font-extrabold", 
                        task.displayType === "Office Task" ? "text-purple-700 group-hover:text-white" : "text-orange-700 group-hover:text-white"
                      )}>{format(task.targetDate, "d")}</span>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate" title={task.displayTitle}>{task.displayTitle}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 truncate">{task.projectName}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 font-medium">No upcoming scheduled tasks.</p>
                )}
              </div>
            </Card>

            {/* <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <Construction className="w-10 h-10 text-white/30" />
              <h3 className="text-lg font-bold text-white relative z-10">Sync with Google Calendar</h3>
              <p className="text-sm text-indigo-100 relative z-10">Keep your team updated with real-time schedule syncing.</p>
              <Button variant="white" className="shadow-lg relative z-10">
                Connect Now
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
