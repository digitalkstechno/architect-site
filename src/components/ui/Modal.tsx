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
        "w-[95vw] max-w-lg bg-white rounded-lg shadow-xl border border-slate-200",
        "animate-in zoom-in-95 duration-200",
        className
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <h3 className="text-base font-medium text-slate-900 tracking-tight">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
}
