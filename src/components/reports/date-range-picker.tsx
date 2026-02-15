"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, subDays, startOfQuarter, endOfQuarter } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from: string | undefined, to: string | undefined) => void;
  className?: string;
}

interface Preset {
  label: string;
  getRange: () => { from: string; to: string };
}

function getCurrentFYStart(): Date {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 3, 1); // April 1
}

function getCurrentFYEnd(): Date {
  const fyStart = getCurrentFYStart();
  return new Date(fyStart.getFullYear() + 1, 2, 31); // March 31
}

const presets: Preset[] = [
  {
    label: "Last 30 days",
    getRange: () => ({
      from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This Month",
    getRange: () => ({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This Quarter",
    getRange: () => ({
      from: format(startOfQuarter(new Date()), "yyyy-MM-dd"),
      to: format(endOfQuarter(new Date()), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This FY",
    getRange: () => ({
      from: format(getCurrentFYStart(), "yyyy-MM-dd"),
      to: format(getCurrentFYEnd(), "yyyy-MM-dd"),
    }),
  },
];

export function DateRangePicker({
  from,
  to,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(from ?? "");
  const [localTo, setLocalTo] = useState(to ?? "");

  const displayLabel =
    from && to
      ? `${format(new Date(from), "MMM d, yyyy")} - ${format(new Date(to), "MMM d, yyyy")}`
      : "Select date range";

  function applyPreset(preset: Preset) {
    const range = preset.getRange();
    setLocalFrom(range.from);
    setLocalTo(range.to);
    onChange(range.from, range.to);
    setOpen(false);
  }

  function applyCustom() {
    onChange(localFrom || undefined, localTo || undefined);
    setOpen(false);
  }

  function clearRange() {
    setLocalFrom("");
    setLocalTo("");
    onChange(undefined, undefined);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !from && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Custom Range</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="text-xs"
              />
              <Input
                type="date"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="flex-1" onClick={applyCustom}>
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearRange}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
