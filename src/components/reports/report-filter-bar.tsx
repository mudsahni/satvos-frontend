"use client";

import { DateRangePicker } from "./date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollections } from "@/lib/hooks/use-collections";
import type { Granularity, ReportTab } from "@/types/report";

interface ReportFilterBarProps {
  from?: string;
  to?: string;
  onDateChange: (from: string | undefined, to: string | undefined) => void;
  collectionId?: string;
  onCollectionChange: (id: string | undefined) => void;
  granularity?: Granularity;
  onGranularityChange?: (g: Granularity) => void;
  showGranularity?: boolean;
  activeTab: ReportTab;
}

const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function ReportFilterBar({
  from,
  to,
  onDateChange,
  collectionId,
  onCollectionChange,
  granularity,
  onGranularityChange,
  showGranularity,
  activeTab,
}: ReportFilterBarProps) {
  const { data: collectionsData } = useCollections({ limit: 100 });
  const collections = collectionsData?.items ?? [];

  const showGranularitySelect =
    showGranularity && (activeTab === "overview" || activeTab === "tax");

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <DateRangePicker
        from={from}
        to={to}
        onChange={onDateChange}
        className="w-full sm:w-auto"
      />
      <Select
        value={collectionId ?? "all"}
        onValueChange={(v) => onCollectionChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Collections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Collections</SelectItem>
          {collections.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showGranularitySelect && onGranularityChange && (
        <Select
          value={granularity ?? "monthly"}
          onValueChange={(v) => onGranularityChange(v as Granularity)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {granularityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
