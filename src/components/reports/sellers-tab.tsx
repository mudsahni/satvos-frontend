"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ErrorState } from "@/components/ui/error-state";
import { ChartCard } from "./chart-card";
import { PartyTable } from "./party-table";
import { useSellersReport } from "@/lib/hooks/use-reports";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils/format";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import type { ReportBaseParams } from "@/types/report";

interface SellersTabProps {
  baseParams: ReportBaseParams;
  onDrillDown: (gstin: string) => void;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-soft-md">
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-sm" style={{ color: payload[0].color }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function SellersTab({ baseParams, onDrillDown }: SellersTabProps) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const params = useMemo(
    () => ({
      ...baseParams,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    [baseParams, page]
  );

  const { data, isPending, isError, refetch } = useSellersReport(params);

  const top10 = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10)
      .map((s) => ({
        name: s.seller_name || s.seller_gstin,
        amount: s.total_amount,
      }));
  }, [data]);

  if (isError) {
    return <ErrorState title="Failed to load sellers report" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Top 10 Sellers by Amount"
        loading={isPending}
        empty={top10.length === 0}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={top10} layout="vertical" margin={isMobile ? { left: -10, right: 5 } : { left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => isMobile ? formatCompactCurrency(v) : formatCurrency(v).replace(/\.00$/, "")}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 80 : 140}
              tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="amount"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <PartyTable
        data={data?.items ?? []}
        type="seller"
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.page_size ?? pageSize}
        totalPages={data?.total_pages ?? 1}
        onPageChange={setPage}
        onDrillDown={onDrillDown}
        loading={isPending}
      />
    </div>
  );
}
