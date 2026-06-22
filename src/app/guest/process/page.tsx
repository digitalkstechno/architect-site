"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ClipboardList, HardHat, PenTool, Hammer,
  Droplets, Zap, ShieldCheck, ChevronDown, ChevronUp,
  ArrowRight, Phone, Clock, Users, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01", title: "Initial Consultation", duration: "1–2 Days", icon: Users,
    desc: "We meet with you to understand your vision, requirements, budget, and timeline.",
    details: ["Site visit and assessment", "Budget planning discussion", "Timeline estimation", "Requirement documentation"],
    color: "bg-indigo-600",
  },
  {
    step: "02", title: "Design & Planning", duration: "2–4 Weeks", icon: PenTool,
    desc: "Our design team creates detailed architectural drawings, 3D models, and structural plans.",
    details: ["Architectural drawings", "3D visualization", "Structural engineering plans", "Interior design concepts"],
    color: "bg-blue-600",
  },
  {
    step: "03", title: "Approvals & Permits", duration: "1–3 Weeks", icon: ClipboardList,
    desc: "We handle all government approvals, building permits, and regulatory compliance.",
    details: ["Municipal approvals", "Building permits", "Environmental clearances", "Safety certifications"],
    color: "bg-slate-900",
  },
  {
    step: "04", title: "Site Preparation", duration: "1 Week", icon: HardHat,
    desc: "Ground preparation, excavation, and foundation work begins with our certified site team.",
    details: ["Site clearing", "Soil testing", "Excavation", "Foundation marking"],
    color: "bg-emerald-600",
  },
  {
    step: "05", title: "Construction Execution", duration: "3–12 Months", icon: Hammer,
    desc: "Systematic construction following our SOPs — from foundation to finishing.",
    details: ["Foundation & structure", "Brick work & plaster", "Plumbing & electrical", "Flooring & painting"],
    color: "bg-indigo-900",
  },
  {
    step: "06", title: "Final Handover", duration: "1 Week", icon: Star,
    desc: "Complete quality inspection, snag list resolution, and formal handover with all documentation.",
    details: ["Final quality audit", "Snag list resolution", "Documentation handover", "Warranty registration"],
    color: "bg-amber-600",
  },
];

const AGENCIES = [
  {
    id: "plumbing",   title: "Plumbing Agency",   icon: Droplets,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/60",   border: "border-blue-200/50 dark:border-blue-900/50",
    desc: "Complete water supply, drainage, and sanitation solutions.",
    sops: ["Water line layout & pressure testing", "Drainage mapping & slope calculation", "Fixture installation standards", "Leak detection & waterproofing", "Hot water system installation"],
  },
  {
    id: "electrical", title: "Electrical Agency", icon: Zap,          color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/60",  border: "border-amber-200/50 dark:border-amber-900/50",
    desc: "Safe and efficient electrical systems for every project.",
    sops: ["Conduit placement & routing", "Wiring safety protocols (IS standards)", "Point distribution & load calculation", "MCB & earthing installation", "Testing & commissioning"],
  },
  {
    id: "structure",  title: "Structure Agency",  icon: Hammer,       color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/60", border: "border-indigo-200/50 dark:border-indigo-900/50",
    desc: "Structural integrity from foundation to roof.",
    sops: ["Column casting & curing schedule", "Beam reinforcement standards", "Slab thickness & mix design", "Shuttering & de-shuttering timeline", "Quality cube testing"],
  },
  {
    id: "interior",   title: "Interior Agency",   icon: PenTool,      color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200/50 dark:border-purple-900/50",
    desc: "Transforming spaces with precision and style.",
    sops: ["Furniture framing & dimensions", "False ceiling height standards", "Finishing quality checklist", "Material selection process", "Final snag inspection"],
  },
  {
    id: "painting",   title: "Painting Agency",   icon: Droplets,     color: "text-teal-500",   bg: "bg-teal-50 dark:bg-teal-950/60",   border: "border-teal-200/50 dark:border-teal-900/50",
    desc: "Premium finishes that last a lifetime.",
    sops: ["Wall preparation & crack filling", "Putty application (2 coats)", "Primer & base coat standards", "Final coat application", "Touch-up & quality check"],
  },
  {
    id: "safety",     title: "Safety & QA",       icon: ShieldCheck,  color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/60",   border: "border-rose-200/50 dark:border-rose-900/50",
    desc: "Zero-compromise safety and quality assurance.",
    sops: ["Daily safety briefing protocol", "PPE compliance checklist", "Material quality audit", "Incident reporting system", "Weekly safety inspection"],
  },
];

