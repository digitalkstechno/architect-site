"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, Trash2, Pencil, Eye } from "lucide-react";
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
  const [createJson, setCreateJson] = useState("{\n}\n");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewJson, setViewJson] = useState<string>("{}");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editJson, setEditJson] = useState("{\n}\n");

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
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
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

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">{filtered.length} record(s)</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{loading ? "Loading..." : "Ready"}</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row, idx) => {
                const rid = String(extractId(row) ?? idx);
                return (
                  <tr key={rid} className="hover:bg-slate-50/30">
                    <td className="px-6 py-5 text-xs font-mono text-slate-700">{extractId(row) ? String(extractId(row)) : "—"}</td>
                    <td className="px-6 py-5">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words max-h-24 overflow-hidden">
                        {JSON.stringify(row, null, 2)}
                      </pre>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setViewJson(JSON.stringify(row, null, 2));
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {resource.canUpdate && extractId(row) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setEditId(String(extractId(row)));
                              setEditJson(JSON.stringify(row, null, 2));
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Button>
                        )}
                        {resource.canDelete && extractId(row) && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="gap-2"
                            onClick={async () => {
                              const ok = window.confirm(`Delete ${resource.label} ${extractId(row)}?`);
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
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={`Create ${resource.label}`} className="max-w-3xl">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const body = JSON.parse(createJson);
              await saFetch(resource.basePath, { method: "POST", body: JSON.stringify(body) });
              setIsCreateOpen(false);
              setCreateJson("{\n}\n");
              await load();
            } catch (e: any) {
              setError(e?.message ?? "Create failed");
            }
          }}
        >
          <p className="text-sm font-medium text-slate-600">
            Paste JSON according to backend DTO/schema.
          </p>
          <textarea
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
            rows={14}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`${resource.label} (JSON)`} className="max-w-3xl">
        <pre className="w-full max-h-[70vh] overflow-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800">
          {viewJson}
        </pre>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Update ${resource.label}`} className="max-w-3xl">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editId) return;
            setError(null);
            try {
              const body = JSON.parse(editJson);
              await saFetch(`${resource.basePath}/${editId}`, { method: "PUT", body: JSON.stringify(body) });
              setIsEditOpen(false);
              setEditId(null);
              await load();
            } catch (e: any) {
              setError(e?.message ?? "Update failed");
            }
          }}
        >
          <p className="text-sm font-medium text-slate-600">
            Edit JSON and submit (PUT {resource.basePath}/:id).
          </p>
          <textarea
            value={editJson}
            onChange={(e) => setEditJson(e.target.value)}
            rows={14}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

