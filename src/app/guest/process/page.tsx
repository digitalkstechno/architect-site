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
    id: "plumbing",   title: "Plumbing Agency",   icon: Droplets,    color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",
    desc: "Complete water supply, drainage, and sanitation solutions.",
    sops: ["Water line layout & pressure testing", "Drainage mapping & slope calculation", "Fixture installation standards", "Leak detection & waterproofing", "Hot water system installation"],
  },
  {
    id: "electrical", title: "Electrical Agency", icon: Zap,          color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",
    desc: "Safe and efficient electrical systems for every project.",
    sops: ["Conduit placement & routing", "Wiring safety protocols (IS standards)", "Point distribution & load calculation", "MCB & earthing installation", "Testing & commissioning"],
  },
  {
    id: "structure",  title: "Structure Agency",  icon: Hammer,       color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200",
    desc: "Structural integrity from foundation to roof.",
    sops: ["Column casting & curing schedule", "Beam reinforcement standards", "Slab thickness & mix design", "Shuttering & de-shuttering timeline", "Quality cube testing"],
  },
  {
    id: "interior",   title: "Interior Agency",   icon: PenTool,      color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",
    desc: "Transforming spaces with precision and style.",
    sops: ["Furniture framing & dimensions", "False ceiling height standards", "Finishing quality checklist", "Material selection process", "Final snag inspection"],
  },
  {
    id: "painting",   title: "Painting Agency",   icon: Droplets,     color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-200",
    desc: "Premium finishes that last a lifetime.",
    sops: ["Wall preparation & crack filling", "Putty application (2 coats)", "Primer & base coat standards", "Final coat application", "Touch-up & quality check"],
  },
  {
    id: "safety",     title: "Safety & QA",       icon: ShieldCheck,  color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",
    desc: "Zero-compromise safety and quality assurance.",
    sops: ["Daily safety briefing protocol", "PPE compliance checklist", "Material quality audit", "Incident reporting system", "Weekly safety inspection"],
  },
];

export default function GuestProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [activeAgency, setActiveAgency] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in duration-700 selection:bg-indigo-500 selection:text-white bg-white font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000')] bg-cover bg-center scale-105 opacity-[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-indigo-50/50" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 py-20 text-left space-y-8">
          <div className="inline-flex items-center gap-2.5 bg-white px-4 py-1.5 rounded-full shadow-sm border border-indigo-50/50">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.3em] font-mono">Our Proven Methodology</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight font-sans">
              Our Working <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 italic font-serif">Process</span>
            </h1>
            <p className="text-base text-slate-500 max-w-3xl font-medium leading-relaxed font-sans">
              Transparent, systematic, and quality-driven — every project follows our proven Standard Operating Procedures.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -mr-48 -mt-48" />
      </section>

      <main className="w-full px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Step Navigation */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest font-mono">Phase by Phase</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight font-sans">Six Stages of <br /><span className="text-indigo-600">Excellence</span></h2>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, idx) => (
                <div key={step.step} className="group">
                  <button
                    onClick={() => setOpenStep(openStep === idx ? null : idx)}
                    className={cn(
                      "w-full text-left p-6 rounded-[2rem] transition-all duration-300 flex items-center justify-between border",
                      openStep === idx 
                        ? "bg-white border-indigo-600 shadow-xl shadow-indigo-50 translate-x-2" 
                        : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <span className={cn(
                        "text-lg font-black tabular-nums transition-colors duration-300 font-mono",
                        openStep === idx ? "text-indigo-400" : "text-slate-200 group-hover:text-indigo-200"
                      )}>{step.step}</span>
                      <span className={cn("text-base font-bold tracking-tight font-sans", openStep === idx ? "text-slate-900" : "")}>{step.title}</span>
                    </div>
                    {openStep === idx ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                  </button>
                  
                  {openStep === idx && (
                    <div className="mt-4 p-8 bg-white rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4 duration-300 space-y-6 ml-4 shadow-lg shadow-indigo-50">
                      <p className="text-lg text-slate-500 font-medium leading-relaxed italic font-serif">"{step.desc}"</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {step.details.map(detail => (
                          <div key={detail} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="text-sm font-bold text-slate-700 tracking-tight font-sans">{detail}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-4 text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] bg-indigo-50 w-fit px-5 py-2.5 rounded-xl border border-indigo-100 font-mono">
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
            <div className="bg-slate-50/50 rounded-[3rem] p-10 md:p-12 border border-slate-100 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">Our Partners</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-sans">Expert Agency <br /><span className="text-indigo-600">Network</span></h2>
                <p className="text-base text-slate-500 font-medium leading-relaxed font-sans">
                  We collaborate with verified specialized agencies to ensure every aspect of your project is handled by experts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {AGENCIES.map(agency => (
                  <button
                    key={agency.id}
                    onClick={() => setActiveAgency(activeAgency === agency.id ? null : agency.id)}
                    className={cn(
                      "p-6 rounded-[2.5rem] border transition-all duration-300 space-y-5 group relative overflow-hidden",
                      activeAgency === agency.id 
                        ? "bg-white border-indigo-600 shadow-xl" 
                        : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm", agency.bg, "group-hover:scale-105 shadow-md shadow-indigo-50")}>
                      <agency.icon className={cn("w-6 h-6", agency.color)} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight font-sans">{agency.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 font-sans">{agency.desc}</p>
                    </div>
                    
                    {activeAgency === agency.id && (
                      <div className="pt-6 border-t border-slate-100 animate-in fade-in duration-300">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4 font-mono">Core SOPs:</p>
                        <div className="space-y-3">
                          {agency.sops.map(sop => (
                            <div key={sop} className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              <span className="text-xs font-bold text-slate-700 tracking-tight font-sans">{sop}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Commitment */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 p-10 md:p-16 text-center space-y-8 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 mx-auto bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">Zero Compromise Quality</h3>
                <p className="text-base text-slate-400 leading-relaxed font-medium font-sans">
                  Every stage of our process includes multiple quality audits and safety checks to ensure your project stands the test of time.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  {[["Daily Reports", "✓"], ["Site Photos", "★"], ["Material Tests", "♦"]].map(([label, icon]) => (
                    <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-xl">
                      <span className="text-indigo-400 font-black text-base font-mono">{icon}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">{label}</span>
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