export default function GuestProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [activeAgency, setActiveAgency] = useState<string | null>(null);

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000')] bg-cover bg-center scale-105 opacity-[0.02] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white/80 to-indigo-50/20 dark:from-slate-950 dark:via-slate-950/90 dark:to-indigo-950/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 text-left space-y-6">
          <div className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-4.5 py-1.5 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] font-mono">Our Proven Methodology</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Our Working <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic font-serif">Process</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed font-sans">
              Transparent, systematic, and quality-driven — every project follows our proven Standard Operating Procedures.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px] -mr-40 -mt-40" />
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Step Navigation */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/50">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono">Phase by Phase</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Six Stages of <br /><span className="text-indigo-600 dark:text-indigo-400 font-serif italic">Excellence</span></h2>
            </div>

            <div className="space-y-4 relative pl-2">
              <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              {STEPS.map((step, idx) => (
                <div key={step.step} className="group relative">
                  <button
                    onClick={() => setOpenStep(openStep === idx ? null : idx)}
                    className={cn(
                      "w-full text-left p-6 rounded-[2rem] transition-all duration-300 flex items-center justify-between border font-sans relative z-10",
                      openStep === idx 
                        ? "bg-white dark:bg-slate-900 border-indigo-500/50 dark:border-indigo-500/35 shadow-xl translate-x-2" 
                        : "bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200/50 dark:hover:border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <span className={cn(
                        "text-lg font-black tabular-nums transition-colors duration-300 font-mono",
                        openStep === idx ? "text-indigo-600 dark:text-indigo-400" : "text-slate-200 dark:text-slate-800 group-hover:text-indigo-200"
                      )}>{step.step}</span>
                      <span className={cn("text-sm font-bold tracking-tight font-sans text-slate-800 dark:text-slate-200", openStep === idx ? "text-slate-950 dark:text-white font-extrabold" : "")}>{step.title}</span>
                    </div>
                    {openStep === idx ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-slate-350" />}
                  </button>
                  
                  {openStep === idx && (
                    <div className="mt-4 p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/40 dark:border-slate-800/40 animate-in slide-in-from-top-4 duration-300 space-y-6 ml-4 shadow-lg relative z-20">
                      <p className="text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed italic font-serif">"{step.desc}"</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {step.details.map(detail => (
                          <div key={detail} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/60 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">{detail}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-4 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-950/60 w-fit px-5 py-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        Duration: {step.duration}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Agency Network */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-white/80 dark:bg-slate-900/50 rounded-[3rem] p-10 md:p-12 border border-slate-200/50 dark:border-slate-800/50 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/50">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono">Our Specialized Crew</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Expert Agency <br /><span className="text-indigo-600 dark:text-indigo-400 font-serif italic">Network</span></h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  We collaborate with verified specialized structural, piping, and electrical agencies to monitor compliance checklist points.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {AGENCIES.map(agency => (
                  <button
                    key={agency.id}
                    onClick={() => setActiveAgency(activeAgency === agency.id ? null : agency.id)}
                    className={cn(
                      "p-6 rounded-[2.5rem] border transition-all duration-300 space-y-5 group relative overflow-hidden text-left w-full",
                      activeAgency === agency.id 
                        ? "bg-white dark:bg-slate-900 border-indigo-500/50 dark:border-indigo-500/35 shadow-xl" 
                        : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm", agency.bg, "group-hover:scale-105 shadow-md")}>
                      <agency.icon className={cn("w-6 h-6", agency.color)} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{agency.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">{agency.desc}</p>
                    </div>
                    
                    {activeAgency === agency.id && (
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                        <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 font-mono">Core Standard SOPs:</p>
                        <div className="space-y-3">
                          {agency.sops.map(sop => (
                            <div key={sop} className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 tracking-tight leading-none">{sop}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Commitment Banner */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 p-10 md:p-14 text-center space-y-8 shadow-2xl border border-slate-900">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 mx-auto bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Zero Compromise Quality</h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
                  Every stage of our process includes multiple quality audits and safety checks to ensure your project stands the test of time.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  {[["Daily Reports", "✓"], ["Site Photos", "★"], ["Material Tests", "♦"]].map(([label, icon]) => (
                    <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-5 py-2 rounded-xl">
                      <span className="text-indigo-400 font-black text-xs font-mono">{icon}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
