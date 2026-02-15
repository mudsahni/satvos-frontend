"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IndianRupee,
  Receipt,
  FileText,
  Calculator,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ReportKpiCard } from "./report-kpi-card";
import { ChartCard } from "./chart-card";
import { useFinancialSummary, useCollectionsOverview } from "@/lib/hooks/use-reports";
import { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/utils/format";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import type { ReportTimeSeriesParams, ReportBaseParams } from "@/types/report";

interface OverviewTabProps {
  timeSeriesParams: ReportTimeSeriesParams;
  baseParams: ReportBaseParams;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-soft-md">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function CollectionHealthSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OverviewTab({ timeSeriesParams, baseParams }: OverviewTabProps) {
  const isMobile = useIsMobile();

  const {
    data: financialData,
    isPending: financialPending,
    isError: financialError,
    refetch: refetchFinancial,
  } = useFinancialSummary(timeSeriesParams);

  const {
    data: collectionsData,
    isPending: collectionsPending,
    isError: collectionsError,
    refetch: refetchCollections,
  } = useCollectionsOverview(baseParams);

  const totals = useMemo(() => {
    if (!financialData?.length) {
      return { revenue: 0, tax: 0, invoices: 0, avgInvoice: 0 };
    }
    const revenue = financialData.reduce((sum, r) => sum + r.total_amount, 0);
    const tax = financialData.reduce(
      (sum, r) => sum + r.cgst + r.sgst + r.igst + r.cess,
      0
    );
    const invoices = financialData.reduce((sum, r) => sum + r.invoice_count, 0);
    return {
      revenue,
      tax,
      invoices,
      avgInvoice: invoices > 0 ? revenue / invoices : 0,
    };
  }, [financialData]);

  const chartData = useMemo(() => {
    if (!financialData) return [];
    return financialData.map((row) => ({
      period: row.period,
      subtotal: row.subtotal,
      tax: row.cgst + row.sgst + row.igst + row.cess,
    }));
  }, [financialData]);

  const loading = financialPending;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard
          title="Total Revenue"
          value={formatCurrency(totals.revenue)}
          icon={IndianRupee}
          iconClassName="bg-primary/10 text-primary"
          loading={loading}
        />
        <ReportKpiCard
          title="Total Tax"
          value={formatCurrency(totals.tax)}
          icon={Receipt}
          iconClassName="bg-warning-bg text-warning"
          loading={loading}
        />
        <ReportKpiCard
          title="Invoice Count"
          value={formatNumber(totals.invoices)}
          icon={FileText}
          iconClassName="bg-success-bg text-success"
          loading={loading}
        />
        <ReportKpiCard
          title="Avg Invoice Value"
          value={formatCurrency(totals.avgInvoice)}
          icon={Calculator}
          iconClassName="bg-accent-purple/10 text-accent-purple"
          loading={loading}
        />
      </div>

      {/* Revenue Trend Chart */}
      {financialError ? (
        <ErrorState
          title="Failed to load financial data"
          onRetry={() => refetchFinancial()}
        />
      ) : (
        <ChartCard
          title="Revenue Trend"
          description="Subtotal and tax breakdown over time"
          loading={loading}
          empty={chartData.length === 0}
        >
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <AreaChart data={chartData} margin={isMobile ? { left: -10, right: 5 } : undefined}>
              <defs>
                <linearGradient id="gradientSubtotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientTax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={isMobile ? "preserveStartEnd" : undefined}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => isMobile ? formatCompactCurrency(v) : formatCurrency(v).replace(/\.00$/, "")}
                width={isMobile ? 50 : 80}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="subtotal"
                name="Subtotal"
                stroke="hsl(var(--chart-1))"
                fill="url(#gradientSubtotal)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="tax"
                name="Tax"
                stroke="hsl(var(--chart-3))"
                fill="url(#gradientTax)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Collections Health */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">Collection Health</h3>
        </div>
        {collectionsError ? (
          <ErrorState
            title="Failed to load collections overview"
            onRetry={() => refetchCollections()}
          />
        ) : collectionsPending ? (
          <CollectionHealthSkeleton />
        ) : !collectionsData?.length ? (
          <p className="text-sm text-muted-foreground">No collections found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionsData.map((col) => (
              <Card key={col.collection_id}>
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm font-medium truncate">
                    {col.collection_name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(col.document_count)} documents &middot;{" "}
                    {formatCurrency(col.total_amount)}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <ProgressRow
                    label="Validation Valid"
                    value={col.validation_valid_pct}
                    colorClass="bg-success"
                  />
                  <ProgressRow
                    label="Validation Warning"
                    value={col.validation_warning_pct}
                    colorClass="bg-warning"
                  />
                  <ProgressRow
                    label="Validation Invalid"
                    value={col.validation_invalid_pct}
                    colorClass="bg-destructive"
                  />
                  <ProgressRow
                    label="Review Approved"
                    value={col.review_approved_pct}
                    colorClass="bg-primary"
                  />
                  <ProgressRow
                    label="Review Pending"
                    value={col.review_pending_pct}
                    colorClass="bg-muted-foreground/40"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  // Backend returns percentages as 0-100 (e.g. 80.0 for 80%)
  const pct = Math.round(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
