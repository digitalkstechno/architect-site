"use client";

import { projects } from "@/lib/dummy-data";
import { Camera, Plus, Filter, Search, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

export default function SitePhotosPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState("all");

  const filteredProjects = user?.role === "client" 
    ? projects.filter(p => p.id === user.projectId)
    : projects;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Site Documentation</h2>
          <p className="text-sm font-medium text-slate-500 hidden sm:block">Visual progress tracking and site inspection photos</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role !== "worker" && (
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Upload Photos</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden group cursor-pointer hover:border-indigo-200 transition-all">
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute bottom-4 left-6 z-20 space-y-1">
                <h3 className="text-white font-bold text-lg">{project.name}</h3>
                <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </div>
              </div>
              <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest">
                12 Photos
              </div>
              {/* Placeholder image representation */}
              <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                <Camera className="w-12 h-12 text-indigo-200 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +8
                </div>
                <span className="text-sm font-bold text-slate-700">Recent uploads</span>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-indigo-600">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
