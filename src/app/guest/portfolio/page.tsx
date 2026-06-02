"use client";

import { useProjects } from "@/lib/projects-store";
import { MapPin, HardHat, ChevronRight, Filter, Phone, ArrowRight, Star, Award, Building2, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function GuestPortfolioPage() {
  const { projects } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filters = ["All", "In Progress", "Planned", "Completed"];
  const filtered = activeFilter === "All" ? projects : projects.filter(p => p.status === activeFilter);

  const stats = [
    { value: `${projects.length}+`, label: "Total Projects", icon: Building2 },
    { value: `${projects.filter(p => p.status === "In Progress").length}`, label: "Active Sites", icon: HardHat },
    { value: "12+", label: "Years Experience", icon: Award },
    { value: "100%", label: "Client Satisfaction", icon: Star },
  ];

  return (
    <div className="animate-in fade-in duration-700 selection:bg-indigo-500 selection:text-white bg-white font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2000')] bg-cover bg-center scale-105 opacity-[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-indigo-50/30" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 py-20 text-left space-y-8">
          <div className="inline-flex items-center gap-2.5 bg-white px-4 py-1.5 rounded-full shadow-sm border border-indigo-50/50">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.3em] font-mono">Our Architectural Legacy</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
              Projects That Define <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 italic font-serif">Excellence</span>
            </h1>
            <p className="text-base text-slate-500 max-w-3xl font-medium leading-relaxed font-sans">
              From luxury villas to commercial landmarks — explore our portfolio of transformative construction projects across India.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -mr-48 -mt-48" />
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-white py-12 relative overflow-hidden border-y border-slate-100">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((s) => (
              <div key={s.label} className="group space-y-3">
                <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="space-y-0">
                  <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter font-mono">
                    {s.value}
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Navigation ── */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="w-full px-6 md:px-12 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide w-full md:w-auto pb-2 md:pb-0">
              <div className="flex items-center gap-2 text-slate-400 mr-2 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Filter:</span>
              </div>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap font-sans",
                    activeFilter === f
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-50 scale-105"
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 font-mono">
              Showing {filtered.length} Masterpiece{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <main className="w-full px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100"
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Visual Placeholder with Gradient */}
                <div className={cn(
                  "w-full h-full transition-transform duration-700 group-hover:scale-105 bg-gradient-to-br",
                  i % 4 === 0 ? "from-indigo-100 to-blue-100" :
                  i % 4 === 1 ? "from-slate-100 to-indigo-50" :
                  i % 4 === 2 ? "from-amber-100 to-orange-50" :
                  "from-emerald-100 to-teal-50"
                )} />

                {/* Status Badge */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100">
                    <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">{p.status}</span>
                  </div>
                </div>

                {/* Project Details Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 space-y-6">
                  <div className="space-y-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                      <p className="text-indigo-600 group-hover:text-indigo-200 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">{p.location}</p>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-white tracking-tight font-sans">{p.name}</h4>
                    <p className="text-slate-500 group-hover:text-indigo-100 text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 font-sans">
                      A unique architectural marvel blending modern design with structural innovation.
                    </p>
                  </div>
                  
                  <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full transition-all duration-1000 delay-300" style={{ width: hoveredId === p.id ? `${p.progress}%` : '0%' }} />
                      </div>
                      <span className="text-white text-[10px] font-bold font-mono tracking-widest">{p.progress}%</span>
                    </div>
                    <button className="w-full bg-white text-slate-950 font-bold py-3.5 px-7 rounded-xl transition-all hover:bg-indigo-50 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] shadow-lg font-sans">
                      View Full Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer Contact CTA ── */}
      <section className="py-24 bg-white px-6 md:px-12">
        <div className="w-full">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 p-12 md:p-20 text-center space-y-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.2]">
                Ready to build your <br />
                <span className="text-indigo-400 italic font-serif">Dream project?</span>
              </h2>
              <p className="text-base text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed font-sans">
                Join hundreds of satisfied clients who have transformed their architectural visions into reality with Arkiton.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link href="tel:+919876543210" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white text-slate-950 font-black py-5 px-10 rounded-2xl transition-all hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-0.5 text-base font-sans">
                <Phone className="w-5 h-5 text-indigo-600" />
                Contact Us Now
              </Link>
              <Link href="/guest/about" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black py-5 px-10 rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-0.5 text-base font-sans">
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
