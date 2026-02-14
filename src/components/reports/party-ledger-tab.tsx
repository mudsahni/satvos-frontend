"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/documents/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { usePartyLedger } from "@/lib/hooks/use-reports";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/format";
import { exportToCsv, type CsvColumn } from "@/lib/utils/csv-export";
import type { ReportBaseParams, PartyLedgerRow } from "@/types/report";

interface PartyLedgerTabProps {
  gstin: string;
  onGstinChange: (gstin: string) => void;
  baseParams: ReportBaseParams;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function PartyLedgerTab({
  gstin,
  onGstinChange,
  baseParams,
}: PartyLedgerTabProps) {
  const [inputValue, setInputValue] = useState(gstin);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const params = useMemo(
    () => ({
      gstin,
      from: baseParams.from,
      to: baseParams.to,
      collection_id: baseParams.collection_id,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    [gstin, baseParams, page]
  );

  const { data, isPending, isError, refetch } = usePartyLedger(params);

  const isValidGstin = GSTIN_REGEX.test(inputValue.toUpperCase());

  function handleSearch() {
    const cleaned = inputValue.toUpperCase().trim();
    if (GSTIN_REGEX.test(cleaned)) {
      onGstinChange(cleaned);
      setPage(1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  // Compute totals from current page data
  const pageTotals = useMemo(() => {
    if (!data?.items?.length)
      return { totalAmount: 0, totalTax: 0, invoices: 0 };
    return {
      totalAmount: data.items.reduce((s, r) => s + r.total_amount, 0),
      totalTax: data.items.reduce(
        (s, r) => s + r.cgst + r.sgst + r.igst,
        0
      ),
      invoices: data.total,
    };
  }, [data]);

  const partyName = data?.items?.[0]?.counterparty_name ?? "";

  const csvColumns: CsvColumn<PartyLedgerRow>[] = [
    { key: "invoice_number", header: "Invoice #" },
    { key: "invoice_date", header: "Date" },
    { key: "invoice_type", header: "Type" },
    { key: "role", header: "Role" },
    { key: "counterparty_name", header: "Counterparty" },
    { key: "counterparty_gstin", header: "Counterparty GSTIN" },
    { key: "subtotal", header: "Subtotal" },
    { key: "total_amount", header: "Total Amount" },
    { key: "validation_status", header: "Validation" },
    { key: "review_status", header: "Review" },
  ];

  return (
    <div className="space-y-6">
      {/* GSTIN Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Enter GSTIN (e.g., 29ABCDE1234F1Z5)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="font-mono"
          />
          {inputValue && !isValidGstin && (
            <p className="text-xs text-destructive mt-1">
              Invalid GSTIN format. Expected: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
            </p>
          )}
        </div>
        <Button onClick={handleSearch} disabled={!isValidGstin}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Only render results when GSTIN is provided */}
      {!gstin ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4">
          <Search className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">Search Party Ledger</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
            Enter a GSTIN above to view all invoices associated with that party.
          </p>
        </div>
      ) : isError ? (
        <ErrorState title="Failed to load party ledger" onRetry={() => refetch()} />
      ) : (
        <>
          {/* Party Info Banner */}
          {gstin && !isPending && data?.items?.length ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-medium">{gstin}</p>
                    {partyName && (
                      <p className="text-sm text-muted-foreground">{partyName}</p>
                    )}
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Invoices: </span>
                      <span className="font-medium">{formatNumber(pageTotals.invoices)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium">{formatCurrency(pageTotals.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tax: </span>
                      <span className="font-medium">{formatCurrency(pageTotals.totalTax)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Table */}
          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formatNumber(data?.total ?? 0)} transactions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCsv(data?.items ?? [], csvColumns, `party-ledger-${gstin}`)}
                  disabled={!data?.items?.length}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm normal-case tracking-normal">Invoice #</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Date</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Type</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Role</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Counterparty</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal text-right">Amount</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Validation</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!data?.items?.length ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No transactions found for this GSTIN.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.items.map((row) => (
                        <TableRow key={row.document_id}>
                          <TableCell>
                            <Link
                              href={`/documents/${row.document_id}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {row.invoice_number || "-"}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(row.invoice_date)}</TableCell>
                          <TableCell className="capitalize">{row.invoice_type || "-"}</TableCell>
                          <TableCell className="capitalize">{row.role || "-"}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{row.counterparty_name || "-"}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {row.counterparty_gstin}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.total_amount)}
                          </TableCell>
                          <TableCell>
                            {row.validation_status && (
                              <StatusBadge
                                status={row.validation_status as "valid" | "warning" | "invalid" | "pending"}
                                type="validation"
                                showIcon={false}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {row.review_status && (
                              <StatusBadge
                                status={row.review_status as "approved" | "rejected" | "pending"}
                                type="review"
                                showIcon={false}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {(data?.total_pages ?? 1) > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {data?.page ?? 1} of {data?.total_pages ?? 1}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(data?.page ?? 1) <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(data?.page ?? 1) >= (data?.total_pages ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
