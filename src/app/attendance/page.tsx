"use client";

import { useState, useEffect } from "react";
import { workers as dummyWorkers, supervisors, projects } from "@/lib/dummy-data";
import { Search, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

const today = new Date().toISOString().split("T")[0];

type AttendanceRecord = {
  id: number;
  workerId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
};

const initialAttendance: AttendanceRecord[] = [
  { id: 1, workerId: "1", date: today, checkIn: "08:02 AM", checkOut: "05:05 PM", status: "Present" },
  { id: 2, workerId: "2", date: today, checkIn: "08:15 AM", checkOut: "05:00 PM", status: "Present" },
  { id: 3, workerId: "3", date: today, checkIn: null, checkOut: null, status: "Absent" },
  { id: 4, workerId: "4", date: today, checkIn: "08:05 AM", checkOut: "03:30 PM", status: "Half-day" },
];

const statusOptions = ["Present", "Absent", "Half-day", "Leave"];

export default function AttendancePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const [workersRes, attendanceRes] = await Promise.all([
        fetch("http://localhost:9000/architecture/worker", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:9000/architecture/attendence?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const workersData = await workersRes.json();
      const attendanceData = await attendanceRes.json();

      setWorkers(workersData.data || workersData || []);
      setAttendance(attendanceData.data || attendanceData || []);
    } catch (err) {
      console.error("Fetch attendance error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const updateStatus = async (workerId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const existing = attendance.find(a => a.workerId === workerId);
      if (existing) {
        await fetch(`http://localhost:9000/architecture/attendence/${existing.id || (existing as any)._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: newStatus })
        });
      } else {
        await fetch(`http://localhost:9000/architecture/attendence`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ workerId, date: selectedDate, status: newStatus })
        });
      }
      fetchAttendanceData();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const markCheckIn = async (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    // Similar logic to updateStatus but with checkIn time
    await updateStatus(workerId, "Present"); // Simplified for now
  };

  const markCheckOut = async (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    // Similar logic to updateStatus but with checkOut time
  };

  const canEdit = user?.role === "architect" || user?.role === "supervisor";

  // Filter workers based on search
  const filteredWorkers = workers.filter(w =>
    w.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = attendance.filter(a => a.status === "Present").length;
  const absentCount = attendance.filter(a => a.status === "Absent").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Attendance</h2>
          <p className="text-sm font-medium text-slate-500 hidden sm:block">
            {canEdit ? "Mark and manage daily attendance" : "View attendance records"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search worker..."
            icon={Search}
            className="w-56 hidden md:flex"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Workers", value: filteredWorkers.length, color: "bg-slate-50 border-slate-200 text-slate-900" },
          { label: "Present", value: presentCount, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Absent", value: absentCount, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Half-day", value: attendance.filter(a => a.status === "Half-day").length, color: "bg-orange-50 border-orange-200 text-orange-700" },
        ].map((s) => (
          <Card key={s.label} className={cn("p-5 border", s.color)}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Worker</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-in</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-out</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                {canEdit && <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((worker) => {
                const att = attendance.find(a => a.workerId === worker.id);
                return (
                  <tr key={worker.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                          {worker.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{worker.name}</p>
                          <p className="text-xs font-medium text-slate-500">{worker.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {canEdit && !att?.checkIn && att?.status !== "Absent" ? (
                        <Button variant="outline" size="sm" onClick={() => markCheckIn(worker.id)} className="text-green-600 border-green-200 hover:bg-green-50 text-xs">
                          Mark In
                        </Button>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{att?.checkIn || "—"}</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {canEdit && att?.checkIn && !att?.checkOut ? (
                        <Button variant="outline" size="sm" onClick={() => markCheckOut(worker.id)} className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs">
                          Mark Out
                        </Button>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{att?.checkOut || "—"}</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {canEdit ? (
                        <select
                          value={att?.status || "Absent"}
                          onChange={(e) => updateStatus(worker.id, e.target.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
                            att?.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                            att?.status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                            att?.status === "Half-day" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                          att?.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                          att?.status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        )}>
                          {att?.status || "N/A"}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-8 py-6 text-right">
                        <span className="text-xs font-bold text-slate-400">{att?.status === "Present" ? "✓ Marked" : "Pending"}</span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
