import React from "react";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ActionButtonsProps {
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onExpand?: (e: React.MouseEvent) => void;
  isExpanded?: boolean;
  hasEdit?: boolean;
  hasDelete?: boolean;
  hasExpand?: boolean;
  viewHref?: string;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onExpand,
  isExpanded = false,
  hasEdit = true,
  hasDelete = true,
  hasExpand = false,
  viewHref,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {viewHref && (
        <Link
          href={viewHref}
          className="h-8 w-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors flex items-center justify-center shadow-sm border border-indigo-100"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      )}

      {hasEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors shadow-sm border border-amber-100"
          onClick={onEdit}
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      )}
      
      {hasDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors shadow-sm border border-red-100"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}


      {hasExpand && onExpand && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-colors shadow-sm border",
            isExpanded 
              ? "bg-indigo-600 text-white border-indigo-600" 
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border-indigo-100"
          )}
          onClick={onExpand}
          title={isExpanded ? "Hide Details" : "View Details"}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
