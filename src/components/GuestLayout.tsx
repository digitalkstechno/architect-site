"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Phone, Mail, MapPin, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Public Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/guest/home" className="flex items-center gap-2.5 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">ArchiSite</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all font-mono",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 font-mono">
                {user?.name?.[0] ?? "G"}
              </div>
              <span className="font-bold text-slate-700">{user?.name ?? "Guest"}</span>
              <span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">Guest</span>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors font-mono"
            >
              <LogOut className="w-3 h-3" />
              Exit
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                  pathname === link.href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-4">
              <span className="text-sm font-medium text-slate-700">{user?.name ?? "Guest"}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-medium text-red-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Guest
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-50 border-t border-slate-100 text-slate-500">
        <div className="w-full px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">

            {/* Brand */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">ArchiSite</span>
              </div>
              <p className="text-base font-medium leading-relaxed max-w-md text-slate-400 font-sans">
                Redefining construction through design excellence and technical precision. We build more than structures — we build legacies.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-mono">Currently accepting new projects</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] font-mono">Quick Links</h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-bold hover:text-indigo-600 transition-colors font-sans">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] font-mono">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-600 font-sans">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-600 font-sans">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  hello@archisite.pro
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-slate-600 font-sans">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  123 Design Hub, Ahmedabad
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[11px] font-bold text-slate-400 font-mono">© 2026 ArchiSite. All rights reserved.</p>
            <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-mono">
                Guest Mode
              </p>
              <button onClick={logout} className="text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest ml-2 underline decoration-2 underline-offset-4 font-mono">Sign in</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
