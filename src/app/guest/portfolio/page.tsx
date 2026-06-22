"use client";

import { useProjects } from "@/lib/projects-store";
import { MapPin, HardHat, ChevronRight, Filter, Phone, ArrowRight, Star, Award, Building2, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Static fallback projects for Guest Mode Portfolio
const STATIC_PROJECTS = [
  { id: "p1", name: "The Skyline Villa", location: "Ambli Road, Ahmedabad", progress: 85, status: "In Progress" },
  { id: "p2", name: "NexGen Corporate Hub", location: "C.G. Road, Ahmedabad", progress: 100, status: "Completed" },
  { id: "p3", name: "Sindhu Penthouse", location: "Sindhu Bhavan, Ahmedabad", progress: 20, status: "Planned" },
  { id: "p4", name: "Boutique Retail Plaza", location: "Bodakdev, Ahmedabad", progress: 95, status: "In Progress" },
  { id: "p5", name: "Zen Corporate Workspace", location: "S.G. Highway, Ahmedabad", progress: 100, status: "Completed" },
  { id: "p6", name: "Imperial Bungalow", location: "Bopal, Ahmedabad", progress: 0, status: "Planned" },
];

export default function GuestPortfolioPage() {
  const { projects } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const displayProjects = projects && projects.length > 0 ? projects : STATIC_PROJECTS;
  const filters = ["All", "In Progress", "Planned", "Completed"];
  const filtered = activeFilter === "All" ? displayProjects : displayProjects.filter(p => p.status === activeFilter);

  const stats = [
    { value: `${displayProjects.length}+`, label: "Total Projects", icon: Building2 },
    { value: `${displayProjects.filter(p => p.status === "In Progress").length}`, label: "Active Sites", icon: HardHat },
    { value: "12+", label: "Years Experience", icon: Award },
    { value: "100%", label: "Client Satisfaction", icon: Star },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2000')] bg-cover bg-center scale-105 opacity-[0.02] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white/80 to-indigo-50/20 dark:from-slate-950 dark:via-slate-950/90 dark:to-indigo-950/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 text-left space-y-6">
          <div className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-4.5 py-1.5 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] font-mono">Our Architectural Legacy</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Projects That Define <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic font-serif">Excellence</span>
            </h1>
            <p className="text-sm md:text-base text-slate-505 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              Explore our landmark residential villas, high-rise apartments, and commercial corporate complexes delivered across India with extreme structural precision.
            </p>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px] -mr-40 -mt-40" />
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-12 relative overflow-hidden border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
            {stats.map((s) => (
              <div key={s.label} className="group space-y-3 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="w-10 h-10 mx-auto md:mx-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="space-y-0">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
                    {s.value}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Navigation ── */}
      <div className="sticky top-20 z-45 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 text-slate-400 mr-2 flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest font-mono">Filter:</span>
              </div>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-4.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 font-mono whitespace-nowrap",
                    activeFilter === f
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105"
                      : "bg-slate-50 dark:bg-slate-805/60 text-slate-550 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:bg-slate-105 dark:hover:bg-slate-850"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 font-mono flex-shrink-0">
              Showing {filtered.length} Work{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10 opacity-75 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Visual Cover Image Overlays */}
                <img 
                  src={
                    i % 6 === 0 ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600" :
                    i % 6 === 1 ? "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600" :
                    i % 6 === 2 ? "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600" :
                    i % 6 === 3 ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600" :
                    i % 6 === 4 ? "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=600" :
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=600"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Status Badge */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                    <span className="text-indigo-650 dark:text-indigo-455 text-[9px] font-black uppercase tracking-[0.2em] font-mono">{p.status}</span>
                  </div>
                </div>

                {/* Project Details Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 space-y-6">
                  <div className="space-y-2.5 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-455 group-hover:text-indigo-300" />
                      <p className="text-indigo-300 text-[9px] font-black uppercase tracking-[0.25em] font-mono">{p.location}</p>
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight font-sans">{p.name}</h4>
                    <p className="text-slate-300 text-xs font-medium line-clamp-2 leading-relaxed font-sans">
                      A unique architectural masterpiece executed using premium design structures and ISO parameters.
                    </p>
                  </div>
                  
                  <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                    {p.progress !== undefined && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] text-white font-mono uppercase tracking-widest font-bold">
                          <span>Construction Progress</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-400 to-blue-450 rounded-full transition-all duration-1000 delay-300 shadow-[0_0_8px_rgba(129,140,248,0.5)]" style={{ width: hoveredId === p.id ? `${p.progress}%` : '0%' }} />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono font-bold text-white/80 border-t border-white/10 pt-3">
                      <span>AREA: ~2,800 SQFT</span>
                      <span>TYPE: PREMIUM RCC</span>
                    </div>
                    <button className="w-full bg-white hover:bg-slate-55 text-slate-950 font-black py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-mono shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      View Work Showcase <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer Contact CTA ── */}
      <section className="py-24 bg-white dark:bg-slate-900 px-6 md:px-12 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 dark:bg-slate-900/50 p-12 md:p-20 text-center space-y-8 shadow-2xl border border-slate-800/40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                Ready to Build Your <br />
                <span className="text-indigo-400 font-serif italic">Dream Project?</span>
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed font-sans">
                Join hundreds of satisfied villa and commercial owners who have transformed their site designs with Arkiton.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="tel:+919876543210" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-950 font-black py-4.5 px-8 rounded-2xl transition-all hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                <Phone className="w-4 h-4 text-indigo-650" />
                Contact Us Now
              </Link>
              <Link href="/guest/about" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black py-4.5 px-8 rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
