import apiClient from "./client";
import { ApiResponse, ApiPaginatedResponse, PaginatedResponse, transformPagination } from "@/types/api";
import {
  FinancialSummaryRow,
  TaxSummaryRow,
  HsnSummaryRow,
  SellerSummaryRow,
  BuyerSummaryRow,
  PartyLedgerRow,
  CollectionOverviewRow,
  ReportTimeSeriesParams,
  ReportBaseParams,
  SellersReportParams,
  BuyersReportParams,
  PartyLedgerParams,
  ReportPaginatedParams,
} from "@/types/report";

// --- Non-paginated (time-series / list) ---

export async function getFinancialSummary(
  params?: ReportTimeSeriesParams
): Promise<FinancialSummaryRow[]> {
  const response = await apiClient.get<ApiResponse<FinancialSummaryRow[]>>(
    "/reports/financial-summary",
    { params }
  );
  return response.data.data;
}

export async function getTaxSummary(
  params?: ReportTimeSeriesParams
): Promise<TaxSummaryRow[]> {
  const response = await apiClient.get<ApiResponse<TaxSummaryRow[]>>(
    "/reports/tax-summary",
    { params }
  );
  return response.data.data;
}

export async function getCollectionsOverview(
  params?: ReportBaseParams
): Promise<CollectionOverviewRow[]> {
  const response = await apiClient.get<ApiResponse<CollectionOverviewRow[]>>(
    "/reports/collections-overview",
    { params }
  );
  return response.data.data;
}

// --- Paginated ---

export async function getSellersReport(
  params?: SellersReportParams
): Promise<PaginatedResponse<SellerSummaryRow>> {
  const response = await apiClient.get<ApiPaginatedResponse<SellerSummaryRow>>(
    "/reports/sellers",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getBuyersReport(
  params?: BuyersReportParams
): Promise<PaginatedResponse<BuyerSummaryRow>> {
  const response = await apiClient.get<ApiPaginatedResponse<BuyerSummaryRow>>(
    "/reports/buyers",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getPartyLedger(
  params: PartyLedgerParams
): Promise<PaginatedResponse<PartyLedgerRow>> {
  const response = await apiClient.get<ApiPaginatedResponse<PartyLedgerRow>>(
    "/reports/party-ledger",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getHsnSummary(
  params?: ReportPaginatedParams
): Promise<PaginatedResponse<HsnSummaryRow>> {
  const response = await apiClient.get<ApiPaginatedResponse<HsnSummaryRow>>(
    "/reports/hsn-summary",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}
