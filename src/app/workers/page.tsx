"use client";

import { workers } from "@/lib/dummy-data";
import { 
  Plus, 
  Search, 
  Phone, 
  MoreVertical,
  LayoutGrid,
  List,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";

export default function WorkersPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage your workforce and specialized trades</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Input 
                placeholder="Search workers..." 
                icon={Search}
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-[46px]">
              <Button 
                variant={view === "grid" ? "white" : "ghost"}
                size="icon"
                onClick={() => setView("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === "grid" ? "text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={view === "list" ? "white" : "ghost"}
                size="icon"
                onClick={() => setView("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === "list" ? "text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
            
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Register Worker</span>
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="p-6 space-y-6 group">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{worker.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg uppercase tracking-wider border border-indigo-100">
                      {worker.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                    <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{worker.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Daily Rate</span>
                    <span className="font-bold text-slate-900">{worker.rate}</span>
                  </div>
                </div>

                <Button variant="secondary" className="w-full">
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker Name</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                          {worker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{worker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg uppercase tracking-wider border border-indigo-100">
                        {worker.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-600">{worker.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-slate-900">{worker.rate}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="text-indigo-600 font-bold text-sm">View Profile</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Worker"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Trade/Type</label>
              <Input placeholder="e.g., Mason" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., 555-0123" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Daily Rate</label>
              <Input placeholder="e.g., $150/day" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Register Worker
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
