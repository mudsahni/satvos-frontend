"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getFinancialSummary,
  getTaxSummary,
  getCollectionsOverview,
  getSellersReport,
  getBuyersReport,
  getPartyLedger,
  getHsnSummary,
} from "@/lib/api/reports";
import {
  ReportTimeSeriesParams,
  ReportBaseParams,
  SellersReportParams,
  BuyersReportParams,
  PartyLedgerParams,
  ReportPaginatedParams,
} from "@/types/report";

const REPORT_STALE_TIME = 5 * 60 * 1000;

export function useFinancialSummary(params?: ReportTimeSeriesParams) {
  return useQuery({
    queryKey: ["reports", "financial-summary", params],
    queryFn: () => getFinancialSummary(params),
    staleTime: REPORT_STALE_TIME,
  });
}

export function useTaxSummary(params?: ReportTimeSeriesParams) {
  return useQuery({
    queryKey: ["reports", "tax-summary", params],
    queryFn: () => getTaxSummary(params),
    staleTime: REPORT_STALE_TIME,
  });
}

export function useCollectionsOverview(params?: ReportBaseParams) {
  return useQuery({
    queryKey: ["reports", "collections-overview", params],
    queryFn: () => getCollectionsOverview(params),
    staleTime: REPORT_STALE_TIME,
  });
}

export function useSellersReport(params?: SellersReportParams) {
  return useQuery({
    queryKey: ["reports", "sellers", params],
    queryFn: () => getSellersReport(params),
    placeholderData: keepPreviousData,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useBuyersReport(params?: BuyersReportParams) {
  return useQuery({
    queryKey: ["reports", "buyers", params],
    queryFn: () => getBuyersReport(params),
    placeholderData: keepPreviousData,
    staleTime: REPORT_STALE_TIME,
  });
}

export function usePartyLedger(params: PartyLedgerParams) {
  return useQuery({
    queryKey: ["reports", "party-ledger", params],
    queryFn: () => getPartyLedger(params),
    enabled: !!params.gstin,
    placeholderData: keepPreviousData,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useHsnSummary(params?: ReportPaginatedParams) {
  return useQuery({
    queryKey: ["reports", "hsn-summary", params],
    queryFn: () => getHsnSummary(params),
    placeholderData: keepPreviousData,
    staleTime: REPORT_STALE_TIME,
  });
}
