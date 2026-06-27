"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Settings, Plus, Clock, Save, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/ui/Modal";
import { attendanceService } from "@/services/attendance.service";
import { StaffMember, staffService } from "@/services/staff.service";
import { roleService, Role } from "@/services/role.service";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

// Helper to get formatted date like "Wed, 20 May 2026"
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Weekly Off" | "Overtime" | null;

type SalaryPayoutType = "Monthly" | "Daily" | "Hourly";

type AttendanceLog = {
  checkIn: string;
  checkOut?: string;
  duration: number;
};

type OvertimeData = {
  type: "hourly" | "fixed";
  hours: number;
  rate: number;
  amount: number;
};

type StaffAttendance = {
  _id: string;
  name: string;
  role: { name: string; _id: string };
  email: string;
  phone: string;
  team: "Office" | "Site";
  payoutType: SalaryPayoutType;
  salaryAmount: number;
  lastMonthDue: number;
  config: {
    hoursPerDay: number;
    daysPerMonth: number;
  };
  attendance?: {
    _id?: string;
    status: AttendanceStatus;
    totalMinutes: number;
    logs: AttendanceLog[];
    overtime?: OvertimeData;
  };
};

export default function AttendancePage() {
  const { user } = useAuth();
  const { canCreate, canEdit, canDelete, hasAll } = usePermissions("attendance");
  const isAdmin = hasAll;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffList, setStaffList] = useState<StaffAttendance[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [myStatus, setMyStatus] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  // Global Config (Director defined)
  const [globalConfig, setGlobalConfig] = useState({
    hoursPerDay: 8,
    daysPerMonth: 26
  });

  // Manual Time Edit State
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffAttendance | null>(null);
  const [manualHours, setManualHours] = useState(0);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>("Present");

  // Add Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [untrackedStaff, setUntrackedStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newStaffConfig, setNewStaffConfig] = useState({
    payoutType: "Monthly" as SalaryPayoutType,
    salaryAmount: 0,
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Overtime State
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [selectedStaffForOT, setSelectedStaffForOT] = useState<StaffAttendance | null>(null);
  const [otType, setOtType] = useState<"hourly" | "fixed">("hourly");
  const [otHours, setOtHours] = useState(0);
  const [otMins, setOtMins] = useState(0);
  const [otRate, setOtRate] = useState(0);
  const [otFixedAmount, setOtFixedAmount] = useState(0);

  // Salary Slip State
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<StaffAttendance | null>(null);

  // View Sessions State
  const [isViewSessionsModalOpen, setIsViewSessionsModalOpen] = useState(false);
  const [selectedStaffForSessions, setSelectedStaffForSessions] = useState<StaffAttendance | null>(null);

  const calculateTotalDisplayMinutes = (attendance: any) => {
    if (!attendance) return 0;
    let total = attendance.totalMinutes || 0;
    if (attendance.logs && attendance.logs.length > 0) {
      const lastLog = attendance.logs[attendance.logs.length - 1];
      // Only calculate ongoing duration for today to prevent weird calculations on past days
      const isToday = new Date(attendance.date).toDateString() === new Date().toDateString();
      if (lastLog && !lastLog.checkOut && isToday) {
        const checkInTime = new Date(lastLog.checkIn).getTime();
        const now = new Date().getTime();
        const diffMins = Math.floor((now - checkInTime) / 60000);
        total += diffMins;
      }
    }
    return total;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

      if (isAdmin) {
        const [staffData, attendanceData, rolesData, allOfficeStaff]: [any, any, any, any] = await Promise.all([
          staffService.getAllStaff({ team: "Office", trackAttendance: "true" }),
          attendanceService.getAllAttendance(viewMode === "daily" ? { date: dateStr } : { startDate: startOfMonth, endDate: endOfMonth }),
          roleService.getAllRoles(),
          staffService.getAllStaff({ team: "Office" })
        ]);

        setRoles(rolesData);
        setUntrackedStaff(allOfficeStaff.filter((s: any) => !s.trackAttendance));

        if (viewMode === "daily") {
          const combined = staffData.map((s: any) => {
            const att = attendanceData.find((a: any) => (a.user?._id || a.user) === s._id);
            return { ...s, attendance: att };
          });
          setStaffList(combined);
        } else {
          const combined = staffData.map((s: any) => {
            const staffRecords = attendanceData.filter((a: any) => (a.user?._id || a.user) === s._id);
            
            let present = 0, absent = 0, halfDay = 0, leave = 0, weeklyOff = 0, overtimeAmount = 0;
            let calculatedSalary = 0;
            const dailyRate = s.payoutType === "Daily" ? s.salaryAmount : (s.salaryAmount / (s.config?.daysPerMonth || 26));
            
            staffRecords.forEach((record: any) => {
              if (record.isManual) {
                if (record.status === "Present") { present++; calculatedSalary += dailyRate; }
                else if (record.status === "Absent") absent++;
                else if (record.status === "Half Day") { halfDay++; calculatedSalary += (dailyRate / 2); }
                else if (record.status === "Leave") leave++;
                else if (record.status === "Weekly Off") weeklyOff++;
              } else {
                const totalMins = calculateTotalDisplayMinutes(record);
                const workedHours = totalMins / 60;
                const standardHours = s.config?.hoursPerDay || 8;
                
                if (workedHours >= standardHours) {
                  present++;
                  calculatedSalary += dailyRate;
                } else if (workedHours >= (standardHours / 2)) {
                  halfDay++;
                  calculatedSalary += (dailyRate / 2);
                } else if (workedHours > 0) {
                  absent++;
                  calculatedSalary += (workedHours / standardHours) * dailyRate;
                } else {
                  absent++;
                }
              }
              
              if (record.overtime?.amount) {
                overtimeAmount += record.overtime.amount;
              }
            });

            return { 
              ...s, 
              monthlyStats: { present, absent, halfDay, leave, weeklyOff, overtimeAmount, calculatedSalary }
            };
          });
          setStaffList(combined);
        }
      } else {
        if (!user?.id) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
        const [history, status] = await Promise.all([
          attendanceService.getAllAttendance({ user: user.id, startDate: startOfMonth, endDate: endOfMonth }),
          attendanceService.getMyStatus()
        ]);
        setMyAttendance(Array.isArray(history) ? history : []);
        setMyStatus(status || null);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    const handleUpdate = () => { if (user) fetchData(); };
    window.addEventListener("attendance_updated", handleUpdate);
    return () => window.removeEventListener("attendance_updated", handleUpdate);
  }, [currentDate, user, viewMode]);

  const handleStatusChange = async (staffId: string, status: AttendanceStatus) => {
    try {
      const staff = staffList.find(s => s._id === staffId);
      const dateStr = currentDate.toISOString().split('T')[0];

      let totalMinutes = 0;
      if (status === "Present") totalMinutes = (staff?.config?.hoursPerDay || 8) * 60;
      else if (status === "Half Day") totalMinutes = ((staff?.config?.hoursPerDay || 8) / 2) * 60;

      const payload = {
        user: staffId,
        date: dateStr,
        status,
        totalMinutes,
        isManual: true
      };

      await attendanceService.updateAttendance(staff?.attendance?._id || "new", payload);

      toast.success("Attendance updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleManualUpdate = async () => {
    if (!selectedStaffForEdit) return;
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const payload = {
        user: selectedStaffForEdit._id,
        date: dateStr,
        status: manualStatus,
        totalMinutes: manualHours * 60,
        isManual: true
      };

      await attendanceService.updateAttendance(selectedStaffForEdit.attendance?._id || "new", payload);

      toast.success("Manual update saved");
      setIsEditTimeModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }
    try {
      await staffService.updateStaff(selectedStaffId, {
        ...newStaffConfig,
        trackAttendance: true,
        config: globalConfig
      });
      toast.success("Staff added to attendance tracking");
      setIsAddStaffModalOpen(false);
      setSelectedStaffId("");
      setNewStaffConfig({
        payoutType: "Monthly",
        salaryAmount: 0,
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to add staff");
    }
  };

  const handleSaveOvertime = async () => {
    if (!selectedStaffForOT) return;
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const amount = otType === "hourly" ? (otHours + otMins / 60) * otRate : otFixedAmount;

      const payload = {
        user: selectedStaffForOT._id,
        date: dateStr,
        overtime: {
          type: otType,
          hours: otType === "hourly" ? (otHours + otMins / 60) : 0,
          rate: otType === "hourly" ? otRate : 0,
          amount: amount
        },
        status: selectedStaffForOT.attendance?.status || "Present"
      };

      await attendanceService.updateAttendance(selectedStaffForOT.attendance?._id || "new", payload);
      toast.success("Overtime saved");
      setIsOvertimeModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save overtime");
    }
  };

  const calculateBalance = (staff: StaffAttendance) => {
    let balance = 0;
    
    // Last month due
    balance += (staff.lastMonthDue || 0);

    if (viewMode === "monthly") {
      if (staff.monthlyStats) {
        balance += staff.monthlyStats.calculatedSalary;
        balance += staff.monthlyStats.overtimeAmount;
      }
    } else {
      const dailyRate = staff.payoutType === "Daily" ? staff.salaryAmount : (staff.salaryAmount / (staff.config?.daysPerMonth || 26));
      // Current attendance calculation
      if (staff.attendance) {
        if (staff.attendance.isManual) {
          if (staff.attendance.status === "Present") balance += dailyRate;
          else if (staff.attendance.status === "Half Day") balance += (dailyRate / 2);
        } else {
          const totalMins = calculateTotalDisplayMinutes(staff.attendance);
          const workedHours = totalMins / 60;
          const standardHours = staff.config?.hoursPerDay || 8;
          
          if (workedHours >= standardHours) {
            balance += dailyRate;
          } else if (workedHours >= (standardHours / 2)) {
            balance += (dailyRate / 2);
          } else if (workedHours > 0) {
            balance += (workedHours / standardHours) * dailyRate;
          }
        }

        if (staff.attendance.overtime?.amount) {
          balance += staff.attendance.overtime.amount;
        }
      }
    }

    return balance;
  };

  const handleClearDues = async (staffId: string) => {
    if (!confirm("Are you sure you want to clear all dues for this staff member? This will set Last Month Due to 0.")) return;
    try {
      await staffService.updateStaff(staffId, { lastMonthDue: 0 });
      toast.success("Dues cleared successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to clear dues");
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  );

  const myTotalMinutes = myAttendance.reduce((sum, record) => sum + (record.totalMinutes || 0), 0);
  const myPresentDays = myAttendance.filter(r => r.status === "Present").length;
  const myHalfDays = myAttendance.filter(r => r.status === "Half Day").length;

  const counts = {
    P: staffList.filter(s => s.attendance?.status === "Present").length,
    A: staffList.filter(s => !s.attendance || s.attendance.status === "Absent").length,
    HD: staffList.filter(s => s.attendance?.status === "Half Day").length,
    L: staffList.filter(s => s.attendance?.status === "Leave").length,
    WO: staffList.filter(s => s.attendance?.status === "Weekly Off").length,
  };

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      toast.success("Checked in successfully");
      fetchData();
      window.dispatchEvent(new Event("attendance_updated"));
    } catch { toast.error("Failed to check in"); }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      toast.success("Checked out successfully");
      fetchData();
      window.dispatchEvent(new Event("attendance_updated"));
    } catch { toast.error("Failed to check out"); }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-6">
        <div className="max-w-[1000px] mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">My Attendance</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">View your monthly work history</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-3 min-w-[140px] text-center">
                  {currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </span>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {myStatus?.logs?.length > 0 && !myStatus.logs[myStatus.logs.length - 1]?.checkOut ? (
                <Button size="sm" onClick={handleCheckOut} className="bg-rose-600 hover:bg-rose-700 text-white gap-2 h-9">
                  <CheckCircle2 className="w-4 h-4" />
                  Check Out
                </Button>
              ) : (
                <Button size="sm" onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9">
                  <Clock className="w-4 h-4" />
                  Check In
                </Button>
              )}
            </div>
          </div>

          {myStatus?.logs?.length > 0 && !myStatus.logs[myStatus.logs.length - 1]?.checkOut && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700">
                Currently checked in since {new Date(myStatus.logs[myStatus.logs.length - 1].checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-indigo-600 font-mono">
                {Math.floor(myTotalMinutes / 60)}h {myTotalMinutes % 60}m
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Hours This Month</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-emerald-600">
                {myPresentDays}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Days Present</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-amber-600">
                {myHalfDays}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Half Days</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Attendance Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-In/Out Logs</TableHead>
                    <TableHead>Total Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
                  ) : myAttendance.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No records found for this month</TableCell></TableRow>
                  ) : myAttendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="text-xs font-bold text-slate-900">
                        {new Date(record.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5",
                          record.status === "Present" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            record.status === "Absent" ? "bg-rose-50 text-rose-700 border-rose-100" :
                              record.status === "Half Day" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-slate-50 text-slate-700 border-slate-100"
                        )}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {record.logs?.length > 0 ? record.logs.map((log: any, idx: number) => (
                            <div key={idx} className="text-[10px] font-medium font-mono">
                              <span className="text-emerald-600">{new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              <span className="text-slate-400 mx-1">→</span>
                              <span className="text-rose-500">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Ongoing"}</span>
                            </div>
                          )) : <span className="text-[10px] text-slate-400">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 font-mono">
                        {Math.floor((record.totalMinutes || 0) / 60)}h {(record.totalMinutes || 0) % 60}m
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-6">
      <div className="max-w-[1400px] mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Attendance System</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Office Staff Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <button onClick={() => {
              if (viewMode === "monthly") {
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
              } else {
                setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
              }
            }}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-3 min-w-[140px] text-center">
              {viewMode === "monthly" 
                ? currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) 
                : formatDate(currentDate)}
            </span>
            <button onClick={() => {
              if (viewMode === "monthly") {
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
              } else {
                setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
              }
            }}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 mr-2">
                <button
                  onClick={() => setViewMode("daily")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded transition-all", viewMode === "daily" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode("monthly")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded transition-all", viewMode === "monthly" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
                >
                  Monthly
                </button>
              </div>
            )}
            {isAdmin && (
              <Button size="sm" variant="outline" className="text-xs h-9" onClick={() => setIsSettingsModalOpen(true)}>
                Settings
              </Button>
            )}
            {canCreate && (
              <Button size="sm" className="text-xs h-9 gap-2" onClick={() => setIsAddStaffModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Office Staff
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Present", count: counts.P, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Absent", count: counts.A, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
            { label: "Half Day", count: counts.HD, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Leave", count: counts.L, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Weekly Off", count: counts.WO, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
          ].map((stat) => (
            <div key={stat.label} className={cn("bg-white p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center", stat.border)}>
              <span className={cn("text-xl font-bold", stat.color)}>{stat.count}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-slate-100 bg-slate-50/30 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Office Staff Attendance</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Staff Member</TableHead>
                  <TableHead>Payout Type</TableHead>
                  {viewMode === "daily" ? (
                    <>
                      <TableHead>Today's Status</TableHead>
                      <TableHead>Time Logged</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Attendance Stats</TableHead>
                      <TableHead>Overtime</TableHead>
                    </>
                  )}
                  <TableHead>Last Month Due</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
                ) : filteredStaff.map((staff) => (
                  <TableRow key={staff._id} className="group hover:bg-slate-50/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{staff.name}</span>
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{staff.role?.name || "Staff"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5",
                          staff.payoutType === "Monthly" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            staff.payoutType === "Daily" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-emerald-50 text-emerald-700 border-emerald-100"
                        )}>
                          {staff.payoutType || "Monthly"}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-500">
                          ₹{(staff.salaryAmount || 0).toLocaleString()} / {staff.payoutType === "Daily" ? "Day" : staff.payoutType === "Hourly" ? "Hr" : "Mo"}
                        </span>
                      </div>
                    </TableCell>
                    {viewMode === "daily" ? (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {["Present", "Absent", "Half Day", "Leave", "Weekly Off"].map((status) => (
                              <button
                                key={status}
                                disabled={!isAdmin}
                                onClick={() => handleStatusChange(staff._id, status as AttendanceStatus)}
                                className={cn(
                                  "px-2 py-1 rounded-md text-[9px] font-black transition-all border shadow-sm",
                                  (staff.attendance?.status || (status === "Absent" && !staff.attendance ? "Absent" : null)) === status
                                    ? (status === "Present" ? "bg-emerald-600 border-emerald-600 text-white" :
                                      status === "Absent" ? "bg-rose-600 border-rose-600 text-white" :
                                        status === "Half Day" ? "bg-amber-500 border-amber-500 text-white" :
                                          status === "Leave" ? "bg-blue-600 border-blue-600 text-white" :
                                            "bg-slate-600 border-slate-600 text-white")
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                                )}
                              >
                                {status[0]}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {(() => {
                                const totalMins = calculateTotalDisplayMinutes(staff.attendance);
                                return totalMins > 0 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : "0h 0m";
                              })()}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedStaffForSessions(staff);
                                setIsViewSessionsModalOpen(true);
                              }}
                              className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline uppercase tracking-tighter"
                            >
                              {staff.attendance?.logs?.length || 0} Sessions (View)
                            </button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">P: {staff.monthlyStats?.present || 0}</span>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">A: {staff.monthlyStats?.absent || 0}</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">HD: {staff.monthlyStats?.halfDay || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-900">₹{(staff.monthlyStats?.overtimeAmount || 0).toLocaleString()}</span>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-900">₹{(staff.lastMonthDue || 0).toLocaleString()}</span>
                        {isAdmin && staff.lastMonthDue > 0 && (
                          <button
                            onClick={() => handleClearDues(staff._id)}
                            className="text-[8px] font-black text-rose-500 uppercase tracking-tighter hover:underline text-left"
                          >
                            Clear Dues
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-indigo-600">₹{calculateBalance(staff).toLocaleString()}</span>
                        {calculateBalance(staff) > 0 && <span className="text-emerald-500 text-[10px]">↑</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedStaffForSlip(staff);
                              setIsSalarySlipModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                            title="Salary Slip"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedStaffForOT(staff);
                                const dailyRate = staff.payoutType === "Daily" ? staff.salaryAmount : (staff.salaryAmount / (staff.config?.daysPerMonth || 26));
                                setOtRate(staff.payoutType === "Hourly" ? staff.salaryAmount : (dailyRate / (staff.config?.hoursPerDay || 8)));
                                setIsOvertimeModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                              title="Add Overtime"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStaffForEdit(staff);
                                setManualHours(staff.attendance?.totalMinutes ? Number((staff.attendance.totalMinutes / 60).toFixed(1)) : (staff.config?.hoursPerDay || 8));
                                setManualStatus(staff.attendance?.status || "Present");
                                setIsEditTimeModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                              title="Manual Update"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredStaff.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No office staff found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Add Staff to Attendance"
        className="max-w-md"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Office Staff</label>
              <select
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                required
              >
                <option value="">Choose a member...</option>
                {untrackedStaff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role?.name})</option>
                ))}
              </select>
              {untrackedStaff.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">No more office staff to add</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payout Type</label>
                <select
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20"
                  value={newStaffConfig.payoutType}
                  onChange={(e) => setNewStaffConfig({ ...newStaffConfig, payoutType: e.target.value as SalaryPayoutType })}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Daily">Daily</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Salary/Rate (₹)</label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newStaffConfig.salaryAmount}
                  onChange={(e) => setNewStaffConfig({ ...newStaffConfig, salaryAmount: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!selectedStaffId}>Enable Tracking</Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Attendance Settings"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Standard Working Hours</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Hours per Full Day</label>
              <Input
                type="number"
                value={globalConfig.hoursPerDay}
                onChange={(e) => setGlobalConfig({ ...globalConfig, hoursPerDay: Number(e.target.value) })}
              />
              <p className="text-[10px] text-slate-400">Used for "Present" status calculation (default: 8)</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Working Days per Month</label>
              <Input
                type="number"
                value={globalConfig.daysPerMonth}
                onChange={(e) => setGlobalConfig({ ...globalConfig, daysPerMonth: Number(e.target.value) })}
              />
              <p className="text-[10px] text-slate-400">Used for monthly salary calculation (default: 26)</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => {
              toast.success("Settings saved for new staff");
              setIsSettingsModalOpen(false);
            }}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Sessions Modal */}
      <Modal
        isOpen={isViewSessionsModalOpen}
        onClose={() => setIsViewSessionsModalOpen(false)}
        title={`${selectedStaffForSessions?.name?.split(' ')[0]}'s Sessions`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-100/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Session Logs for {formatDate(currentDate)}</h3>
            </div>
            <div className="p-3 space-y-2">
              {selectedStaffForSessions?.attendance?.logs?.length ? (
                selectedStaffForSessions.attendance.logs.map((log: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-md shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Check In</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">
                        {new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="w-8 h-px bg-slate-200" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Check Out</span>
                      <span className={cn("text-sm font-bold font-mono", log.checkOut ? "text-rose-500" : "text-amber-500 animate-pulse")}>
                        {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Ongoing"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No sessions logged
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsViewSessionsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Overtime Modal */}
      <Modal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        title="Add Overtime"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-emerald-600 border border-emerald-200">
                {selectedStaffForOT?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedStaffForOT?.name}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{formatDate(currentDate)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Overtime Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="otType" checked={otType === "hourly"} onChange={() => setOtType("hourly")} />
                  <span className="text-xs font-medium text-slate-700">Hourly Rate</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="otType" checked={otType === "fixed"} onChange={() => setOtType("fixed")} />
                  <span className="text-xs font-medium text-slate-700">Fixed Amount</span>
                </label>
              </div>
            </div>

            {otType === "hourly" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Duration (HH:MM)</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Hrs" value={otHours} onChange={(e) => setOtHours(Number(e.target.value))} />
                    <span className="text-xs font-bold">:</span>
                    <Input type="number" placeholder="Min" value={otMins} onChange={(e) => setOtMins(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rate (₹/hr)</label>
                  <Input type="number" value={otRate} onChange={(e) => setOtRate(Number(e.target.value))} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Total Fixed Amount (₹)</label>
                <Input type="number" placeholder="Enter Amount" value={otFixedAmount} onChange={(e) => setOtFixedAmount(Number(e.target.value))} />
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Total OT Amount</span>
                <span className="text-lg font-black text-indigo-600">
                  ₹{otType === "hourly" ? ((otHours + otMins / 60) * otRate).toLocaleString() : otFixedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOvertimeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveOvertime} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Overtime
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Update Modal */}
      <Modal
        isOpen={isEditTimeModalOpen}
        onClose={() => setIsEditTimeModalOpen(false)}
        title="Manual Attendance Update"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200">
              {selectedStaffForEdit?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedStaffForEdit?.name}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedStaffForEdit?.role?.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Attendance Status</label>
              <select
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm"
                value={manualStatus || "Present"}
                onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
                <option value="Weekly Off">Weekly Off</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Work Hours</label>
              <Input
                type="number"
                step="0.5"
                value={manualHours}
                onChange={(e) => setManualHours(Number(e.target.value))}
              />
              <p className="text-[10px] text-slate-400">Specify total hours worked for this day</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditTimeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleManualUpdate} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Salary Slip Modal */}
      <Modal
        isOpen={isSalarySlipModalOpen}
        onClose={() => setIsSalarySlipModalOpen(false)}
        title="Staff Salary Slip"
        className="max-w-2xl"
      >
        {selectedStaffForSlip && (
          <div className="space-y-8 p-2">
            {/* Slip Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">ARCHISITE PRO</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Architecture & Interior Design</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className="border-slate-900 text-slate-900 font-black px-4 py-1">SALARY SLIP</Badge>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{formatDate(currentDate)}</p>
              </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Employee Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name</span>
                    <span className="font-bold text-slate-900">{selectedStaffForSlip.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Role</span>
                    <span className="font-bold text-indigo-600">{selectedStaffForSlip.role?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payout Type</span>
                    <span className="font-bold text-slate-900">{selectedStaffForSlip.payoutType}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Attendance Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600">{selectedStaffForSlip.attendance?.status || "Absent"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Work Hours</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedStaffForSlip.attendance?.totalMinutes ? `${Math.floor(selectedStaffForSlip.attendance.totalMinutes / 60)}h ${selectedStaffForSlip.attendance.totalMinutes % 60}m` : "0h"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Table */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Calculation</h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100/50">
                      <TableHead className="text-[10px] font-black">Description</TableHead>
                      <TableHead className="text-right text-[10px] font-black">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Last Month Outstanding Dues</TableCell>
                      <TableCell className="text-right text-sm font-bold">₹{(selectedStaffForSlip.lastMonthDue || 0).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">
                        Today's Earnings
                        <span className="text-[10px] text-slate-400 ml-2">({selectedStaffForSlip.attendance?.status || "N/A"})</span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold">
                        ₹{(
                          selectedStaffForSlip.attendance?.status === "Present"
                            ? (selectedStaffForSlip.payoutType === "Daily" ? selectedStaffForSlip.salaryAmount : (selectedStaffForSlip.salaryAmount / (selectedStaffForSlip.config?.daysPerMonth || 26)))
                            : selectedStaffForSlip.attendance?.status === "Half Day"
                              ? ((selectedStaffForSlip.payoutType === "Daily" ? selectedStaffForSlip.salaryAmount : (selectedStaffForSlip.salaryAmount / (selectedStaffForSlip.config?.daysPerMonth || 26))) / 2)
                              : 0
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    {(selectedStaffForSlip.attendance?.overtime?.amount || 0) > 0 && (
                      <TableRow>
                        <TableCell className="text-sm font-medium">
                          Overtime
                          <span className="text-[10px] text-emerald-500 ml-2">
                            ({selectedStaffForSlip.attendance.overtime.type === 'hourly' ? `${selectedStaffForSlip.attendance.overtime.hours.toFixed(1)} hrs` : 'Fixed'})
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-emerald-600">+ ₹{selectedStaffForSlip.attendance.overtime.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-indigo-50/50">
                      <TableCell className="text-sm font-black text-indigo-600">Total Balance Payable</TableCell>
                      <TableCell className="text-right text-base font-black text-indigo-600">₹{calculateBalance(selectedStaffForSlip).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-12">
              <div className="space-y-4">
                <div className="w-32 h-px bg-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Signature</p>
              </div>
              <div className="text-right space-y-4">
                <div className="w-32 h-px bg-slate-300 ml-auto" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t no-print">
              <Button variant="outline" onClick={() => setIsSalarySlipModalOpen(false)}>Close</Button>
              <Button onClick={() => window.print()} className="gap-2">
                <FileText className="w-4 h-4" />
                Print Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
