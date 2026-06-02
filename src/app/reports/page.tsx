"use client";

import { projects } from "@/lib/dummy-data";
import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download, 
  Filter, 
  ChevronRight,
  PieChart,
  Target,
  ArrowUpRight,
  Calendar,
  FileText,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function ReportsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
      alert("Report exported successfully!");
    }, 2000);
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Insights into project progress, worker productivity, and finances</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="white" className="gap-2 hidden sm:flex">
              <Filter className="w-5 h-5" />
              Filter Data
            </Button>
            <Button 
              onClick={() => setIsExportModalOpen(true)} 
              className="gap-2 shadow-lg shadow-indigo-200"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Completion Rate", value: "84%", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Workers", value: "32", icon: Users, color: "text-green-600", bg: "bg-green-50" },
            { label: "Revenue Growth", value: "+12.5%", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Reports Generated", value: "156", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className={cn("p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Project Efficiency Over Time</h3>
              <div className="flex items-center gap-4 text-sm font-bold">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full" /> Modern Villa</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-full" /> City Heights</span>
              </div>
            </div>
            
            <div className="h-80 flex items-end gap-10 px-4 relative">
              <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between opacity-10 pointer-events-none">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full border-t border-slate-900" />)}
              </div>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, idx) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full flex justify-center items-end gap-1 flex-1">
                    <div 
                      className="w-4 bg-indigo-600 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-700 shadow-lg shadow-indigo-100" 
                      style={{ height: `${20 + idx * 10}%` }} 
                    />
                    <div 
                      className="w-4 bg-blue-400 rounded-t-lg transition-all duration-1000 group-hover:bg-blue-500 shadow-lg shadow-blue-100" 
                      style={{ height: `${15 + idx * 8}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Project Summary</h3>
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">{project.name}</p>
                    <span className="text-xs font-bold text-indigo-600">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2 group">
              Full Detailed Audit
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        title="Export Project Report"
      >
        <form className="space-y-6" onSubmit={handleExport}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600">Select report type and date range to export.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Report Type</label>
              <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option>Project Progress Summary</option>
                <option>Financial Statement</option>
                <option>Worker Attendance Report</option>
                <option>Material Usage Log</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">From</label>
                <Input type="date" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">To</label>
                <Input type="date" required />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Format: PDF (Professional Layout)</p>
                <p className="text-[10px] font-medium text-indigo-500">Includes charts and project photos</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isExporting} className="min-w-[120px]">
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </div>
              ) : (
                "Generate PDF"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
