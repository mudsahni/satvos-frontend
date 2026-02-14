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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Receipt, ArrowLeftRight, Building2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ReportKpiCard } from "./report-kpi-card";
import { ChartCard } from "./chart-card";
import { useTaxSummary, useHsnSummary } from "@/lib/hooks/use-reports";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { exportToCsv, type CsvColumn } from "@/lib/utils/csv-export";
import type { ReportTimeSeriesParams, ReportBaseParams, HsnSummaryRow } from "@/types/report";

interface TaxAnalysisTabProps {
  timeSeriesParams: ReportTimeSeriesParams;
  baseParams: ReportBaseParams;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function TaxChartTooltip({ active, payload, label }: {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!percent || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function TaxAnalysisTab({ timeSeriesParams, baseParams }: TaxAnalysisTabProps) {
  const [hsnPage, setHsnPage] = useState(1);
  const hsnPageSize = 20;

  const {
    data: taxData,
    isPending: taxPending,
    isError: taxError,
    refetch: refetchTax,
  } = useTaxSummary(timeSeriesParams);

  const hsnParams = useMemo(
    () => ({
      ...baseParams,
      offset: (hsnPage - 1) * hsnPageSize,
      limit: hsnPageSize,
    }),
    [baseParams, hsnPage]
  );

  const {
    data: hsnData,
    isPending: hsnPending,
    isError: hsnError,
    refetch: refetchHsn,
  } = useHsnSummary(hsnParams);

  const totals = useMemo(() => {
    if (!taxData?.length)
      return { totalTax: 0, cgst: 0, sgst: 0, igst: 0 };
    return {
      totalTax: taxData.reduce((s, r) => s + r.total_tax, 0),
      cgst: taxData.reduce((s, r) => s + r.cgst, 0),
      sgst: taxData.reduce((s, r) => s + r.sgst, 0),
      igst: taxData.reduce((s, r) => s + r.igst, 0),
    };
  }, [taxData]);

  const stackedData = useMemo(() => {
    if (!taxData) return [];
    return taxData.map((row) => ({
      period: row.period,
      intrastate: row.intrastate_taxable,
      interstate: row.interstate_taxable,
    }));
  }, [taxData]);

  const taxSplitData = useMemo(() => {
    const { cgst, sgst, igst } = totals;
    if (cgst + sgst + igst === 0) return [];
    return [
      { name: "CGST", value: cgst },
      { name: "SGST", value: sgst },
      { name: "IGST", value: igst },
    ];
  }, [totals]);

  const tradeSplitData = useMemo(() => {
    if (!taxData?.length) return [];
    const intrastate = taxData.reduce((s, r) => s + r.intrastate_taxable, 0);
    const interstate = taxData.reduce((s, r) => s + r.interstate_taxable, 0);
    if (intrastate + interstate === 0) return [];
    return [
      { name: "Intrastate", value: intrastate },
      { name: "Interstate", value: interstate },
    ];
  }, [taxData]);

  const loading = taxPending;

  const hsnColumns: CsvColumn<HsnSummaryRow>[] = [
    { key: "hsn_code", header: "HSN Code" },
    { key: "description", header: "Description" },
    { key: "line_item_count", header: "Line Items" },
    { key: "invoice_count", header: "Invoices" },
    { key: "taxable_amount", header: "Taxable Amount" },
    { key: "total_tax", header: "Total Tax" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpiCard
          title="Total Tax"
          value={formatCurrency(totals.totalTax)}
          icon={Receipt}
          iconClassName="bg-primary/10 text-primary"
          loading={loading}
        />
        <ReportKpiCard
          title="CGST"
          value={formatCurrency(totals.cgst)}
          icon={Building2}
          iconClassName="bg-success-bg text-success"
          loading={loading}
        />
        <ReportKpiCard
          title="SGST"
          value={formatCurrency(totals.sgst)}
          icon={Building2}
          iconClassName="bg-warning-bg text-warning"
          loading={loading}
        />
        <ReportKpiCard
          title="IGST"
          value={formatCurrency(totals.igst)}
          icon={ArrowLeftRight}
          iconClassName="bg-accent-purple/10 text-accent-purple"
          loading={loading}
        />
      </div>

      {/* Tax Trend Chart */}
      {taxError ? (
        <ErrorState title="Failed to load tax data" onRetry={() => refetchTax()} />
      ) : (
        <ChartCard
          title="Intrastate vs Interstate Taxable Amount"
          loading={loading}
          empty={stackedData.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v).replace(/\.00$/, "")}
                width={80}
              />
              <Tooltip content={<TaxChartTooltip />} />
              <Bar
                dataKey="intrastate"
                name="Intrastate"
                fill="hsl(var(--chart-1))"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="interstate"
                name="Interstate"
                fill="hsl(var(--chart-3))"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Donut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="Trade Type Split"
          loading={loading}
          empty={tradeSplitData.length === 0}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tradeSplitData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {tradeSplitData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Legend
                formatter={(value: string) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--popover))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Tax Component Split"
          loading={loading}
          empty={taxSplitData.length === 0}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={taxSplitData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {taxSplitData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i + 1]} />
                ))}
              </Pie>
              <Legend
                formatter={(value: string) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--popover))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* HSN Summary Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold">HSN Summary</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCsv(hsnData?.items ?? [], hsnColumns, "hsn-summary")}
            disabled={!hsnData?.items?.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {hsnError ? (
          <ErrorState title="Failed to load HSN data" onRetry={() => refetchHsn()} />
        ) : hsnPending ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm normal-case tracking-normal">HSN Code</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal">Description</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">Line Items</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">Invoices</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">Quantity</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">Taxable Amt</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">CGST</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">SGST</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">IGST</TableHead>
                    <TableHead className="text-sm normal-case tracking-normal text-right">Total Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hsnData?.items?.length ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        No HSN data found for the selected period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hsnData.items.map((row) => (
                      <TableRow key={row.hsn_code}>
                        <TableCell className="font-mono text-xs">{row.hsn_code}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{row.description}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.line_item_count)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.invoice_count)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.total_quantity)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.taxable_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.cgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.sgst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.igst)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.total_tax)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {(hsnData?.total_pages ?? 1) > 1 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-muted-foreground">
                  Page {hsnData?.page ?? 1} of {hsnData?.total_pages ?? 1}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(hsnData?.page ?? 1) <= 1}
                    onClick={() => setHsnPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(hsnData?.page ?? 1) >= (hsnData?.total_pages ?? 1)}
                    onClick={() => setHsnPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
