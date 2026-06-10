"use client";

import PendingAgencies from "@/components/staff/PendingAgencies";

export default function AgencyApprovalsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">PENDING AGENCIES</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Review & Approve</p>
      </div>

      <PendingAgencies />
    </div>
  );
}
