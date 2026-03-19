
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, Trash2, Pencil, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { CrudResource, saFetch } from "@/lib/superadmin-api";

function extractId(row: any): string | null {
  return (
    row?.id ??
    row?._id ??
    row?.uuid ??
    row?.tenantId ??
    row?.userId ??
    row?.roleId ??
    row?.permissionId ??
    null
  );
}

function normalizeList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray((payload as any).rows)) return (payload as any).rows;
    if (Array.isArray((payload as any).items)) return (payload as any).items;
    if (Array.isArray((payload as any).data)) return (payload as any).data;
  }
  return [];
}

export default function CrudResourcePage({ resource }: { resource: CrudResource }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewJson, setViewJson] = useState<string>("{}");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, search]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await saFetch<any>(resource.basePath, { method: "GET" });
      setRows(normalizeList(payload));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.basePath]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case "boolean":
        return (
          <div key={field.name} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => handleInputChange(field.name, !formData[field.name])}
              className={cn(
                "w-10 h-6 rounded-full transition-all relative",
                formData[field.name] ? "bg-indigo-600" : "bg-slate-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                formData[field.name] ? "left-5" : "left-1"
              )} />
            </button>
            <label className="text-sm font-bold text-slate-700">{field.label}</label>
          </div>
        );
      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
            <select
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
            <Input
              type="number"
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
              required={field.required}
            />
          </div>
        );
      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{resource.label}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">API: <span className="font-mono text-xs">{resource.basePath}</span></p>
        </div>
        <div className="flex gap-3 items-center">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button variant="outline" onClick={load} className="gap-2" disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
          {resource.canCreate && (
            <Button onClick={() => { setFormData({}); setIsCreateOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-6 border border-red-100 bg-red-50">
          <div className="flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold">Request failed</p>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden border-slate-100">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">{filtered.length} record(s) found</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loading ? "Updating..." : "System Sync Active"}</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Identifier</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((row, idx) => {
                const rid = String(extractId(row) ?? idx);
                return (
                  <tr key={rid} className="hover:bg-slate-50/30 group transition-colors">
                    <td className="px-8 py-6 text-xs font-mono font-bold text-indigo-600">#{rid.slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {resource.fields.map(f => row[f.name] !== undefined && (
                          <div key={f.name} className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase mr-1.5">{f.label}:</span>
                            <span className="text-xs font-bold text-slate-700">
                              {typeof row[f.name] === 'boolean' ? (row[f.name] ? 'Yes' : 'No') : String(row[f.name])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => {
                            setViewJson(JSON.stringify(row, null, 2));
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {resource.canUpdate && extractId(row) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => {
                              setEditId(String(extractId(row)));
                              setFormData({ ...row });
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {resource.canDelete && extractId(row) && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={async () => {
                              const ok = window.confirm(`Permanently delete this ${resource.label.slice(0, -1)}?`);
                              if (!ok) return;
                              try {
                                await saFetch(`${resource.basePath}/${extractId(row)}`, { method: "DELETE" });
                                await load();
                              } catch (e: any) {
                                setError(e?.message ?? "Delete failed");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No records found in this module.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={`New ${resource.label.slice(0, -1)}`} className="max-w-xl">
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await saFetch(resource.basePath, { method: "POST", body: JSON.stringify(formData) });
              setIsCreateOpen(false);
              await load();
            } catch (e: any) {
              setError(e?.message ?? "Create failed");
            }
          }}
        >
          <div className="grid grid-cols-1 gap-5">
            {resource.fields.map(f => renderFormField(f))}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)} className="font-bold">
              Discard
            </Button>
            <Button type="submit" className="font-bold shadow-lg shadow-indigo-100">
              Create Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Update ${resource.label.slice(0, -1)}`} className="max-w-xl">
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editId) return;
            setError(null);
            try {
              await saFetch(`${resource.basePath}/${editId}`, { method: "PUT", body: JSON.stringify(formData) });
              setIsEditOpen(false);
              await load();
            } catch (e: any) {
              setError(e?.message ?? "Update failed");
            }
          }}
        >
          <div className="grid grid-cols-1 gap-5">
            {resource.fields.map(f => renderFormField(f))}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)} className="font-bold">
              Cancel
            </Button>
            <Button type="submit" className="font-bold shadow-lg shadow-indigo-100">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View JSON Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="System Payload (Raw JSON)" className="max-w-2xl">
        <div className="bg-slate-900 rounded-3xl p-6 overflow-hidden">
          <pre className="w-full max-h-[60vh] overflow-auto font-mono text-[11px] text-emerald-400 scrollbar-hide">
            {viewJson}
          </pre>
        </div>
      </Modal>
    </div>
  );
}
