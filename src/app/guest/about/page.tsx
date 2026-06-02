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
  { name: "Arch. Sarah Connor", role: "Lead Architect",    exp: "12 yrs", initials: "SC", color: "bg-indigo-600" },
  { name: "John Doe",           role: "Director",          exp: "6 yrs",  initials: "JD", color: "bg-slate-700" },
  { name: "Ali Hassan",         role: "Interior Designer", exp: "9 yrs",  initials: "AH", color: "bg-blue-600" },
  { name: "Mike Ross",          role: "Site Supervisor",   exp: "8 yrs",  initials: "MR", color: "bg-emerald-600" },
  { name: "Priya Sharma",       role: "Civil Engineer",    exp: "5 yrs",  initials: "PS", color: "bg-purple-600" },
  { name: "Robert Paulson",     role: "Structural Expert", exp: "7 yrs",  initials: "RP", color: "bg-rose-600" },
];

const VALUES = [
  { icon: Target, title: "Precision",   desc: "Every measurement, every detail — executed with engineering-grade accuracy.",         color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: Heart,  title: "Passion",     desc: "We pour our heart into every project, treating each build as our own home.",          color: "text-rose-600",   bg: "bg-rose-50" },
  { icon: Award,  title: "Excellence",  desc: "Award-winning designs backed by decades of construction expertise.",                  color: "text-amber-600",  bg: "bg-amber-50" },
  { icon: Zap,    title: "Innovation",  desc: "Cutting-edge technology meets traditional craftsmanship in every project.",           color: "text-blue-600",   bg: "bg-blue-50" },
];

const TESTIMONIALS = [
  { name: "Alice Johnson",  project: "Modern Villa",           text: "Arkiton transformed our vision into a stunning reality. The attention to detail and professionalism was unmatched.", rating: 5 },
  { name: "Bob Smith",      project: "City Heights Apartment", text: "From design to execution, every step was handled with precision. We couldn't be happier with the results.",         rating: 5 },
  { name: "Charlie Brown",  project: "Lakeview Residence",     text: "The team's expertise and dedication made our dream home a reality. Highly recommend Arkiton!",                      rating: 5 },
];

export default function GuestAboutPage() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 overflow-hidden min-h-[65vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-900/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/50">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight">ARKITON</h1>
                <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mt-1">Design · Build · Inspire</p>
              </div>
            </div>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              Redefining construction through{" "}
              <span className="text-white font-bold">design excellence</span> and{" "}
              <span className="text-white font-bold">technical precision</span>.
              We build more than structures — we build legacies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/guest/portfolio"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-900/50 group">
                Explore Our Work <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/guest/process"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-8 rounded-2xl transition-all">
                Our Process
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Tabs ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-3 text-sm font-bold whitespace-nowrap rounded-xl transition-all",
                  activeTab === tab.id
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* ── About Tab ── */}
        {activeTab === "about" && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Who We Are</span>
                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                  Building the Future,<br />One Project at a Time
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Arkiton is a premier design-build firm committed to transforming architectural visions into structural realities. Founded on the principles of innovation, precision, and client-first service, we have delivered over 50 landmark projects across India.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Our integrated approach combines architecture, interior design, civil engineering, and project management under one roof — ensuring seamless execution from concept to completion.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[["50+", "Projects"], ["12+", "Years"], ["200+", "Clients"]].map(([val, label]) => (
                    <div key={label} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                      <p className="text-3xl font-black text-indigo-600">{val}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, title: "Architecture",  desc: "Award-winning residential & commercial designs" },
                  { icon: Rocket,    title: "Innovation",    desc: "Cutting-edge construction technology" },
                  { icon: Users,     title: "Expert Team",   desc: "50+ certified professionals" },
                  { icon: Award,     title: "Quality",       desc: "ISO certified construction standards" },
                ].map(item => (
                  <div key={item.title} className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 space-y-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <item.icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-black text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
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
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">The People Behind the Work</span>
              <h2 className="text-4xl font-black text-slate-900">Meet Our Team</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Passionate professionals dedicated to delivering architectural excellence.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {TEAM.map(member => (
                <div key={member.name}
                  className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 text-center space-y-4">
                  <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto shadow-lg group-hover:scale-110 transition-transform", member.color)}>
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mt-0.5">{member.role}</p>
                    <p className="text-xs text-slate-400 mt-1">{member.exp} experience</p>
                  </div>
                  <div className="flex justify-center gap-0.5">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-base">★</span>)}
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
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">What Drives Us</span>
              <h2 className="text-4xl font-black text-slate-900">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALUES.map(v => (
                <div key={v.title}
                  className="group flex gap-6 p-8 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", v.bg)}>
                    <v.icon className={cn("w-8 h-8", v.color)} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">{v.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-indigo-600 rounded-3xl p-10 text-white text-center space-y-4">
              <h3 className="text-2xl font-black">Our Mission</h3>
              <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
                To deliver world-class construction solutions that exceed client expectations, while maintaining the highest standards of quality, safety, and sustainability.
              </p>
            </div>
          </div>
        )}

        {/* ── Testimonials Tab ── */}
        {activeTab === "testimonials" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Client Stories</span>
              <h2 className="text-4xl font-black text-slate-900">What Our Clients Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(t => (
                <div key={t.name}
                  className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 space-y-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed italic text-base">"{t.text}"</p>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.project}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Contact CTA ── */}
      <div className="bg-slate-900 py-20 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-black text-white">Ready to start your project?</h2>
          <p className="text-slate-400 text-lg">Get in touch with our team for a free consultation.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl">
              <Phone className="w-4 h-4" /> +91 98765 43210
            </a>
            <a href="mailto:hello@archisite.pro"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-10 rounded-2xl transition-all">
              <Mail className="w-4 h-4" /> hello@archisite.pro
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
