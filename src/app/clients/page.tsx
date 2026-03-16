"use client";

import { clients } from "@/lib/dummy-data";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MoreVertical,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  UserCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function ClientsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage client relationships and project assignments</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input 
                placeholder="Search clients..." 
                icon={Search}
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="gap-2 shadow-lg shadow-indigo-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Client</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-2 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{client.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {client.projects.map((p) => (
                    <span key={p} className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider border border-slate-100">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{client.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Status</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    client.paymentStatus === "Paid" ? "bg-green-50 text-green-700 border-green-100" :
                    client.paymentStatus === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                    "bg-red-50 text-red-700 border-red-100"
                  )}>
                    {client.paymentStatus}
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2 group/btn">
                View Project Portfolio
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
            <Input placeholder="e.g., Alice Johnson" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <Input type="email" placeholder="e.g., alice@example.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., +1 234 567 890" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Assigned Projects</label>
            <Input placeholder="e.g., Modern Villa, Lakeview" />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
