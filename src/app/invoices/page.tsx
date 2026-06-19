"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Trash2, Edit2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { invoiceService, Invoice } from "@/services/invoice.service";
import { projectService } from "@/services/project.service";
import { staffService } from "@/services/staff.service";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/use-permissions";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    project: "",
    client: "",
    invoiceNumber: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    status: "Draft",
    notes: ""
  });

  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0, amount: 0 }]);

  const { canCreate, canEdit, canDelete } = usePermissions("invoices");

  const fetchData = async () => {
    try {
      const [invData, projData, staffData] = await Promise.all([
        invoiceService.getAllInvoices(),
        projectService.getAllProjects(),
        staffService.getAllStaff()
      ]);
      setInvoices(invData || []);
      setProjects(projData || []);
      const clientStaff = (staffData || []).filter((s: any) => 
        s.role === 'client' || 
        s.role?.name?.toLowerCase() === 'client' || 
        s.role?._id === 'client'
      );
      setClients(clientStaff);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      item.amount = item.quantity * item.rate;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0; // Configurable later
    const total = subtotal + tax;

    try {
      if (editingId) {
        await invoiceService.updateInvoice(editingId, { ...formData, items, subtotal, tax, total });
        toast.success("Invoice updated");
      } else {
        await invoiceService.createInvoice({ ...formData, items, subtotal, tax, total });
        toast.success("Invoice created");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await invoiceService.deleteInvoice(id);
      toast.success("Deleted");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      project: "", client: "", invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0], dueDate: "", status: "Draft", notes: ""
    });
    setItems([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (inv: Invoice) => {
    setFormData({
      project: inv.project?._id || inv.project,
      client: inv.client?._id || inv.client,
      invoiceNumber: inv.invoiceNumber,
      date: inv.date,
      dueDate: inv.dueDate || "",
      status: inv.status,
      notes: inv.notes || ""
    });
    setItems(inv.items);
    setEditingId(inv._id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Invoices</h2>
        {canCreate && <Button onClick={openNew} size="sm" className="gap-2"><Plus className="w-4 h-4"/> Create Invoice</Button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-indigo-600">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{inv.client?.name || 'Unknown'}</td>
                <td className="px-4 py-3">{inv.project?.name || 'Unknown'}</td>
                <td className="px-4 py-3">{inv.date}</td>
                <td className="px-4 py-3 font-bold">₹{inv.total.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {canEdit && <button onClick={() => openEdit(inv)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>}
                  {canDelete && <button onClick={() => setDeleteId(inv._id)} className="p-1 text-slate-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Invoice" : "New Invoice"}>
        <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold">Client</label>
              <Select value={formData.client} onChange={v => setFormData({...formData, client: v})} options={clients.map(c => ({value: c._id || c.id, label: c.name}))} />
            </div>
            <div>
              <label className="text-xs font-bold">Project</label>
              <Select value={formData.project} onChange={v => setFormData({...formData, project: v})} options={projects.map(p => ({value: p._id || p.id, label: p.name}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold">Invoice Number</label><Input value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} required /></div>
            <div><label className="text-xs font-bold">Status</label><Select value={formData.status} onChange={v => setFormData({...formData, status: v})} options={[{value:"Draft",label:"Draft"},{value:"Sent",label:"Sent"},{value:"Paid",label:"Paid"},{value:"Overdue",label:"Overdue"}]} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold">Date</label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
            <div><label className="text-xs font-bold">Due Date</label><Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <h4 className="text-sm font-bold mb-2">Line Items</h4>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end mb-2">
                <div className="flex-1"><Input placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} required /></div>
                <div className="w-20"><Input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} required /></div>
                <div className="w-24"><Input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(idx, 'rate', Number(e.target.value))} required /></div>
                <div className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-right font-mono">₹{item.amount}</div>
                <Button type="button" variant="danger" size="sm" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addItem} className="mt-2"><Plus className="w-3 h-3 mr-1"/> Add Item</Button>
          </div>
          
          <div className="border-t border-slate-200 pt-4 text-right">
            <div className="text-sm">Subtotal: <span className="font-mono">₹{items.reduce((s,i)=>s+i.amount,0)}</span></div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Invoice</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
      />
    </div>
  );
}
