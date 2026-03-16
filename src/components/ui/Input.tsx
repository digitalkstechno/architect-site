import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-white border border-slate-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50 shadow-sm",
            Icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
