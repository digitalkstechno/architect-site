"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          ref={ref}
          {...props} 
        />
        <div className={cn(
          "w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer",
          "peer-checked:after:translate-x-full peer-checked:after:border-white",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:border-slate-300 after:border after:rounded-full",
          "after:h-5 after:w-5 after:transition-all",
          "peer-checked:bg-indigo-600 shadow-inner",
          className
        )}></div>
      </label>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
