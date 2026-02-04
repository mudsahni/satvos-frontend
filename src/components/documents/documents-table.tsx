"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/documents/status-badge";
import { Document } from "@/types/document";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type SortField = "name" | "created_at" | "validation_status" | "review_status";
type SortOrder = "asc" | "desc";

interface DocumentsTableProps {
  documents: Document[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSort?: (field: SortField, order: SortOrder) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export function DocumentsTable({
  documents,
  isLoading,
  selectedIds = [],
  onSelectionChange,
  onSort,
  sortField,
  sortOrder,
}: DocumentsTableProps) {
  const allSelected =
    documents.length > 0 && selectedIds.length === documents.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (onSelectionChange) {
      if (allSelected) {
        onSelectionChange([]);
      } else {
        onSelectionChange(documents.map((d) => d.id));
      }
    }
  };

  const toggleSelect = (id: string) => {
    if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((s) => s !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (onSort) {
      const newOrder =
        sortField === field && sortOrder === "asc" ? "desc" : "asc";
      onSort(field, newOrder);
    }
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-medium"
        onClick={() => handleSort(field)}
      >
        {children}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No documents</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No documents found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead>
              <SortableHeader field="name">Name</SortableHeader>
            </TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>
              <SortableHeader field="validation_status">
                Validation
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="review_status">Review</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="created_at">Created</SortableHeader>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            const vendorName = doc.parsed_data?.seller?.name?.value || "-";

            return (
              <TableRow
                key={doc.id}
                className={cn(
                  "group transition-colors",
                  isSelected && "bg-muted/50"
                )}
              >
                {onSelectionChange && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(doc.id)}
                      aria-label={`Select ${doc.name}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {doc.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {vendorName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.validation_status} type="validation" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.review_status} type="review" />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(doc.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${doc.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
