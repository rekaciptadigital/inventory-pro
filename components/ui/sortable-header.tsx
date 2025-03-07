'use client';

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react";
import { TableHead } from "./table";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  readonly column: string;
  readonly label: string;
  readonly sortColumn: string | null;
  readonly sortDirection: SortDirection;
  readonly onSort: (column: string) => void;
  readonly className?: string;
}

export function SortableHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = sortColumn === column;
  
  return (
    <TableHead 
      className={cn(
        "whitespace-nowrap bg-muted/50 text-muted-foreground", 
        isActive && "bg-primary/10 text-primary font-medium",
        className
      )}
    >
      <Button
        variant="ghost"
        onClick={() => onSort(column)}
        className={cn(
          "h-9 px-2 text-sm w-full justify-between font-bold hover:bg-transparent",
          isActive && "text-primary hover:text-primary"
        )}
      >
        {label}
        <span className="ml-2">
          {isActive && sortDirection === 'asc' && (
            <ArrowUpIcon className="h-4 w-4 text-primary" />
          )}
          {isActive && sortDirection === 'desc' && (
            <ArrowDownIcon className="h-4 w-4 text-primary" />
          )}
          {(!isActive) && (
            <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
          )}
        </span>
      </Button>
    </TableHead>
  );
}
