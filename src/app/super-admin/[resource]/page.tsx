"use client";

import { use } from "react";
import CrudResourcePage from "@/components/superadmin/CrudResourcePage";
import { SA_RESOURCES } from "@/lib/superadmin-api";

export default function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  const r = SA_RESOURCES.find((x) => x.key === resource);

  if (!r) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900">Unknown module</h2>
        <p className="text-sm font-medium text-slate-500 mt-2">No resource registered for: {resource}</p>
      </div>
    );
  }

  return <CrudResourcePage resource={r} />;
}

