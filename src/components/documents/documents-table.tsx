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
import { UserName } from "@/components/ui/user-name";

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
    documents.length > 0 && documents.every((d) => selectedIds.includes(d.id));
  const someSelected =
    !allSelected && documents.some((d) => selectedIds.includes(d.id));

  const toggleSelectAll = () => {
    if (onSelectionChange) {
      if (allSelected) {
        // Deselect current page items, keep selections from other pages
        const pageIds = new Set(documents.map((d) => d.id));
        onSelectionChange(selectedIds.filter((id) => !pageIds.has(id)));
      } else {
        // Add current page items to existing selections
        const existing = new Set(selectedIds);
        const merged = [...selectedIds, ...documents.filter((d) => !existing.has(d.id)).map((d) => d.id)];
        onSelectionChange(merged);
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
            <ArrowUp />
          ) : (
            <ArrowDown />
          )
        ) : (
          <ArrowUpDown className="opacity-50" />
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
    <div className="overflow-x-auto">
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
            <TableHead className="hidden md:table-cell text-sm normal-case tracking-normal">
              Vendor
            </TableHead>
            <TableHead>
              <SortableHeader field="validation_status">
                Validation
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="review_status">Review</SortableHeader>
            </TableHead>
            <TableHead className="hidden lg:table-cell text-sm normal-case tracking-normal">
              Assigned To
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <SortableHeader field="created_at">Created</SortableHeader>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            const vendorName =
              doc.structured_data?.seller?.name ||
              doc.parsed_data?.seller?.name?.value ||
              doc.tags?.find((t) => t.key === "seller_name")?.value ||
              "-";

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
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                  {vendorName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.validation_status} type="validation" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.review_status} type="review" />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {doc.assigned_to ? <UserName id={doc.assigned_to} /> : "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  <div>
                    <div>{formatRelativeTime(doc.created_at)}</div>
                    <div className="text-xs">
                      by <span className="text-foreground"><UserName id={doc.created_by} /></span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Document actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${doc.id}`}>
                          <Eye />
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
