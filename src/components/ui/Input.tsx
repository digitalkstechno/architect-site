import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative group w-full space-y-1.5">
        <div className="relative">
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
          )}
          <input
            type={type}
            className={cn(
              "w-full bg-white border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50 shadow-sm",
              Icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5",
              error 
                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" 
                : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
