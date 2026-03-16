"use client";

import { useAuth } from "@/lib/auth-context";
import { projects } from "@/lib/dummy-data";
import { 
  MoreHorizontal, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  LayoutGrid,
  List,
  Search,
  X
} from "lucide-react";
import Link from "next/link";
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

export default function ProjectsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // RBAC: Client sees only their project, others see all
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (user?.role === "client") {
      return matchesSearch && p.id === user.projectId;
    }
    
    return matchesSearch;
  });

  const canAddProject = user?.role === "architect";

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user?.role === "client" ? "My Project" : "Project Portfolio"}
            </h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">
              {user?.role === "client" ? "Track your construction progress" : "Manage and track active construction sites"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.role !== "client" && (
              <div className="hidden md:block">
                <Input 
                  placeholder="Search projects..." 
                  icon={Search}
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

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
            
            {canAddProject && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Project</span>
              </Button>
            )}
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden group">
                <div className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">Client: {project.client}</p>
                    </div>
                    {user?.role === "architect" && (
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-50">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Started {project.startDate}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-900">Project Progress</span>
                      <span className="text-indigo-600">{project.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000 group-hover:bg-indigo-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      project.status === "In Progress" ? "bg-green-500 animate-pulse" : "bg-blue-500"
                    )} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{project.status}</span>
                  </div>
                  <Link 
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/btn"
                  >
                    View Details
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="group">
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</p>
                        <p className="text-xs font-medium text-slate-500">{project.client}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-600">{project.location}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-600">{project.startDate}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          project.status === "In Progress" ? "bg-green-500" : "bg-blue-500"
                        )} />
                        <span className="text-xs font-bold text-slate-700">{project.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </Link>
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
        title="Create New Project"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Project Name</label>
              <Input placeholder="e.g., Modern Villa" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Client Name</label>
              <Input placeholder="e.g., Alice Johnson" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
            <Input placeholder="e.g., Beverly Hills, CA" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Budget</label>
              <Input placeholder="e.g., $850,000" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
