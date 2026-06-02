import * as React from "react";
import { Badge } from "./Badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  if (s === "completed" || s === "paid" || s === "ho gaya" || s === "present") {
    return <Badge variant="success" className={className}>{status}</Badge>;
  }
  
  if (s === "in progress" || s === "chalu hai" || s === "pending") {
    return <Badge variant="info" className={className}>{status}</Badge>;
  }
  
  if (s === "absent" || s === "overdue" || s === "unpaid") {
    return <Badge variant="destructive" className={className}>{status}</Badge>;
  }
  
  if (s === "half-day" || s === "planned" || s === "baki hai") {
    return <Badge variant="warning" className={className}>{status}</Badge>;
  }

  return <Badge variant="secondary" className={className}>{status}</Badge>;
}
