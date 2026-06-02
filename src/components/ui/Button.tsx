import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "white";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/20 border border-primary-700",
      secondary: "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500/10",
      outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-slate-500/10 shadow-sm",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-slate-500/10",
      danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500/20 border border-red-700",
      success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/20 border border-emerald-700",
      white: "bg-white text-primary-600 shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-white/20 border border-transparent",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-md",
      md: "px-4 py-2 text-sm font-medium rounded-md",
      lg: "px-6 py-3 text-base font-medium rounded-md",
      icon: "p-2 rounded-md",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
