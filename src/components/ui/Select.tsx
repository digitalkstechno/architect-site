"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  className,
  disabled = false,
  searchable = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 ml-1">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          "relative w-full cursor-pointer rounded-xl border transition-all duration-200",
          "flex items-center justify-between px-4 py-2.5 bg-white",
          isOpen ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm" : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50",
          error && "border-red-500 focus:ring-red-500/10"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn(
          "text-sm font-medium truncate",
          !selectedOption ? "text-slate-400" : "text-slate-700"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 transition-transform duration-200",
          isOpen && "rotate-180 text-indigo-500"
        )} />
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
          )}
          
          <div 
            ref={listRef}
            className="max-h-[220px] overflow-y-auto py-1 overscroll-contain select-none"
            style={{ scrollbarWidth: 'thin' }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-xs text-slate-500 text-center italic">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-all",
                    value === option.value ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50",
                    "group active:bg-indigo-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                >
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "font-semibold truncate text-xs",
                      value === option.value ? "text-indigo-700" : "text-slate-900"
                    )}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[10px] text-slate-500 truncate group-hover:text-slate-600 mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
