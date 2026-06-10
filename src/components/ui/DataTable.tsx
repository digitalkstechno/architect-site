import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical
} from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  pageSize?: number;
  serverTotalItems?: number;
  serverCurrentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  expandedRowId?: string | null;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  className,
  pageSize: initialPageSize = 10,
  serverTotalItems,
  serverCurrentPage,
  onPageChange,
  onPageSizeChange,
  renderExpandedRow,
  expandedRowId,
}: DataTableProps<T>) {
  const [localCurrentPage, setLocalCurrentPage] = React.useState(1);
  const [localPageSize, setLocalPageSize] = React.useState(initialPageSize);

  const isServerSide = serverTotalItems !== undefined;
  const currentPage = isServerSide ? (serverCurrentPage || 1) : localCurrentPage;
  const pageSize = isServerSide ? initialPageSize : localPageSize;

  const totalItems = isServerSide ? serverTotalItems : data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // If server-side, data is already sliced for the current page
  const currentData = isServerSide ? data : data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (isServerSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isServerSide && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setLocalPageSize(newSize);
      setLocalCurrentPage(1);
    }
  };

  React.useEffect(() => {
    if (!isServerSide) {
      setLocalCurrentPage(1);
    }
  }, [data, localPageSize, isServerSide]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "h-12 px-6 text-left align-middle font-bold text-slate-400 uppercase tracking-widest text-[10px]",
                    column.headerClassName,
                    column.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {index < columns.length - 1 && <MoreVertical className="w-3 h-3 text-slate-200" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <TableRow
                    className={cn(
                      "border-b border-slate-100 last:border-0 group transition-colors",
                      onRowClick && "cursor-pointer hover:bg-slate-50/80",
                      renderExpandedRow && expandedRowId === (row as any).id && "bg-slate-50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn("py-4 px-6", column.cellClassName, column.className)}
                      >
                        {column.render
                          ? column.render(row)
                          : column.accessorKey
                            ? (row[column.accessorKey] as React.ReactNode)
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderExpandedRow && expandedRowId === (row as any).id && (
                    <TableRow key={`${rowIndex}-expanded`} className="bg-slate-50/30 border-b border-slate-100">
                      <TableCell colSpan={columns.length} className="p-0">
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1 bg-slate-50/50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <span className="whitespace-nowrap">Page Size:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-slate-500 font-medium font-mono">
          {totalItems > 0 ? `${startIndex + 1} to ${endIndex} of ${totalItems}` : '0 to 0 of 0'}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center px-4 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg whitespace-nowrap">
            Page {currentPage} of {totalPages || 1}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
