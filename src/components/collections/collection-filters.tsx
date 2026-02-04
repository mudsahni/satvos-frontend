"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type ValidationStatusFilter = "all" | "valid" | "warning" | "invalid" | "pending";
export type ReviewStatusFilter = "all" | "approved" | "rejected" | "pending";

interface CollectionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  validationStatus: ValidationStatusFilter;
  onValidationStatusChange: (value: ValidationStatusFilter) => void;
  reviewStatus: ReviewStatusFilter;
  onReviewStatusChange: (value: ReviewStatusFilter) => void;
  totalFiltered: number;
  total: number;
}

export function CollectionFilters({
  search,
  onSearchChange,
  validationStatus,
  onValidationStatusChange,
  reviewStatus,
  onReviewStatusChange,
  totalFiltered,
  total,
}: CollectionFiltersProps) {
  const hasFilters = search || validationStatus !== "all" || reviewStatus !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onValidationStatusChange("all");
    onReviewStatusChange("all");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Validation status filter */}
        <Select
          value={validationStatus}
          onValueChange={(value) => onValidationStatusChange(value as ValidationStatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Validation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All validation</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="invalid">Invalid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Review status filter */}
        <Select
          value={reviewStatus}
          onValueChange={(value) => onReviewStatusChange(value as ReviewStatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Review" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {totalFiltered} of {total} document{total !== 1 ? "s" : ""}
        </span>
        {hasFilters && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>
    </div>
  );
}
