"use client";

import { useState, useEffect } from "react";
import { agencyService, AgencyRegistration } from "@/services/agency.service";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { Briefcase, MapPin, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

export default function PendingAgencies({ onApproved }: { onApproved?: () => void }) {
  const router = useRouter();
  const [agencies, setAgencies] = useState<AgencyRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      const data = await agencyService.getPendingRegistrations();
      setAgencies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await agencyService.approveRegistration(id);
      toast.success("Agency approved and added to Staff!");
      fetchAgencies();
      if (onApproved) onApproved();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve agency");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await agencyService.rejectRegistration(id);
      toast.success("Agency registration rejected");
      fetchAgencies();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject agency");
    }
  };

  const columns: Column<AgencyRegistration>[] = [
    {
      header: "Agency Details",
      render: (agency) => (
        <div className="flex items-center gap-3">
          {agency.profilePhoto ? (
            <img src={agency.profilePhoto} alt="logo" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-600 border border-indigo-100">
              {agency.agencyName[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">{agency.agencyName}</p>
            <p className="text-[10px] font-medium text-slate-500 lowercase">{agency.email} • {agency.mobile}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Business Type",
      render: (agency) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 border-indigo-200 px-2 py-0.5">
          <Briefcase className="w-3 h-3 mr-1.5 opacity-70" />
          {typeof agency.businessType === "string" ? agency.businessType : agency.businessType?.name || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Experience",
      render: (agency) => (
        <span className="text-[11px] font-bold text-slate-700 font-mono">
          {agency.experience != null ? `${agency.experience} yrs` : "—"}
        </span>
      ),
    },
    {
      header: "Portfolio",
      render: (agency) => (
        <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>{agency.completedProjectsCount || 0} Projects</span>
          {agency.instagramLink && (
            <a href={agency.instagramLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
              Instagram <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (agency) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => router.push(`/agency-approvals/${agency._id}`)} className="px-3 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-colors text-xs font-bold shadow-sm" title="View Details">
            View
          </button>
          {agency.status === "Pending" && (
            <>
              <button onClick={() => handleApprove(agency._id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Approve & Add to Staff">
                <ShieldCheck className="w-4 h-4" />
              </button>
              <button onClick={() => handleReject(agency._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Reject">
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {agency.status === "Approved" && (
            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 shadow-sm ml-2">
              Approved
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading pending requests...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {agencies.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Pending Requests</h3>
          <p className="text-xs text-slate-500">There are no new agency registrations to review.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={agencies} />
      )}
    </div>
  );
}
