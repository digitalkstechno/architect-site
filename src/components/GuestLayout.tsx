"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Phone, Mail, MapPin, Menu, X, LogOut, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/guest/home" },
  { label: "Portfolio", href: "/guest/portfolio" },
  { label: "About Arkiton", href: "/guest/about" },
  { label: "Our Process", href: "/guest/process" },
];

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-indigo-500 selection:text-white">

      {/* ── Public Header ── */}
      <header 
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled 
            ? "top-3 md:top-4 max-w-7xl mx-auto px-4 md:px-8" 
            : "top-0 w-full"
        )}
      >
        <div 
          className={cn(
            "w-full transition-all duration-500 flex items-center justify-between",
            scrolled 
              ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-premium rounded-2xl px-6 h-16 md:h-18" 
              : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/50 px-6 md:px-12 h-20"
          )}
        >
          {/* Logo */}
          <Link href="/guest/home" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-indigo-200 dark:shadow-none">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
              ARKITON
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 font-mono border relative overflow-hidden group",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200/50 dark:border-indigo-900/60 shadow-sm shadow-indigo-100/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-indigo-605 dark:hover:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border-transparent hover:border-indigo-100/20 dark:hover:border-indigo-900/20"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805/60 px-4 py-2 rounded-2xl shadow-sm hover:shadow transition-all duration-300">
              <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-[11px] font-black text-white font-mono shadow-sm">
                {user?.name?.[0] ?? "G"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-850 dark:text-slate-200 leading-none">{user?.name ?? "Guest User"}</span>
                <div className="flex items-center gap-1.5 mt-1 leading-none">
                  <span className="text-[8px] text-indigo-550 dark:text-indigo-400 font-black uppercase tracking-wider font-mono">Guest Mode</span>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 transition-colors font-mono group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Exit
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden mt-2 mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-xl space-y-2 animate-in slide-in-from-top-4 duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all font-mono",
                  pathname === link.href
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-[10px] font-black text-white font-mono">
                  {user?.name?.[0] ?? "G"}
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name ?? "Guest User"}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                Exit Guest
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 pt-24">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

            {/* Brand Column */}
            <div className="md:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  ARKITON
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-md text-slate-500 dark:text-slate-400 font-sans">
                Redefining modern spaces through engineering precision and artistic design. We translate complex visions into durable, stunning architectural legacies.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
                  Currently accepting new projects
                </span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] font-mono">
                Quick Navigation
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-sans flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] font-mono">
                Contact Details
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  hello@archisite.pro
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>123 Design Hub, Ahmedabad, GJ</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
              © 2026 ARKITON DESIGN STUDIO. All rights reserved.
            </p>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 px-5 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">
                Guest Mode
              </p>
              <button 
                onClick={logout} 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest ml-2 underline decoration-2 underline-offset-4 font-mono transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
