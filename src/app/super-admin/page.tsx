"use client";

import { SA_BASE_URL, SA_RESOURCES } from "@/lib/superadmin-api";
import { Card } from "@/components/ui/Card";

export default function SuperAdminHome() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Super Admin Overview</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          Base URL: <span className="font-mono text-xs">{SA_BASE_URL}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SA_RESOURCES.map((r) => (
          <Card key={r.key} className="p-8">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{r.label}</p>
            <p className="text-sm font-bold text-slate-700 mt-2 font-mono">{r.basePath}</p>
            <div className="flex gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {r.canCreate && <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-full">POST</span>}
              <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-full">GET</span>
              {r.canUpdate && <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-full">PUT</span>}
              {r.canDelete && <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-full">DELETE</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

