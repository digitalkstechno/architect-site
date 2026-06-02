"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/projects-store";
import {
  ChevronRight, Phone, MapPin, ArrowRight, Star,
  Briefcase, HardHat, Users, PenTool, CheckCircle2,
  Play, X, Building2, Award, Zap, Heart, PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const c1 = useCounter(50, 1800, visible);
  const c2 = useCounter(12, 1500, visible);
  const c3 = useCounter(200, 2000, visible);
  const c4 = useCounter(98, 1600, visible);

  const stats = [
    { value: c1, suffix: "+", label: "Projects Delivered", icon: Building2 },
    { value: c2, suffix: "+", label: "Years Experience", icon: Award },
    { value: c3, suffix: "+", label: "Happy Clients", icon: Heart },
    { value: c4, suffix: "%", label: "On-Time Delivery", icon: Zap },
  ];

  return (
    <div ref={ref} className="bg-white py-16 relative overflow-hidden border-y border-slate-100">
      <div className="w-full px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="group space-y-3">
              <div className="w-12 h-12 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="space-y-0">
                <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter font-mono">
                  {s.value}{s.suffix}
                </p>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest font-sans">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function GuestHomePage() {
  const { projects } = useProjects();
  const [activeService, setActiveService] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const services = [
    {
      icon: Briefcase, title: "Residential Villas",
      desc: "Custom luxury homes designed to reflect your lifestyle. From compact 2BHK to sprawling 5BHK villas — we craft every detail.",
      features: ["Custom floor plans", "3D visualization", "Premium materials", "Interior design included"],
      color: "bg-indigo-600",
    },
    {
      icon: Building2, title: "Commercial Spaces",
      desc: "Modern offices, retail outlets, and commercial complexes built to impress clients and maximize productivity.",
      features: ["Space optimization", "Modern aesthetics", "Structural safety", "On-time delivery"],
      color: "bg-blue-600",
    },
    {
      icon: PenTool, title: "Interior Design",
      desc: "End-to-end interior solutions — from concept boards to final handover. Every room tells your story.",
      features: ["Concept to completion", "Furniture planning", "Lighting design", "Material selection"],
      color: "bg-indigo-500",
    },
    {
      icon: HardHat, title: "Turnkey Construction",
      desc: "Full-service construction management. We handle everything from foundation to the final coat of paint.",
      features: ["Project management", "Quality control", "Material sourcing", "Vendor coordination"],
      color: "bg-slate-800",
    },
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-0 selection:bg-indigo-500 selection:text-white font-sans">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-white">
        {/* Background Image with Light Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-indigo-50/20" />
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000" />

        <div className="relative z-10 w-full px-6 md:px-12 py-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2.5 bg-white px-4 py-1.5 rounded-full shadow-sm border border-indigo-50/50">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.2em] font-mono">Pioneering Architectural Excellence</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
                Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Futures</span>,<br />
                Building <span className="italic font-serif text-indigo-600">Legacies</span>.
              </h1>
              <p className="text-base text-slate-500 leading-relaxed max-w-xl font-medium">
                Arkiton is a premier design-build firm committed to transforming architectural visions into structural realities through innovation and precision.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/guest/portfolio" 
                className="group relative inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-7 rounded-xl transition-all shadow-lg shadow-indigo-100 hover:-translate-y-0.5 text-xs uppercase tracking-widest">
                Explore Portfolio 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => setVideoOpen(true)}
                className="group inline-flex items-center gap-3 text-slate-700 font-bold py-3.5 px-7 rounded-xl transition-all hover:bg-slate-50 border border-slate-200 bg-white text-xs uppercase tracking-widest">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-indigo-600 text-indigo-600 ml-0.5" />
                </div>
                Watch Our Story
              </button>
            </div>

            <div className="flex items-center gap-6 pt-10 border-t border-slate-100 max-w-lg">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shadow-sm font-mono">
                  500+
                </div>
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-widest font-mono">Trusted by 500+ Clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-indigo-100 to-indigo-500" />
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.3em] font-mono">Scroll</span>
        </div>
      </section>

      <AnimatedStats />

      {/* ── Services Section ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest font-mono">Our Expertise</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Comprehensive <br />
                <span className="text-indigo-600 font-serif italic">Architecture</span> Solutions
              </h2>
            </div>
            <p className="text-slate-500 text-base font-medium max-w-sm leading-relaxed pb-2 border-l-2 border-indigo-600 pl-6 font-sans">
              From conceptual sketches to the final brick, we provide a seamless, end-to-end construction experience.
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
                    "w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center justify-between group border",
                    activeService === idx 
                      ? "bg-white border-indigo-600 shadow-lg shadow-indigo-50 translate-x-2" 
                      : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                      activeService === idx ? "bg-indigo-600 text-white" : "bg-white text-slate-300 group-hover:text-indigo-600"
                    )}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={cn("text-base font-bold tracking-tight font-sans", activeService === idx ? "text-slate-900" : "")}>{s.title}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-all duration-300",
                    activeService === idx ? "translate-x-0 opacity-100 text-indigo-600" : "-translate-x-2 opacity-0"
                  )} />
                </button>
              ))}
            </div>

            {/* Service Display */}
            <div className="lg:col-span-8">
              <div className="relative h-full min-h-[400px] rounded-[2rem] overflow-hidden group shadow-xl shadow-indigo-50 border border-slate-100 bg-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-10" />
                
                <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1 rounded-full border border-indigo-100">
                      <span className="text-indigo-600 text-[9px] font-bold uppercase tracking-[0.2em] font-mono">Service Details</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {services[activeService].title}
                    </h3>
                    <p className="text-base text-slate-500 font-medium leading-relaxed max-w-2xl font-sans">
                      {services[activeService].desc}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {services[activeService].features.map(f => (
                        <div key={f} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
                          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 tracking-tight font-sans">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-8">
                    <Link href="/guest/portfolio" 
                      className="inline-flex items-center gap-3 bg-indigo-600 text-white font-bold py-3.5 px-7 rounded-xl transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:-translate-y-0.5 text-xs uppercase tracking-widest">
                      View Sample Projects <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Work ── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">Our Masterpieces</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Projects that speak for <br />
              <span className="text-indigo-600 font-serif italic">Themselves</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((p, idx) => (
              <div key={p.id} className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
                <div className="aspect-[4/5] overflow-hidden bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={cn(
                    "w-full h-full transition-transform duration-700 group-hover:scale-105 bg-gradient-to-br",
                    idx === 0 ? "from-indigo-100 to-blue-100" : idx === 1 ? "from-slate-100 to-indigo-50" : "from-blue-100 to-indigo-100"
                  )} />
                  
                  <div className="absolute top-6 right-6 z-20">
                    <div className="bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100">
                      <span className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] font-mono">{p.status}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 space-y-4">
                    <div className="space-y-2 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-indigo-400 group-hover:text-indigo-200 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">{p.location}</p>
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-white tracking-tight font-sans">{p.name}</h4>
                      <p className="text-slate-500 group-hover:text-indigo-100 text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 font-sans">
                        A unique architectural marvel blending modern design with structural innovation.
                      </p>
                    </div>
                    <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <Link href={`/guest/portfolio`} className="inline-flex items-center gap-2 text-indigo-600 group-hover:text-white font-bold text-[10px] uppercase tracking-[0.3em] font-mono">
                        View Case Study <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/guest/portfolio" 
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-9 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-xs uppercase tracking-widest">
              Explore All Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <Heart className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest font-mono">Client Stories</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
                  What our clients <br />
                  <span className="text-indigo-600 font-serif italic">say about us</span>
                </h2>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: "Alice Johnson", role: "Villa Owner", text: "Arkiton transformed our vision into a stunning reality. The attention to detail and professionalism was unmatched. Every corner of our home tells a story of their craftsmanship.", rating: 5 },
                  { name: "Bob Smith", role: "Real Estate Developer", text: "From design to execution, every step was handled with precision. We couldn't be happier with the results. They are true partners in construction.", rating: 5 }
                ].map((t, i) => (
                  <div key={t.name} className="p-7 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all duration-300 space-y-6">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-base text-slate-600 font-medium leading-relaxed italic font-serif">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-100 font-mono">
                        {t.name[0]}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 tracking-tight font-sans">{t.name}</h4>
                        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 font-mono">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-[12px] border-slate-50">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000" alt="Testimonial" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-indigo-600/5" />
                <button 
                  onClick={() => setVideoOpen(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform group">
                  <Play className="w-5 h-5 fill-indigo-600 text-indigo-600 ml-1" />
                </button>
              </div>
              
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-xl z-20 text-slate-900 space-y-4 max-w-[260px] border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Quality Guaranteed</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-bold font-sans">We maintain the highest standards of safety and structural integrity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="py-24 bg-white px-6 md:px-12">
        <div className="w-full">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 p-12 md:p-20 text-center space-y-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white text-slate-950 font-black py-5 px-10 rounded-2xl transition-all hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-0.5 text-base">
                <Phone className="w-5 h-5 text-indigo-600" />
                Contact Us Now
              </Link>
              <Link href="/guest/portfolio" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black py-5 px-10 rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-0.5 text-base">
                Explore More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setVideoOpen(false)} />
          <div className="relative z-10 w-full max-w-5xl aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setVideoOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-20">
              <X className="w-6 h-6" />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center text-white/5 space-y-6">
              <PlayCircle className="w-32 h-32" />
              <p className="text-white/20 text-xl font-black uppercase tracking-[0.5em] font-mono">Showreel Coming Soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
