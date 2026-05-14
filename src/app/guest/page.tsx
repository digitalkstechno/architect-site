"use client";

import { Building2, ArrowLeft, ExternalLink, Phone, Mail, MapPin, Star, CheckCircle, ArrowRight, Play, Users, Award, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const portfolioItems = [
  { title: "Modern Villa", category: "Residential", image: "/placeholder1.jpg", year: "2025" },
  { title: "Corporate Tower", category: "Commercial", image: "/placeholder2.jpg", year: "2024" },
  { title: "Urban Loft", category: "Interior", image: "/placeholder3.jpg", year: "2024" },
  { title: "Eco Retreat", category: "Sustainable", image: "/placeholder4.jpg", year: "2023" },
];

const workingStyles = [
  { icon: Users, title: "Collaborative", description: "Work closely with clients and teams throughout the project lifecycle" },
  { icon: Award, title: "Quality-Focused", description: "Maintain highest standards in design, materials, and execution" },
  { icon: Clock, title: "Timely Delivery", description: "Committed to meeting deadlines without compromising quality" },
  { icon: CheckCircle, title: "Transparent Process", description: "Regular updates and clear communication at every stage" },
];

const projects = [
  { name: "Luxury Residential Complex", status: "Completed", year: "2025", award: "Best Design Award" },
  { name: "City Center Mall", status: "In Progress", year: "2024", award: null },
  { name: "Heritage Restoration", status: "Completed", year: "2023", award: "Heritage Excellence" },
  { name: "Smart Office Park", status: "In Progress", year: "2024", award: null },
];

export default function GuestDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.role !== "guest") {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className=" bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Arkiton</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-500">Guest Access</span>
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all"
              >
                Sign In
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold transition-all border border-indigo-100"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-8">
            <Star className="w-3.5 h-3.5" />
            Welcome to Arkiton
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Crafting Spaces That
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"> Inspire </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Explore our portfolio, discover our approach, and learn how we transform visions into architectural masterpieces.
          </p>
        </div>
      </section>

      {/* Work Portfolio */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Work Portfolio</h3>
              <p className="text-slate-500 font-medium mt-1">A showcase of our finest architectural achievements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {portfolioItems.map((item, index) => (
              <div
                key={index}
                className="group relative h-80 rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <span className="inline-block px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-lg">
                    {item.category}
                  </span>
                  <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-200 font-medium">{item.year}</p>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform translate-x-2 group-hover:translate-x-0">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arkiton Introduction */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">About Arkiton</h3>
                <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
                  <p>
                    Arkiton is a premier architectural firm dedicated to creating exceptional spaces that blend form, function, and beauty. With over a decade of experience, we have established ourselves as leaders in innovative design and construction excellence.
                  </p>
                  <p>
                    Our team of talented architects, designers, and project managers work collaboratively to deliver projects that exceed expectations while respecting budgets and timelines.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-4">
                <div className="space-y-1">
                  <div className="text-4xl font-black text-indigo-600">150+</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projects</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-indigo-600">12+</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Years</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-indigo-600">50+</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awards</div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 bg-slate-50 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5" />
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <div className="inline-flex p-6 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-200 mb-6">
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Watch Our Story</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Working Style */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Our Working Style</h3>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              We follow a proven methodology that ensures consistent quality and client satisfaction across all projects.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workingStyles.map((style, index) => (
              <div
                key={index}
                className="p-8 rounded-[2rem] border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
              >
                <div className="p-4 rounded-2xl bg-indigo-50 w-fit mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                  <style.icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{style.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{style.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects & Achievements */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Projects & Achievements</h3>
              <p className="text-slate-500 font-medium">
                A glimpse into our project portfolio and the recognition we have received.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{project.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.year}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        project.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}
                    >
                      {project.status}
                    </span>
                    {project.award && (
                      <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
                        <Award className="w-3.5 h-3.5" />
                        {project.award}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -ml-48 -mb-48" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Get in Touch</h3>
          <p className="text-indigo-100 mb-12 font-medium text-lg max-w-2xl mx-auto">
            Interested in working with us? Reach out through any of the channels below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <a
              href="tel:+1234567890"
              className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="p-4 rounded-2xl bg-white w-fit mx-auto mb-6 shadow-xl">
                <Phone className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="text-white font-bold mb-1 uppercase tracking-widest text-xs">Call Us</h4>
              <p className="text-white font-medium">+1 (234) 567-890</p>
            </a>
            <a
              href="mailto:info@arkiton.com"
              className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="p-4 rounded-2xl bg-white w-fit mx-auto mb-6 shadow-xl">
                <Mail className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="text-white font-bold mb-1 uppercase tracking-widest text-xs">Email Us</h4>
              <p className="text-white font-medium">info@arkiton.com</p>
            </a>
            <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300">
              <div className="p-4 rounded-2xl bg-white w-fit mx-auto mb-6 shadow-xl">
                <MapPin className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="text-white font-bold mb-1 uppercase tracking-widest text-xs">Visit Us</h4>
              <p className="text-white font-medium">123 Design Street, NY</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-600">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Arkiton</span>
            <span className="text-slate-400 text-xs font-medium ml-2">{"\u00a9"} 2025. All rights reserved.</span>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="group flex items-center gap-3 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
          >
            Sign In for Full Access
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
}
