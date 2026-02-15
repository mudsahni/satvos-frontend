"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/format";
import { exportToCsv, type CsvColumn } from "@/lib/utils/csv-export";
import type { SellerSummaryRow, BuyerSummaryRow } from "@/types/report";

type PartyRow = SellerSummaryRow | BuyerSummaryRow;

interface PartyTableProps {
  data: PartyRow[];
  type: "seller" | "buyer";
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDrillDown: (gstin: string) => void;
  loading?: boolean;
}

function isSellerRow(row: PartyRow): row is SellerSummaryRow {
  return "seller_gstin" in row;
}

function getGstin(row: PartyRow): string {
  return isSellerRow(row) ? row.seller_gstin : (row as BuyerSummaryRow).buyer_gstin;
}

function getName(row: PartyRow): string {
  return isSellerRow(row) ? row.seller_name : (row as BuyerSummaryRow).buyer_name;
}

function getState(row: PartyRow): string {
  return isSellerRow(row) ? row.seller_state : (row as BuyerSummaryRow).buyer_state;
}

export function PartyTable({
  data,
  type,
  total,
  page,
  totalPages,
  onPageChange,
  onDrillDown,
  loading,
}: PartyTableProps) {
  function handleExport() {
    const exportData = data.map((row) => ({
      gstin: getGstin(row),
      name: getName(row),
      state: getState(row),
      invoice_count: row.invoice_count,
      total_amount: row.total_amount,
      total_tax: row.total_tax,
      average_invoice_value: row.average_invoice_value,
    }));
    const columns: CsvColumn<typeof exportData[number]>[] = [
      { key: "gstin", header: "GSTIN" },
      { key: "name", header: "Name" },
      { key: "state", header: "State" },
      { key: "invoice_count", header: "Invoices" },
      { key: "total_amount", header: "Total Amount" },
      { key: "total_tax", header: "Total Tax" },
      { key: "average_invoice_value", header: "Avg Invoice" },
    ];
    exportToCsv(exportData, columns, `${type}s-report`);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {formatNumber(total)} {type}{total !== 1 ? "s" : ""} found
        </p>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data.length}>
          <Download />
          Export CSV
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm normal-case tracking-normal">GSTIN</TableHead>
              <TableHead className="text-sm normal-case tracking-normal">Name</TableHead>
              <TableHead className="text-sm normal-case tracking-normal">State</TableHead>
              <TableHead className="text-sm normal-case tracking-normal text-right">Invoices</TableHead>
              <TableHead className="text-sm normal-case tracking-normal text-right">Total Amount</TableHead>
              <TableHead className="text-sm normal-case tracking-normal text-right">Total Tax</TableHead>
              <TableHead className="text-sm normal-case tracking-normal text-right">Avg Invoice</TableHead>
              <TableHead className="text-sm normal-case tracking-normal text-right">Last Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No {type}s found for the selected period.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const gstin = getGstin(row);
                return (
                  <TableRow
                    key={gstin}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onDrillDown(gstin)}
                  >
                    <TableCell className="font-mono text-xs">{gstin}</TableCell>
                    <TableCell className="font-medium">{getName(row)}</TableCell>
                    <TableCell>{getState(row)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.invoice_count)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_tax)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.average_invoice_value)}</TableCell>
                    <TableCell className="text-right">{formatDate(row.last_invoice_date)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
