"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Users, Rocket, Award, Target, Heart, Zap,
  ArrowRight, CheckCircle2, Phone, Mail, Star, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "about",        label: "About Us" },
  { id: "team",         label: "Our Team" },
  { id: "values",       label: "Our Values" },
  { id: "testimonials", label: "Testimonials" },
];

const TEAM = [
  { name: "Arch. Sarah Connor", role: "Lead Architect",    exp: "12 yrs", initials: "SC", color: "from-indigo-600 to-blue-600" },
  { name: "John Doe",           role: "Director",          exp: "6 yrs",  initials: "JD", color: "from-slate-700 to-slate-900" },
  { name: "Ali Hassan",         role: "Interior Designer", exp: "9 yrs",  initials: "AH", color: "from-blue-500 to-indigo-600" },
  { name: "Mike Ross",          role: "Site Supervisor",   exp: "8 yrs",  initials: "MR", color: "from-emerald-600 to-teal-750" },
  { name: "Priya Sharma",       role: "Civil Engineer",    exp: "5 yrs",  initials: "PS", color: "from-purple-600 to-indigo-700" },
  { name: "Robert Paulson",     role: "Structural Expert", exp: "7 yrs",  initials: "RP", color: "from-rose-600 to-orange-600" },
];

const VALUES = [
  { icon: Target, title: "Precision",   desc: "Every measurement, every detail — executed with engineering-grade accuracy.",         color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/60" },
  { icon: Heart,  title: "Passion",     desc: "We pour our heart into every project, treating each build as our own home.",          color: "text-rose-600 dark:text-rose-450",   bg: "bg-rose-50 dark:bg-rose-950/60" },
  { icon: Award,  title: "Excellence",  desc: "Award-winning designs backed by decades of construction expertise.",                  color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/60" },
  { icon: Zap,    title: "Innovation",  desc: "Cutting-edge technology meets traditional craftsmanship in every project.",           color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/60" },
];

const TESTIMONIALS = [
  { name: "Alice Johnson",  project: "Modern Villa",           text: "Arkiton transformed our vision into a stunning reality. The attention to detail and professionalism was unmatched.", rating: 5 },
  { name: "Bob Smith",      project: "City Heights Apartment", text: "From design to execution, every step was handled with precision. We couldn't be happier with the results.",         rating: 5 },
  { name: "Charlie Brown",  project: "Lakeview Residence",     text: "The team's expertise and dedication made our dream home a reality. Highly recommend Arkiton!",                      rating: 5 },
];

export default function GuestAboutPage() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen font-sans">

      {/* ── Hero ── */}
      <div className="relative bg-slate-950 overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-indigo-950/30" />
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/50">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">ARKITON STUDIO</h1>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1 font-mono">Design · Build · Inspire</p>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-white/30 leading-relaxed max-w-2xl font-medium">
              Redefining construction through <span className="text-white font-black">design excellence</span> and <span className="text-white font-black">technical precision</span>. We build more than structures — we build architectural legacies.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/guest/portfolio"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest font-mono group">
                Explore Our Work <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/guest/process"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-8 rounded-2xl transition-all text-xs uppercase tracking-widest font-mono">
                Our Process
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="sticky top-20 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all font-mono whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">

        {/* ── About Tab ── */}
        {activeTab === "about" && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">Who We Are</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  Building the Future,<br />
                  One Masterpiece at a Time.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                  Arkiton is a premier design-build firm committed to transforming architectural visions into structural realities. Founded on the principles of innovation, precision, and client-first service, we have delivered over 52 landmark projects across Western India.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Our integrated workflow combines architecture design, structural blueprints, civil construction, and interior styling under one roof — ensuring zero loss of information and precise execution.
                </p>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[["52+", "Projects Done"], ["12+", "Years Experience"], ["240+", "Happy Clients"]].map(([val, label]) => (
                    <div key={label} className="text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/30 transition-all shadow-sm">
                      <p className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">{val}</p>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 leading-none">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, title: "Architecture",  desc: "Award-winning residential & commercial layouts" },
                  { icon: Rocket,    title: "Innovation",    desc: "Advanced standard operating procedures" },
                  { icon: Users,     title: "Expert Crew",   desc: "Highly experienced certified supervisors" },
                  { icon: Award,     title: "Top Quality",   desc: "Stringent quality material testing norms" },
                ].map(item => (
                  <div key={item.title} className="group p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 space-y-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                      <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Team Tab ── */}
        {activeTab === "team" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">Our Brain Trust</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Meet Our Core Team</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto font-medium">Passionate designers and engineers dedicated to premium execution.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {TEAM.map(member => (
                <div key={member.name}
                  className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-8 hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/30 hover:-translate-y-1.5 transition-all duration-500 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={cn("relative w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md bg-gradient-to-tr transition-transform duration-500 group-hover:scale-110 font-mono", member.color)}>
                      {member.initials}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{member.name}</h3>
                    <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400">{member.role}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono font-black mt-1 bg-slate-50 dark:bg-slate-950 w-fit mx-auto px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800/45">{member.exp} experience</p>
                  </div>
                  <div className="flex justify-center gap-0.5 pt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Values Tab ── */}
        {activeTab === "values" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">Core Pillars</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">What Drives Us</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALUES.map(v => (
                <div key={v.title}
                  className="group flex gap-6 p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform", v.bg)}>
                    <v.icon className={cn("w-7 h-7", v.color)} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{v.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 dark:from-slate-900/60 dark:to-indigo-950/30 rounded-[2.5rem] p-10 md:p-14 text-white text-center space-y-4 shadow-xl relative overflow-hidden border border-slate-800/40">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl md:text-3xl font-black">Our Ultimate Mission</h3>
                <p className="text-indigo-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium font-sans">
                  To deliver premium, durable, and highly functional construction solutions that exceed client expectations, while maintaining transparent site updates and ISO-grade structural checks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Testimonials Tab ── */}
        {activeTab === "testimonials" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">Client Validation</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Client Endorsements</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(t => (
                <div key={t.name}
                  className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-8 hover:shadow-2xl hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 space-y-6 flex flex-col justify-between min-h-[300px]">
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic font-serif">"{t.text}"</p>
                  </div>
                  
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xs font-mono">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-900 dark:text-white tracking-tight">{t.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mt-0.5">{t.project}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Contact CTA ── */}
      <div className="bg-slate-950 py-20 mt-8 relative overflow-hidden border-t border-slate-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Ready to Start Your Project?</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto font-medium">Get in touch with Arkiton Design Studio for a detailed layout estimate and consultation.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-3 bg-white text-slate-950 hover:bg-slate-50 font-black py-4.5 px-8 rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest font-mono">
              <Phone className="w-4 h-4 text-indigo-600" /> +91 98765 43210
            </a>
            <a href="mailto:hello@archisite.pro"
              className="inline-flex items-center justify-center gap-3 border border-white/20 text-white hover:bg-white/10 font-black py-4.5 px-8 rounded-2xl transition-all text-xs uppercase tracking-widest font-mono">
              <Mail className="w-4 h-4 text-indigo-400" /> hello@archisite.pro
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
