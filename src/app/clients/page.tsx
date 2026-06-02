"use client";


import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Phone, Mail, MoreVertical, ArrowUpRight, UserCircle2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { staffService, StaffMember } from "@/services/staff.service";
import { usePayments } from "@/lib/payments-store";
import { useProjects } from "@/lib/projects-store";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";

export default function ClientsPage() {
  const { user } = useAuth();
  const { payments } = usePayments();
  const { projects } = useProjects();
  const [clients, setClients] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const canAdd = user?.role === "architect" || user?.role === "director";

  const fetchData = async () => {
    try {
      const data = await staffService.getAllStaff();
      setClients(data.filter((s: any) => s.role?.name?.toLowerCase() === "client"));
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getClientStats = (clientId: string) => {
    const clientPayments = payments.filter(p => p.clientId === clientId);
    const clientProjects = projects.filter(p => p.clientId === clientId);
    
    const hasPending = clientPayments.some(p => p.status !== "Paid");
    const status = clientPayments.length === 0 ? "Pending" : (hasPending ? "Pending" : "Paid");

    const totalBudget = clientProjects.reduce((sum, p) => {
      const val = typeof p.budget === 'number' ? p.budget : Number(String(p.budget).replace(/[^0-9.-]+/g, "")) || 0;
      return sum + val;
    }, 0);

    const totalReceived = clientPayments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
    const totalPending = Math.max(0, totalBudget - totalReceived);

    return {
      projects: clientProjects.map(p => ({ id: p.id, name: p.name })),
      status,
      totalBudget,
      totalReceived,
      totalPending
    };
  };

  const columns: Column<StaffMember>[] = [
    {
      header: "Client",
      className: "py-3 px-4",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{client.name}</p>
            <p className="text-[9px] font-medium text-slate-500">{client.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Portfolio & Finance",
      className: "py-3 px-4",
      render: (client) => {
        const stats = getClientStats(client._id);
        return (
          <div className="space-y-2 min-w-[200px]">
            <div className="flex flex-wrap gap-1.5">
              {stats.projects.length > 0 ? stats.projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[9px] font-bold text-indigo-600 border border-indigo-100 uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1">
                    <LayoutGrid className="w-2.5 h-2.5" />
                    {p.name}
                  </span>
                </Link>
              )) : <span className="text-[8px] text-slate-400 italic">No projects yet</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Received</span>
                <span className="text-xs font-black text-green-600 font-mono">${stats.totalReceived.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                <span className="text-xs font-black text-orange-600 font-mono">${stats.totalPending.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Contact Info",
      className: "py-3 px-4",
      render: (client) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-bold font-mono tracking-tight">{client.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mail className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">{client.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      className: "py-3 px-4",
      render: (client) => {
        const stats = getClientStats(client._id);
        return (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] font-black uppercase tracking-widest border px-2.5 py-1 shadow-sm",
              stats.status === "Paid" ? "bg-green-50 text-green-700 border-green-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {stats.status}
          </Badge>
        );
      },
    },
    {
      header: "Action",
      className: "py-3 px-4 text-right",
      headerClassName: "text-right",
      render: (client) => (
        <div className="flex justify-end gap-1">
          <Link href={`/clients/${client._id}`}>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-md active:scale-95">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">CLIENT PORTFOLIO</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Relationship & Payment Management</p>
        </div>
        
        {canAdd && (
          <Link href="/staff">
            <Button size="sm" className="rounded-xl font-bold text-xs gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-100">
              <Plus className="w-4 h-4" /> Add Client
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9 h-9 text-xs border-none bg-transparent focus:ring-0 shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{filteredClients.length} Clients</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filteredClients} />
      </div>
    </div>
  );
}
