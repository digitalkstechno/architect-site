"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Phone, Briefcase, Shield } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { staffService, StaffMember } from "@/services/staff.service";

export default function OfficeTeamPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const allStaff = await staffService.getAllStaff();
        setMembers(allStaff.filter((s) => s.team === "Office"));
      } catch (err) {
        console.error("Failed to load office team:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const columns: Column<StaffMember>[] = [
    {
      header: "Member",
      className: "py-3 px-4",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {member.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{member.name}</p>
            <p className="text-[9px] font-normal text-slate-500 font-mono">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      className: "py-3 px-4",
      render: (member) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border-indigo-100 px-1.5 py-0">
          <Shield className="w-3 h-3 mr-1" />
          {member.role?.name || "—"}
        </Badge>
      ),
    },
    {
      header: "Contact",
      className: "py-3 px-4",
      render: (member) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-slate-600">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-mono">{member.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-mono truncate max-w-[120px]">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Experience",
      className: "py-3 px-4",
      render: (member) => (
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {member.experience != null ? `${member.experience} yrs` : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      className: "py-3 px-4",
      render: (member) => (
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="text-[11px] font-medium text-slate-600">{member.isActive ? "Active" : "Inactive"}</span>
        </div>
      ),
    },
  ];

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Office Team</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
            Architects, designers &amp; office staff
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search office team..."
            icon={Search}
            className="w-56 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-medium">
          Loading office team…
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-slate-400 text-sm font-medium">No office team members found.</p>
          <p className="text-slate-300 text-xs">Add staff with &quot;Office&quot; team from Staff Management.</p>
        </div>
      ) : (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <DataTable columns={columns} data={filteredMembers} />
        </Card>
      )}
    </div>
  );
}
