import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95",
      outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-95",
      danger: "bg-red-600 text-white shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95",
      white: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs font-bold rounded-xl",
      md: "px-6 py-2.5 text-sm font-bold rounded-xl",
      lg: "px-8 py-3.5 text-base font-bold rounded-2xl",
      icon: "p-2.5 rounded-xl",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
