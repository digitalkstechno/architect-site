"use client";

import { calendarEvents } from "@/lib/dummy-data";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2,
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
  addDays, 
  eachDayOfInterval,
  isToday
} from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 2, 1)); // March 2024 as default to match dummy data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

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

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Schedule</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Monitor construction milestones and deadlines</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }} 
              className="gap-2 shadow-lg shadow-indigo-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Schedule Work</span>
            </Button>
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
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const dayEvents = calendarEvents.filter(e => isSameDay(new Date(e.date), day));

                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "bg-white p-4 h-32 border-slate-50 transition-all hover:bg-slate-50/50 group relative cursor-pointer",
                        !isCurrentMonth && "opacity-20"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold transition-colors w-7 h-7 flex items-center justify-center rounded-lg",
                        isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : 
                        isToday(day) ? "bg-indigo-50 text-indigo-600" : "text-slate-400 group-hover:text-slate-900"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="mt-2 space-y-1">
                        {dayEvents.map((event, eventIdx) => (
                          <div key={eventIdx} className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm animate-in zoom-in duration-300">
                            <p className="text-[10px] font-bold text-indigo-700 leading-tight truncate">{event.title}</p>
                            <p className="text-[9px] font-medium text-indigo-500 uppercase tracking-wider">{event.type}</p>
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
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h3>
              <div className="space-y-6">
                {calendarEvents.slice(0, 3).map((event, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-colors duration-500 shadow-sm">
                      <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-200 uppercase tracking-widest">{format(new Date(event.date), "MMM")}</span>
                      <span className="text-sm font-extrabold text-indigo-700 group-hover:text-white">{format(new Date(event.date), "d")}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">09:00 AM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full text-slate-500 hover:text-indigo-600 uppercase tracking-widest text-xs">
                View All Schedule
              </Button>
            </Card>

            <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <Construction className="w-10 h-10 text-white/30" />
              <h3 className="text-lg font-bold text-white relative z-10">Sync with Google Calendar</h3>
              <p className="text-sm text-indigo-100 relative z-10">Keep your team updated with real-time schedule syncing.</p>
              <Button variant="white" className="shadow-lg relative z-10">
                Connect Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDate ? `Schedule for ${format(selectedDate, "MMM d, yyyy")}` : ""}
      >
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Event Title</label>
            <Input placeholder="e.g., Plumbing Start" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Event Type</label>
            <Input placeholder="e.g., Plumbing" />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Save Event
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
