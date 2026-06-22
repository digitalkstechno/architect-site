"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/projects-store";
import {
  ChevronRight, Phone, MapPin, ArrowRight, Star,
  Briefcase, HardHat, Users, PenTool, CheckCircle2,
  Play, X, Building2, Award, Zap, Heart, PlayCircle, Sparkles, ShieldCheck,
  Layers, RefreshCw, Calculator, Wrench, Hammer, CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static fallback projects for Guest Mode
const STATIC_PROJECTS = [
  { id: "p1", name: "The Skyline Villa", location: "Ambli Road, Ahmedabad", progress: 85, status: "In Progress" },
  { id: "p2", name: "NexGen Corporate Hub", location: "C.G. Road, Ahmedabad", progress: 100, status: "Completed" },
  { id: "p3", name: "Sindhu Penthouse", location: "Sindhu Bhavan, Ahmedabad", progress: 20, status: "Planned" },
];

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Stats section with animated counters ──────────────────────────────────
function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(52, 1800, visible);
  const c2 = useCounter(12, 1500, visible);
  const c3 = useCounter(240, 2000, visible);
  const c4 = useCounter(99, 1600, visible);

  const stats = [
    { value: c1, suffix: "+", label: "Completed Projects", icon: Building2, desc: "Delivered on-time" },
    { value: c2, suffix: "+", label: "Years Experience", icon: Award, desc: "Architectural mastery" },
    { value: c3, suffix: "+", label: "Happy Clients", icon: Heart, desc: "Trust & satisfaction" },
    { value: c4, suffix: "%", label: "Quality Audit Score", icon: Zap, desc: "Strict ISO compliance" },
  ];

  return (
    <div ref={ref} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-16 relative overflow-hidden border-y border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="group space-y-4 text-center md:text-left transition-all duration-300 hover:translate-y-[-2px]">
              <div className="w-12 h-12 mx-auto md:mx-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {s.value}{s.suffix}
                </p>
                <p className="text-slate-800 dark:text-slate-200 text-xs font-extrabold uppercase tracking-wider">{s.label}</p>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium leading-none">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractiveBlueprintSandbox() {
  const [activeLayer, setActiveLayer] = useState("structure");
  const [area, setArea] = useState(1800);
  const [qualityTier, setQualityTier] = useState("premium");
  const [completedTasks, setCompletedTasks] = useState<string[]>([
    "soil_test",
    "footing_cast",
  ]);
  const [activeTab, setActiveTab] = useState("milestones"); // "milestones" | "estimator"

  const multiplier = qualityTier === "luxury" ? 1.6 : qualityTier === "premium" ? 1.3 : 1.0;
  const cementBags = Math.round(area * 0.45 * multiplier);
  const steelTons = (area * 0.0035 * multiplier).toFixed(1);
  const laborHours = Math.round(area * 4.2 * multiplier);
  const costEstimate = Math.round(area * 1650 * multiplier).toLocaleString();

  const toggleTask = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  const layers = [
    { id: "finishing", label: "04. Interior Finishing Layer", color: "bg-amber-500 dark:bg-amber-600", desc: "Wall putty, primer painting, premium flooring, structural ceiling", icon: PenTool },
    { id: "electrical", label: "03. Electrical Conduit Grid", color: "bg-yellow-500 dark:bg-yellow-600", desc: "Heavy conduits layout, point wiring, MCB boards distribution", icon: Zap },
    { id: "plumbing", label: "02. Plumbing & Concealed Pipes", color: "bg-blue-500 dark:bg-blue-600", desc: "Inflow lines mapping, pressure testing logs, drainage slope", icon: Wrench },
    { id: "structure", label: "01. Concrete Pillar Skeleton", color: "bg-indigo-600 dark:bg-indigo-500", desc: "Reinforced steel framing, foundation pour, column cubes testing", icon: Hammer },
  ];

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/50">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono">Interactive Live Sandbox</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            3D Blueprint & Site <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic font-serif">Inspector</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto font-medium">
            Toggle structural layers to inspect standard wireframes and interact with our live estimator dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive 3D Perspective Stack */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative lg:sticky lg:top-28">
            <div className="w-full max-w-[380px] h-[220px] relative transition-all duration-700" style={{ perspective: "1000px" }}>
              
              <div 
                className="w-full h-full relative transition-transform duration-750" 
                style={{ 
                  transform: "rotateX(60deg) rotateZ(-30deg) translateY(-40px)",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* 3D Blueprint Layers */}
                {layers.map((layer, index) => {
                  const isActive = activeLayer === layer.id;
                  const translationZ = isActive 
                    ? `${(3 - index) * 60 + 40}px` 
                    : `${(3 - index) * 60}px`;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      className={cn(
                        "absolute inset-0 rounded-2xl border-2 transition-all duration-500 cursor-pointer p-5 flex flex-col justify-between shadow-2xl backdrop-blur-sm select-none",
                        isActive 
                          ? "bg-white/95 dark:bg-slate-900/95 border-indigo-500 scale-[1.03] ring-4 ring-indigo-500/20 z-30" 
                          : "bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-350 opacity-60 hover:opacity-85 hover:scale-[1.01]"
                      )}
                      style={{ 
                        transform: `translateZ(${translationZ})`,
                        boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 tracking-wider font-mono">
                          {layer.label}
                        </span>
                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-indigo-500 animate-ping" : "bg-slate-300 dark:bg-slate-700")} />
                      </div>

                      {/* Detailed SVG Architectural Blueprint Drawing */}
                      <div className="w-full h-24 border border-slate-200/80 dark:border-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/60">
                        {/* Blueprint grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:12px_12px] opacity-70" />
                        
                        {layer.id === "structure" && (
                          <svg className="w-full h-full p-2 absolute inset-0 text-indigo-600 dark:text-indigo-400 stroke-current opacity-80" viewBox="0 0 200 100" fill="none" strokeWidth="1">
                            <path d="M 10,90 L 190,90 M 20,90 L 20,20 L 180,20 L 180,90" strokeDasharray="2,2" />
                            <rect x="25" y="20" width="10" height="70" fill="currentColor" fillOpacity="0.1" />
                            <rect x="75" y="20" width="10" height="70" fill="currentColor" fillOpacity="0.1" />
                            <rect x="115" y="20" width="10" height="70" fill="currentColor" fillOpacity="0.1" />
                            <rect x="165" y="20" width="10" height="70" fill="currentColor" fillOpacity="0.1" />
                            <line x1="20" y1="35" x2="180" y2="35" strokeWidth="1.5" />
                            <line x1="20" y1="60" x2="180" y2="60" strokeWidth="1.5" />
                            <path d="M 25,12 L 175,12 M 25,9 L 25,15 M 175,9 L 175,15" strokeWidth="0.5" />
                            <text x="100" y="8" textAnchor="middle" fontSize="6" className="fill-slate-500 font-mono font-bold">12.50m (BEAM GRID)</text>
                          </svg>
                        )}

                        {layer.id === "plumbing" && (
                          <svg className="w-full h-full p-2 absolute inset-0 text-blue-500 dark:text-blue-400 stroke-current opacity-80" viewBox="0 0 200 100" fill="none" strokeWidth="1">
                            <path d="M 20,80 L 20,30 L 100,10 L 180,30 L 180,80 Z" strokeDasharray="3,3" strokeWidth="0.5" className="text-slate-300 dark:text-slate-700" />
                            <path d="M 10,60 L 60,60 L 60,25 L 140,25 L 140,75 L 190,75" strokeWidth="1.5" />
                            <path d="M 40,80 L 80,80 L 80,45 L 160,45 L 160,80" strokeDasharray="4,2" strokeWidth="1.5" />
                            <circle cx="60" cy="45" r="3" fill="currentColor" />
                            <circle cx="140" cy="50" r="3" fill="currentColor" />
                            <text x="100" y="92" textAnchor="middle" fontSize="6" className="fill-slate-500 font-mono font-bold">PN16 CONCEALED PIPING SYSTEM</text>
                          </svg>
                        )}

                        {layer.id === "electrical" && (
                          <svg className="w-full h-full p-2 absolute inset-0 text-yellow-500 dark:text-yellow-400 stroke-current opacity-80" viewBox="0 0 200 100" fill="none" strokeWidth="1">
                            <rect x="20" y="20" width="75" height="60" strokeDasharray="2,2" strokeWidth="0.5" className="text-slate-300 dark:text-slate-700" />
                            <rect x="105" y="20" width="75" height="60" strokeDasharray="2,2" strokeWidth="0.5" className="text-slate-300 dark:text-slate-700" />
                            <rect x="15" y="45" width="8" height="14" fill="currentColor" />
                            <path d="M 23,52 C 50,52 50,30 60,30 C 70,30 80,40 120,40 C 140,40 140,65 155,65" strokeWidth="1.2" strokeDasharray="1,1" />
                            <circle cx="60" cy="30" r="2.5" fill="currentColor" />
                            <circle cx="120" cy="40" r="2.5" fill="currentColor" />
                            <circle cx="155" cy="65" r="2.5" fill="currentColor" />
                            <path d="M 57,27 L 63,33 M 63,27 L 57,33" strokeWidth="0.8" />
                            <path d="M 117,37 L 123,43 M 123,37 L 117,43" strokeWidth="0.8" />
                            <text x="100" y="92" textAnchor="middle" fontSize="6" className="fill-slate-500 font-mono font-bold">L1/L2 CONDUIT ROUTING MAP</text>
                          </svg>
                        )}

                        {layer.id === "finishing" && (
                          <svg className="w-full h-full p-2 absolute inset-0 text-amber-500 dark:text-amber-600 stroke-current opacity-80" viewBox="0 0 200 100" fill="none" strokeWidth="1">
                            <path d="M 30,80 L 30,40 L 70,25 L 170,25 L 170,80 Z" strokeWidth="1.2" />
                            <rect x="45" y="45" width="20" height="20" strokeWidth="1" />
                            <line x1="55" y1="45" x2="55" y2="65" />
                            <line x1="45" y1="55" x2="65" y2="55" />
                            <rect x="110" y="45" width="18" height="35" strokeWidth="1.2" />
                            <circle cx="123" cy="62" r="1" fill="currentColor" />
                            <path d="M 20,40 L 75,21 L 180,21" strokeWidth="2" />
                            <text x="100" y="92" textAnchor="middle" fontSize="6" className="fill-slate-500 font-mono font-bold">3D ELEVATION WALL RENDER</text>
                          </svg>
                        )}

                        <layer.icon className={cn("w-7 h-7 opacity-30 absolute bottom-3 right-3 transition-transform", isActive ? "text-indigo-600 scale-110" : "text-slate-400")} />
                      </div>

                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none line-clamp-1">
                        {layer.desc}
                      </p>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Instruction Badge */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Click stack layers to inspect blueprint detail
            </div>
          </div>

          {/* Right Column: Dynamic Site Management & Calculations Dashboard */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-8">
            
            {/* Live Panel Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-4">
              <div>
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Control Dashboard Preview</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Arkiton Live Monitor</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <button
                  onClick={() => setActiveTab("milestones")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono transition-all",
                    activeTab === "milestones"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/30"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  Milestones
                </button>
                <button
                  onClick={() => setActiveTab("estimator")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono transition-all",
                    activeTab === "estimator"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/30"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  Estimator
                </button>
              </div>
            </div>

            {/* Selected Layer Info */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-indigo-500 text-[9px] font-black uppercase tracking-wider font-mono">Current Selection Inspector</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {layers.find(l => l.id === activeLayer)?.label}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {layers.find(l => l.id === activeLayer)?.desc}
              </p>
            </div>

            {activeTab === "milestones" ? (
              /* Premium Project Timeline Milestone Board */
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">SOP Project Execution Timeline</span>
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Stage Milestones</span>
                </div>

                {/* Connected Milestone List */}
                <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {[
                    {
                      id: "structure",
                      num: "01",
                      title: "Foundation & RCC Framing Skeleton",
                      sub: "Reinforced steel bars alignment, footings pour, and structural cube compressive strength tests.",
                      badge: "Civil Phase"
                    },
                    {
                      id: "plumbing",
                      num: "02",
                      title: "Concealed Piping & Plumbing Layouts",
                      sub: "Laying CPVC pressure water pipelines, sewage flow slope alignment & hydrostatic test audit.",
                      badge: "MEP Phase"
                    },
                    {
                      id: "electrical",
                      num: "03",
                      title: "Conduit Networks & Electrical Slabs",
                      sub: "Routing flame-retardant heavy conduits, fixing junction boxes, and pulling point switchwires.",
                      badge: "Utilities Phase"
                    },
                    {
                      id: "finishing",
                      num: "04",
                      title: "Interior plastering & Ceiling Finishing",
                      sub: "Applying premium wall putty coats, acrylic primers, structural pop plaster borders & finishing paint.",
                      badge: "Aesthetics Phase"
                    }
                  ].map((step) => {
                    const isCurrent = activeLayer === step.id;
                    return (
                      <div 
                        key={step.id} 
                        onClick={() => setActiveLayer(step.id)}
                        className={cn(
                          "relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none",
                          isCurrent 
                            ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500/50 shadow-sm translate-x-1" 
                            : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        )}
                      >
                        {/* Step Number Dot indicator */}
                        <div className="relative z-10">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black font-mono transition-all duration-300 border-2",
                            isCurrent
                              ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-500/20"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                          )}>
                            {step.num}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className={cn(
                              "text-xs font-black tracking-tight",
                              isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
                            )}>
                              {step.title}
                            </h5>
                            <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                              {step.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {step.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Live Cost & Material Estimator Tab */
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Cost & Material Estimator</span>
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Live Simulation</span>
                </div>

                {/* Sliders and Controls */}
                <div className="space-y-5 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>Built-up Area Size</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{area} sq. ft.</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="5000" 
                      step="50"
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono font-bold">
                      <span>500 SQFT</span>
                      <span>2,500 SQFT</span>
                      <span>5,000 SQFT</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-350">Material Quality Tier</span>
                    <div className="grid grid-cols-3 gap-2 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/20 dark:border-slate-800">
                      {["standard", "premium", "luxury"].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setQualityTier(tier)}
                          className={cn(
                            "py-2 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono transition-all",
                            qualityTier === tier
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100/10"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outputs and Estimate */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest font-mono opacity-80">Estimated Budget Range</span>
                      <h4 className="text-2xl font-black tracking-tight mt-1 font-mono">₹{costEstimate} *</h4>
                    </div>
                    <span className="text-[8px] font-mono font-bold opacity-60">* Approx. Gujarat Market Rates</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Cement</span>
                      <p className="text-base font-black text-slate-800 dark:text-slate-100 font-mono mt-1">{cementBags} Bags</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Steel</span>
                      <p className="text-base font-black text-slate-800 dark:text-slate-100 font-mono mt-1">{steelTons} Tons</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Labor Time</span>
                      <p className="text-base font-black text-slate-800 dark:text-slate-100 font-mono mt-1">{laborHours} hrs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Checklist Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Interactive Checklist Actions</span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">Updates Site Score</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "soil_test", label: "Perform Soil Density Audit" },
                  { id: "footing_cast", label: "Foundation Footing Pour" },
                  { id: "cube_test", label: "Concrete Cube Quality Test" },
                  { id: "leak_test", label: "Hydrostatic Pipe Leak Test" },
                ].map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300",
                      completedTasks.includes(task.id)
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-405"
                        : "bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    <CheckSquare className={cn("w-4 h-4 flex-shrink-0", completedTasks.includes(task.id) ? "text-emerald-500" : "text-slate-350")} />
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono">{task.label}</span>
                  </button>
                ))}
              </div>

              {/* Progress feedback bar */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" 
                    style={{ width: `${(completedTasks.length / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 font-mono">
                  SOP Completion: {Math.round((completedTasks.length / 4) * 100)}%
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────
export default function GuestHomePage() {
  const { projects } = useProjects();
  const [activeService, setActiveService] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  // Fallback to static lists if backend project context is empty
  const displayProjects = projects && projects.length > 0 ? projects : STATIC_PROJECTS;

  const services = [
    {
      icon: Briefcase, title: "Residential Villas",
      desc: "Custom luxury homes designed to reflect your lifestyle. From compact 2BHK to sprawling 5BHK villas — we craft every detail with absolute precision.",
      features: ["Custom floor plans", "3D architectural visualization", "Premium materials sourcing", "Interior design layout included"],
      color: "bg-indigo-600",
    },
    {
      icon: Building2, title: "Commercial Spaces",
      desc: "Modern offices, retail outlets, and commercial complexes built to impress clients, maximize productivity, and elevate brand value.",
      features: ["Space optimization plans", "Modern aesthetics & lighting", "Structural safety & compliance", "On-time milestone delivery"],
      color: "bg-blue-600",
    },
    {
      icon: PenTool, title: "Interior Design",
      desc: "End-to-end interior solutions — from conceptual mood boards to the final handover. Every room is tailored to tell your unique story.",
      features: ["Concept to completion", "Bespoke furniture planning", "Advanced lighting design", "Premium material selection"],
      color: "bg-indigo-500",
    },
    {
      icon: HardHat, title: "Turnkey Construction",
      desc: "Full-service construction management. We handle everything from soil excavation and foundation to the final coat of paint.",
      features: ["End-to-end project management", "Rigorous quality control", "Direct material sourcing", "SOP compliance monitoring"],
      color: "bg-slate-800",
    },
  ];

  return (
    <div className="space-y-0 bg-slate-50/50 dark:bg-slate-950 font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-12">
        {/* Background Image with Light Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000')] bg-cover bg-center opacity-[0.02] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-55 via-white/80 to-indigo-50/20 dark:from-slate-950 dark:via-slate-950/90 dark:to-indigo-950/20" />
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse duration-[6s]" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse duration-[8s] delay-1000" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-4.5 py-2 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin duration-3000" />
                <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] font-mono">Pioneering Design-Build Excellence</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  Crafting Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Spaces</span>,<br />
                  Building Architectural <span className="italic font-serif text-indigo-600 dark:text-indigo-400">Legacies</span>.
                </h1>
                <p className="text-base text-slate-505 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                  Arkiton is a premier design-build firm committed to transforming complex architectural visions into structural realities through modern technology and standard procedures.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/guest/portfolio" 
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                  Explore Portfolio 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => setVideoOpen(true)}
                  className="group inline-flex items-center gap-3 text-slate-850 dark:text-slate-202 font-bold py-4 px-8 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs uppercase tracking-widest font-mono">
                  <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-605 ml-0.5" />
                  </div>
                  Watch Our Story
                </button>
              </div>

              <div className="flex items-center gap-6 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 max-w-lg">
                <div className="flex -space-x-3">
                  {[11, 12, 13, 14].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i}`} alt="Client" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-900 bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm font-mono">
                    500+
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-450" />)}
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest font-mono">Trusted by 500+ Clients across GJ</p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Showcase Image Frame */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[2.5rem] blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-900 p-3">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000" 
                    alt="Premium Villa Architecture" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* Floating glass badge bottom-left */}
                  <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/30 shadow-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest font-mono">Latest Masterpiece</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">The Skyline Villa</h4>
                      <p className="text-[10px] font-medium text-slate-550 dark:text-slate-400">Ambli Road, Ahmedabad</p>
                    </div>
                    <Link href="/guest/portfolio" className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Floating Badge top-right */}
                  <div className="absolute top-6 right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 dark:border-slate-800/30 flex items-center gap-2 shadow-md">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Site Active</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <AnimatedStats />

      {/* ── Dynamic 3D Blueprint Sandbox ── */}
      <InteractiveBlueprintSandbox />

      {/* ── Services Section ── */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/50">
                <Zap className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono">Core Solutions</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Comprehensive Design & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 font-serif italic">Build</span> Services
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-405 text-sm font-medium max-w-sm leading-relaxed pb-2 border-l-2 border-indigo-600 pl-6 font-sans">
              From the initial schematic sketches to the final structural handover, we deliver a highly collaborative construction process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Service Tabs */}
            <div className="lg:col-span-4 space-y-3">
              {services.map((s, idx) => (
                <button
                  key={s.title}
                  onClick={() => setActiveService(idx)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center justify-between group border font-sans",
                    activeService === idx 
                      ? "bg-gradient-to-r from-indigo-50/50 to-blue-50/20 dark:from-indigo-950/30 dark:to-blue-950/10 border-indigo-500/50 dark:border-indigo-500/30 shadow-lg shadow-indigo-100/30 dark:shadow-none translate-x-2" 
                      : "bg-slate-50 dark:bg-slate-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                      activeService === idx 
                        ? "bg-indigo-600 text-white" 
                        : "bg-white dark:bg-slate-800 text-slate-405 dark:text-slate-500 group-hover:text-indigo-600"
                    )}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={cn("text-sm font-bold tracking-tight font-sans text-slate-805 dark:text-slate-205", activeService === idx ? "text-slate-900 font-extrabold" : "")}>{s.title}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-all duration-300",
                    activeService === idx ? "translate-x-0 opacity-100 text-indigo-600" : "-translate-x-2 opacity-0"
                  )} />
                </button>
              ))}
            </div>

            {/* Service Display Drawer */}
            <div className="lg:col-span-8">
              <div className="relative h-full min-h-[400px] rounded-[2rem] overflow-hidden group shadow-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/60 p-8 md:p-12 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-900/50">
                    <span className="text-indigo-650 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-[0.2em] font-mono">Service Details</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {services[activeService].title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl font-sans">
                    {services[activeService].desc}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {services[activeService].features.map(f => (
                      <div key={f} className="flex items-center gap-3 bg-white dark:bg-slate-905 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
                        <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-slate-705 dark:text-slate-300 tracking-tight font-sans">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-8 flex flex-wrap items-center gap-4">
                  <Link href="/guest/portfolio" 
                    className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                    View Sample Projects <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/guest/process" 
                    className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-305 font-bold py-4 px-8 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-xs uppercase tracking-widest font-mono">
                    View Our Process
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Masterpieces ── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-slate-655 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono">Portfolio Highlights</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Architectural Works That Speak <br />
              For <span className="text-indigo-600 dark:text-indigo-400 font-serif italic">Themselves</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.slice(0, 3).map((p, idx) => (
              <div key={p.id} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-slate-805/50">
                <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Visual Background image overlays */}
                  <img 
                    src={
                      idx === 0 ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600" :
                      idx === 1 ? "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600" :
                      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600"
                    }
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Absolute details */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-between p-8">
                    <div className="flex items-center justify-between">
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-805">
                        <span className="text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] font-mono">{p.status}</span>
                      </div>
                      
                      {p.progress !== undefined && (
                        <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold font-mono">
                          {p.progress}% Complete
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <p className="text-indigo-350 text-[10px] font-bold uppercase tracking-[0.25em] font-mono">{p.location}</p>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight font-sans">{p.name}</h4>
                        <p className="text-slate-300 text-xs font-medium line-clamp-2 leading-relaxed font-sans">
                          Arkiton premier layout. Fully engineered concrete frames and standard interior furnishings.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <Link href="/guest/portfolio" className="inline-flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest font-mono hover:text-indigo-205 transition-colors">
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                        <span className="text-slate-400 text-[9px] uppercase tracking-widest font-mono">Arkiton Pro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/guest/portfolio" 
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-50 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
              Explore All Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Quotes */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                  <Heart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest font-mono">Client Stories</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  What Our Valued <br />
                  <span className="text-indigo-605 dark:text-indigo-400 font-serif italic">Clients Say About Us</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "Alice Johnson", role: "Villa Owner", text: "Arkiton transformed our vision into a stunning reality. The attention to detail and professionalism was unmatched. Every corner of our home tells a story of their craftsmanship.", rating: 5 },
                  { name: "Bob Smith", role: "Real Estate Developer", text: "From design to execution, every step was handled with precision. We couldn't be happier with the results. They are true partners in construction.", rating: 5 }
                ].map((t, i) => (
                  <div key={t.name} className="p-7 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-205 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between min-h-[280px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-xs md:text-sm text-slate-650 dark:text-slate-300 font-medium leading-relaxed italic font-serif">"{t.text}"</p>
                    </div>
                    <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-250/20 dark:border-slate-800/30">
                      <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md font-mono">
                        {t.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{t.name}</h4>
                        <p className="text-indigo-650 dark:text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] font-mono mt-0.5">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Modern Mock-up Frame & Callout */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-indigo-650/10 rounded-[3rem] blur-xl" />
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-[12px] border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900">
                <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000" alt="Villa Exterior Pool View" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-transparent" />
                <button 
                  onClick={() => setVideoOpen(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
                  <Play className="w-5 h-5 fill-indigo-600 text-indigo-600 dark:text-indigo-400 ml-1 group-hover:scale-105" />
                </button>
              </div>
              
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl z-20 text-slate-900 dark:text-white space-y-3 max-w-[250px] border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] font-mono">100% Quality Guaranteed</span>
                </div>
                <p className="text-[11px] text-slate-505 dark:text-slate-405 leading-normal font-bold">
                  All construction sites are fully covered by standard procedures & quality audit logs.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="py-24 bg-white dark:bg-slate-900 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 dark:bg-slate-900/50 p-12 md:p-20 text-center space-y-8 shadow-2xl border border-slate-800/40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                Ready to Build Your <br />
                <span className="text-indigo-400 font-serif italic">Dream Project?</span>
              </h2>
              <p className="text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed font-sans">
                Get in touch with Arkiton today. Speak to our lead architect and schedule a free structural layout consultation.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="tel:+919876543210" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-950 font-black py-4.5 px-8 rounded-2xl transition-all hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                <Phone className="w-4 h-4 text-indigo-650" />
                Contact Us Now
              </Link>
              <Link href="/guest/portfolio" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black py-4.5 px-8 rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-0.5 text-xs uppercase tracking-widest font-mono">
                Explore Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal with Live Architectural Stock Footage */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setVideoOpen(false)} />
          <div className="relative z-10 w-full max-w-5xl aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setVideoOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-20">
              <X className="w-6 h-6" />
            </button>
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
              <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-detail-under-a-blue-sky-4541-large.mp4"
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
