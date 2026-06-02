"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Modal from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const variantColors = {
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white",
    warning: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white",
    info: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white",
  };

  const buttonVariants = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-100",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-1 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
            variant === 'danger' ? 'bg-red-50 border-red-100 text-red-600' :
            variant === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
            'bg-indigo-50 border-indigo-100 text-indigo-600'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none">{title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-bold uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-slate-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={`text-xs font-bold uppercase tracking-widest h-10 px-8 rounded-xl text-white shadow-lg transition-all active:scale-95 ${buttonVariants[variant]}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
