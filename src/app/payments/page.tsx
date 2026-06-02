"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { useAuth } from "@/lib/auth-context";
import { usePayments, PaymentStatus } from "@/lib/payments-store";
import { useProjects } from "@/lib/projects-store";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { payments, createPayment, deletePayment } = usePayments();
  const { projects } = useProjects();

  const isAdmin = user?.role === "architect" || user?.role === "director" || user?.role === "accountant";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const [form, setForm] = useState({
    projectId: "",
    milestone: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    status: "Pending" as PaymentStatus,
    notes: ""
  });

  const stats = useMemo(() => {
    // Total budget from all projects
    const totalBudget = projects.reduce((acc, p) => {
      const val = typeof p.budget === 'number' ? p.budget : Number(String(p.budget).replace(/[^0-9.-]+/g, "")) || 0;
      return acc + val;
    }, 0);

    // Total received from all projects
    const totalReceived = projects.reduce((acc, p) => {
      const val = typeof p.received === 'number' ? p.received : Number(String(p.received).replace(/[^0-9.-]+/g, "")) || 0;
      return acc + val;
    }, 0);

    // Total pending from all projects
    const totalPending = projects.reduce((acc, p) => {
      const val = typeof p.pending === 'number' ? p.pending : Number(String(p.pending).replace(/[^0-9.-]+/g, "")) || 0;
      return acc + val;
    }, 0);
    
    return {
      total: `$${totalBudget.toLocaleString()}`,
      received: `$${totalReceived.toLocaleString()}`,
      pending: `$${totalPending.toLocaleString()}`
    };
  }, [projects]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.milestone?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = projectFilter === "all" || p.projectId === projectFilter;
      
      return matchesSearch && matchesProject;
    });
  }, [payments, searchQuery, projectFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.amount || !form.milestone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedProject = projects.find(p => p.id === form.projectId);
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      await createPayment({
        projectId: form.projectId,
        project: selectedProject.id, // Send ID for backend populate
        clientId: selectedProject.clientId || "",
        client: selectedProject.clientId || "", // Send ID for backend populate
        milestone: form.milestone,
        amount: Number(form.amount),
        date: form.date,
        status: form.status,
        notes: form.notes
      });
      toast.success("Payment recorded successfully");
      setIsAddModalOpen(false);
      setForm({
        projectId: "",
        milestone: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        status: "Pending",
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete);
      toast.success("Payment deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Budget & Payment Tracking</p>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              size="sm"
              className="gap-2 shadow-md shadow-indigo-100 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Payment</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Portfolio Budget", value: stats.total, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total Received", value: stats.received, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Total Pending", value: stats.pending, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search payments..." 
              className="pl-9 h-9 text-xs border-none bg-transparent focus:ring-0 shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-2">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                className="bg-transparent text-[10px] font-bold text-slate-600 uppercase tracking-widest focus:outline-none cursor-pointer"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredPayments.length} Records</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Project / Client</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                <TableHead className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="group hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{payment.project}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{payment.client}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-900">${payment.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest",
                      payment.status === "Paid" ? "bg-green-50 text-green-700 border-green-100" :
                      payment.status === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                      "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{payment.date}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <button 
                          onClick={() => {
                            setPaymentToDelete(payment.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-medium">No payment records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Payment"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Select
              label="Select Project"
              options={projects.map(p => ({ value: p.id, label: p.name, description: p.client }))}
              value={form.projectId}
              onChange={(val) => setForm({ ...form, projectId: val })}
              placeholder="Choose a project..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Milestone / Description</label>
              <Input 
                placeholder="e.g., Advance Payment" 
                value={form.milestone}
                onChange={(e) => setForm({ ...form, milestone: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Amount ($)</label>
              <Input 
                type="number"
                placeholder="e.g., 10000" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Payment Date</label>
              <Input 
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Notes (Optional)</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
              placeholder="Additional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? This action cannot be undone."
      />
    </>
  );
}
