"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
        "w-[90vw] max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200",
        "animate-in zoom-in-95 duration-300",
        className
      )}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
}
