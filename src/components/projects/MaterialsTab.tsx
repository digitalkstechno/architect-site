import { useState, useEffect } from "react";
import { Plus, Package, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { materialService, MaterialRequest } from "@/services/material.service";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export function MaterialsTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialName: "",
    quantity: 1,
    unit: "units",
    status: "Pending",
    dateNeeded: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await materialService.getRequestsByProject(projectId);
      setRequests(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await materialService.updateRequest(editingId, formData);
        toast.success("Updated");
      } else {
        await materialService.createRequest({
          ...formData,
          project: projectId,
          requestedBy: user?.id
        });
        toast.success("Material requested");
      }
      setIsModalOpen(false);
      setFormData({ materialName: "", quantity: 1, unit: "units", status: "Pending", dateNeeded: new Date().toISOString().split('T')[0], notes: "" });
      setEditingId(null);
      fetchRequests();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await materialService.deleteRequest(id);
      toast.success("Deleted");
      fetchRequests();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (req: MaterialRequest) => {
    setFormData({
      materialName: req.materialName,
      quantity: req.quantity,
      unit: req.unit,
      status: req.status,
      dateNeeded: (req as any).dateNeeded || new Date().toISOString().split('T')[0],
      notes: (req as any).notes || ""
    });
    setEditingId(req._id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Request Material
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
            <tr>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Requested By</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Date Needed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map(req => (
              <tr key={req._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    {req.materialName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal pl-6">{req.notes}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">{req.requestedBy?.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-slate-600">{req.quantity} {req.unit}</td>
                <td className="px-4 py-3 text-slate-600">{(req as any).dateNeeded || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    req.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    req.status === 'Ordered' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'Approved' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(req)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(req._id)} className="p-1 text-slate-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No material requests found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Request" : "New Request"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold">Material Name</label><Input value={formData.materialName} onChange={e => setFormData({...formData, materialName: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold">Quantity</label><Input type="number" value={formData.quantity.toString()} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required /></div>
            <div><label className="text-xs font-bold">Unit</label><Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required /></div>
          </div>
          <div><label className="text-xs font-bold">Date Needed</label><Input type="date" value={formData.dateNeeded} onChange={e => setFormData({...formData, dateNeeded: e.target.value})} /></div>
          {editingId && (
            <div>
              <label className="text-xs font-bold">Status</label>
              <Select value={formData.status} onChange={v => setFormData({...formData, status: v})} options={[
                {value: "Pending", label: "Pending"},
                {value: "Approved", label: "Approved"},
                {value: "Ordered", label: "Ordered"},
                {value: "Delivered", label: "Delivered"},
              ]} />
            </div>
          )}
          <div><label className="text-xs font-bold">Notes</label><Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Material Request"
        message="Are you sure you want to delete this material request? This action cannot be undone."
      />
    </div>
  );
}
