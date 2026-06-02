"use client";

import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Plus,
  PenTool,
  Trash2,
  FileText,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { usePayments, PaymentStatus } from "@/lib/payments-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import toast from "react-hot-toast";

export default function ClientDetailsPage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;
  const { user } = useAuth();
  const { projects } = useProjects();
  const { payments, createPayment, deletePayment, updatePayment } = usePayments();

  const [client, setClient] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const [paymentForm, setPaymentForm] = useState({
    projectId: "",
    milestone: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    status: "Pending" as PaymentStatus,
    notes: ""
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await staffService.getStaffById(id);
        setClient(data);
      } catch (error) {
        console.error("Failed to fetch client", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchClient();
  }, [id]);

  const isAdmin = user?.role === "architect" || user?.role === "director" || user?.role === "accountant";
  
  const clientProjects = projects.filter(p => p.clientId === id);
  const clientPayments = payments.filter(p => p.clientId === id);

  const stats = (() => {
    const totalBudget = clientProjects.reduce((sum, p) => {
      const val = typeof p.budget === 'number' ? p.budget : Number(String(p.budget).replace(/[^0-9.-]+/g, "")) || 0;
      return sum + val;
    }, 0);
    const received = clientPayments.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.amount, 0);
    const pending = Math.max(0, totalBudget - received);
    const utilization = totalBudget > 0 ? Math.min(100, Math.round((received / totalBudget) * 100)) : 0;

    return { totalBudget, received, pending, utilization };
  })();

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.projectId || !paymentForm.milestone || !paymentForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedProject = projects.find(p => p.id === paymentForm.projectId);
    if (!selectedProject) return;

    setIsSubmittingPayment(true);
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          projectId: paymentForm.projectId,
          milestone: paymentForm.milestone,
          amount: Number(paymentForm.amount),
          date: paymentForm.date,
          status: paymentForm.status,
          notes: paymentForm.notes
        });
        toast.success("Payment updated successfully");
      } else {
        await createPayment({
          projectId: paymentForm.projectId,
          project: paymentForm.projectId,
          clientId: id,
          client: id,
          milestone: paymentForm.milestone,
          amount: Number(paymentForm.amount),
          date: paymentForm.date,
          status: paymentForm.status,
          notes: paymentForm.notes
        });
        toast.success("Payment recorded successfully");
      }
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
      setPaymentForm({
        projectId: "",
        milestone: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        status: "Pending",
        notes: ""
      });
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete);
      toast.success("Payment record deleted");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete record");
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (!client) return <div className="p-20 text-center"><h2 className="text-xl font-bold">Client not found</h2><Link href="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Portfolio</Link></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors group uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Portfolio
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100 shadow-sm">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{client.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-mono">{client.phone || "N/A"}</span>
                </span>
                <Badge className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  stats.pending === 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                  {stats.pending === 0 ? "Account Settled" : "Payment Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Button 
            onClick={() => setIsPaymentModalOpen(true)}
            size="sm"
            className="gap-2 shadow-md shadow-indigo-100 font-bold text-xs bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Active Projects</h3>
          <div className="space-y-3">
            {clientProjects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="block">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                      <Building2 className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 uppercase font-bold tracking-tight">
                    <MapPin className="w-2.5 h-2.5" /> {p.location}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-indigo-600" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {clientProjects.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Finance Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
              <div className="bg-green-50 p-2 rounded-xl w-fit mb-1 border border-green-100">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Received</p>
              <p className="text-xl font-black text-slate-900 tracking-tight font-mono">${stats.received.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
              <div className="bg-orange-50 p-2 rounded-xl w-fit mb-1 border border-orange-100">
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pending</p>
              <p className="text-xl font-black text-slate-900 tracking-tight font-mono">${stats.pending.toLocaleString()}</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg flex items-center justify-between group cursor-pointer overflow-hidden relative border border-indigo-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 space-y-1">
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Portfolio Budget</p>
                <p className="text-xl font-black text-white tracking-tight font-mono">${stats.totalBudget.toLocaleString()}</p>
                <div className="w-24 h-1.5 bg-indigo-400/50 rounded-full mt-2 overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${stats.utilization}%` }} />
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-white/50 relative z-10" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction History</h3>
              <FileText className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Milestone / Project</TableHead>
                  <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                  <TableHead className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50">
                {clientPayments.map((payment) => (
                  <TableRow key={payment.id} className="group hover:bg-slate-50/30 transition-all">
                    <TableCell className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900">{payment.milestone}</p>
                      <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tight mt-0.5">{payment.project}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900 font-mono">${payment.amount.toLocaleString()}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm",
                        payment.status === "Paid" ? "bg-green-50 text-green-700 border-green-100" : 
                        payment.status === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{payment.date}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => {
                                setEditingPayment(payment);
                                setPaymentForm({
                                  projectId: payment.projectId,
                                  milestone: payment.milestone,
                                  amount: String(payment.amount),
                                  date: payment.date,
                                  status: payment.status,
                                  notes: payment.notes || ""
                                });
                                setIsPaymentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                setPaymentToDelete(payment.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clientPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="w-8 h-8 text-slate-100" />
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No payment records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? "Edit Payment Record" : "Record New Payment"}
      >
        <form onSubmit={handleAddPayment} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Project</label>
            <Select
              options={clientProjects.map(p => ({ value: p.id, label: p.name }))}
              value={paymentForm.projectId}
              onChange={(val) => setPaymentForm({ ...paymentForm, projectId: val })}
              placeholder="Choose a project..."
              disabled={!!editingPayment}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Milestone Name</label>
              <Input 
                placeholder="e.g., Slab Completion" 
                value={paymentForm.milestone}
                onChange={e => setPaymentForm({...paymentForm, milestone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
              <Input 
                type="number" 
                placeholder="5000" 
                value={paymentForm.amount}
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
              <Input 
                type="date" 
                value={paymentForm.date}
                onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                value={paymentForm.status}
                onChange={e => setPaymentForm({...paymentForm, status: e.target.value as PaymentStatus})}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] font-medium"
              placeholder="Details about this transaction..."
              value={paymentForm.notes}
              onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <Button variant="ghost" type="button" onClick={() => {
              setIsPaymentModalOpen(false);
              setEditingPayment(null);
            }}>Cancel</Button>
            <Button type="submit" isLoading={isSubmittingPayment} className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-100 px-8">
              {editingPayment ? "Update Payment" : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeletePayment}
        isLoading={isDeleting}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? This will also update the project's financial balance."
      />
    </div>
  );
}
