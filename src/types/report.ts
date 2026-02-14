// ===== Report Types (mapped from domain models in swagger) =====

// --- Financial Summary ---
export interface FinancialSummaryRow {
  period: string;
  period_start: string;
  period_end: string;
  invoice_count: number;
  subtotal: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total_amount: number;
}

// --- Tax Summary ---
export interface TaxSummaryRow {
  period: string;
  period_start: string;
  period_end: string;
  intrastate_count: number;
  intrastate_taxable: number;
  interstate_count: number;
  interstate_taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total_tax: number;
}

// --- HSN Summary ---
export interface HsnSummaryRow {
  hsn_code: string;
  description: string;
  line_item_count: number;
  invoice_count: number;
  total_quantity: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
}

// --- Seller Summary ---
export interface SellerSummaryRow {
  seller_gstin: string;
  seller_name: string;
  seller_state: string;
  invoice_count: number;
  total_amount: number;
  total_tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  average_invoice_value: number;
  first_invoice_date: string;
  last_invoice_date: string;
}

// --- Buyer Summary ---
export interface BuyerSummaryRow {
  buyer_gstin: string;
  buyer_name: string;
  buyer_state: string;
  invoice_count: number;
  total_amount: number;
  total_tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  average_invoice_value: number;
  first_invoice_date: string;
  last_invoice_date: string;
}

// --- Party Ledger ---
export interface PartyLedgerRow {
  document_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: string;
  role: string;
  counterparty_gstin: string;
  counterparty_name: string;
  subtotal: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_amount: number;
  validation_status: string;
  review_status: string;
}

// --- Collection Overview ---
export interface CollectionOverviewRow {
  collection_id: string;
  collection_name: string;
  document_count: number;
  total_amount: number;
  validation_valid_pct: number;
  validation_warning_pct: number;
  validation_invalid_pct: number;
  review_approved_pct: number;
  review_pending_pct: number;
}

// ===== Parameter Types =====

export interface ReportBaseParams {
  from?: string;
  to?: string;
  collection_id?: string;
  seller_gstin?: string;
  buyer_gstin?: string;
}

export interface ReportPaginatedParams extends ReportBaseParams {
  offset?: number;
  limit?: number;
}

export type Granularity = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface ReportTimeSeriesParams extends ReportBaseParams {
  granularity?: Granularity;
}

export interface PartyLedgerParams {
  gstin: string;
  from?: string;
  to?: string;
  collection_id?: string;
  offset?: number;
  limit?: number;
}

export interface SellersReportParams extends ReportPaginatedParams {
  buyer_gstin?: string;
}

export interface BuyersReportParams extends ReportPaginatedParams {
  seller_gstin?: string;
}

// ===== Report Tab Type =====
export type ReportTab = "overview" | "sellers" | "buyers" | "tax" | "ledger";
