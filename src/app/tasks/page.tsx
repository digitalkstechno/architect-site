"use client";

import { tasks } from "@/lib/dummy-data";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  CircleCheck,
  CircleAlert,
  Clock,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

export default function TasksPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.worker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Task Tracker</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Monitor and manage all active construction tasks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input 
                placeholder="Filter tasks..." 
                icon={Search}
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="white" size="icon" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="white" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Construction Stage</TableHead>
                <TableHead>Assigned Worker</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="group">
                  <TableCell>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{task.project}</p>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {task.stage}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {task.worker.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{task.worker}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Clock className="w-4 h-4" />
                      {task.deadline}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Task"
      >
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Task Name</label>
            <Input placeholder="e.g., Foundation Inspection" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project</label>
              <Input placeholder="e.g., Modern Villa" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Stage</label>
              <Input placeholder="e.g., Foundation" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assign Worker</label>
              <Input placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Deadline</label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "Pending": "bg-slate-100 text-slate-600 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-green-50 text-green-600 border-green-100"
  };

  const icons = {
    "Pending": CircleAlert,
    "In Progress": Clock,
    "Completed": CircleCheck
  };

  const Icon = icons[status as keyof typeof icons] || CircleAlert;

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border uppercase tracking-wider shadow-sm",
      styles[status as keyof typeof styles]
    )}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
