import {
  ParsingStatus,
  ValidationStatus,
  ReviewStatus,
  ReconciliationStatus,
  ParseMode,
} from "@/lib/constants";
import { FileRecord } from "./file";
import { ValidationResult } from "./validation";

export interface Document {
  id: string;
  tenant_id: string;
  collection_id: string;
  file_id: string;
  name: string;
  document_type?: string;
  parser_model?: string;
  parsing_status: ParsingStatus;
  validation_status: ValidationStatus;
  review_status: ReviewStatus;
  reconciliation_status: ReconciliationStatus;
  // API returns structured_data and confidence_scores separately
  structured_data?: StructuredInvoiceData;
  confidence_scores?: ConfidenceScores;
  // Legacy field for backwards compatibility
  parsed_data?: ParsedInvoice;
  validation_results?: ValidationResult[];
  parse_mode: ParseMode;
  parsed_at?: string;
  validated_at?: string;
  reviewed_at?: string;
  reviewed_by?: string | null;
  reviewer_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  file?: FileRecord;
  tags?: DocumentTag[];
}

export interface DocumentTag {
  id: string;
  document_id: string;
  key: string;
  value: string;
  source: "auto" | "user";
  created_at: string;
}

// ============================================
// NEW: Types matching actual API response
// ============================================

export interface StructuredInvoiceData {
  invoice: InvoiceData;
  seller: PartyData;
  buyer: PartyData;
  line_items: LineItemData[];
  totals: TotalsData;
  payment?: PaymentData;
  notes?: string;
}

export interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  invoice_type?: string;
  currency?: string;
  place_of_supply?: string;
  reverse_charge?: boolean;
  irn?: string;
  acknowledgement_number?: string;
  acknowledgement_date?: string;
}

export interface PartyData {
  name: string;
  address?: string;
  gstin?: string;
  pan?: string;
  state?: string;
  state_code?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export interface LineItemData {
  description: string;
  hsn_sac_code?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  discount?: number;
  taxable_amount: number;
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
  cess_rate?: number;
  cess_amount?: number;
  total: number;
}

export interface TotalsData {
  subtotal: number;
  total_discount?: number;
  taxable_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  round_off?: number;
  total: number;
  amount_in_words?: string;
}

export interface PaymentData {
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  branch?: string;
  payment_terms?: string;
  upi_id?: string;
}

// Confidence scores mirror the data structure with number values
export interface ConfidenceScores {
  invoice: Record<string, number>;
  seller: Record<string, number>;
  buyer: Record<string, number>;
  line_items: Array<Record<string, number>>;
  totals: Record<string, number>;
  payment?: Record<string, number>;
  notes?: number;
}

// ============================================
// LEGACY: Types for backwards compatibility
// ============================================

export interface ParsedInvoice {
  invoice: InvoiceDetails;
  seller: PartyDetails;
  buyer: PartyDetails;
  line_items: LineItem[];
  totals: InvoiceTotals;
  payment?: PaymentDetails;
  metadata?: InvoiceMetadata;
}

export interface InvoiceDetails {
  invoice_number: FieldWithConfidence<string>;
  invoice_date: FieldWithConfidence<string>;
  due_date?: FieldWithConfidence<string>;
  invoice_type?: FieldWithConfidence<string>;
  place_of_supply?: FieldWithConfidence<string>;
  reverse_charge?: FieldWithConfidence<boolean>;
}

export interface PartyDetails {
  name: FieldWithConfidence<string>;
  gstin?: FieldWithConfidence<string>;
  pan?: FieldWithConfidence<string>;
  address?: FieldWithConfidence<string>;
  city?: FieldWithConfidence<string>;
  state?: FieldWithConfidence<string>;
  state_code?: FieldWithConfidence<string>;
  pincode?: FieldWithConfidence<string>;
  phone?: FieldWithConfidence<string>;
  email?: FieldWithConfidence<string>;
}

export interface LineItem {
  serial_number?: FieldWithConfidence<number>;
  description: FieldWithConfidence<string>;
  hsn_sac?: FieldWithConfidence<string>;
  quantity?: FieldWithConfidence<number>;
  unit?: FieldWithConfidence<string>;
  unit_price?: FieldWithConfidence<number>;
  discount?: FieldWithConfidence<number>;
  taxable_value: FieldWithConfidence<number>;
  cgst_rate?: FieldWithConfidence<number>;
  cgst_amount?: FieldWithConfidence<number>;
  sgst_rate?: FieldWithConfidence<number>;
  sgst_amount?: FieldWithConfidence<number>;
  igst_rate?: FieldWithConfidence<number>;
  igst_amount?: FieldWithConfidence<number>;
  cess_rate?: FieldWithConfidence<number>;
  cess_amount?: FieldWithConfidence<number>;
  total: FieldWithConfidence<number>;
}

export interface InvoiceTotals {
  subtotal: FieldWithConfidence<number>;
  total_discount?: FieldWithConfidence<number>;
  total_taxable_value: FieldWithConfidence<number>;
  total_cgst?: FieldWithConfidence<number>;
  total_sgst?: FieldWithConfidence<number>;
  total_igst?: FieldWithConfidence<number>;
  total_cess?: FieldWithConfidence<number>;
  total_tax: FieldWithConfidence<number>;
  grand_total: FieldWithConfidence<number>;
  amount_in_words?: FieldWithConfidence<string>;
  round_off?: FieldWithConfidence<number>;
}

export interface PaymentDetails {
  bank_name?: FieldWithConfidence<string>;
  account_number?: FieldWithConfidence<string>;
  ifsc_code?: FieldWithConfidence<string>;
  branch?: FieldWithConfidence<string>;
  payment_terms?: FieldWithConfidence<string>;
  upi_id?: FieldWithConfidence<string>;
}

export interface InvoiceMetadata {
  irn?: FieldWithConfidence<string>;
  ack_number?: FieldWithConfidence<string>;
  ack_date?: FieldWithConfidence<string>;
  qr_code?: FieldWithConfidence<string>;
  notes?: FieldWithConfidence<string>;
}

export interface FieldWithConfidence<T> {
  value: T;
  confidence: number;
  raw_text?: string;
  bounding_box?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

export interface CreateDocumentRequest {
  file_id: string;
  collection_id: string;
  name: string;
  document_type: string;
  parse_mode?: ParseMode;
  tags?: Record<string, string>;
}

export interface UpdateDocumentRequest {
  name?: string;
  parsed_data?: ParsedInvoice;
  structured_data?: StructuredInvoiceData;
}

export interface ReviewDocumentRequest {
  status: "approved" | "rejected";
  notes?: string;
}

export interface AddTagsRequest {
  tags: Record<string, string>;
}

export interface DocumentListParams {
  collection_id?: string;
  parsing_status?: ParsingStatus;
  validation_status?: ValidationStatus;
  review_status?: ReviewStatus;
  offset?: number;
  limit?: number;
  search?: string;
  sort_by?: "name" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}
