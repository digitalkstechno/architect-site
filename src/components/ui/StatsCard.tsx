import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("p-6 flex items-start gap-4", className)}>
      <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-medium font-mono tracking-tight text-slate-900">{value}</h4>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.isUp ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.isUp ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-400 font-normal">{description}</p>}
      </div>
    </Card>
  );
}
