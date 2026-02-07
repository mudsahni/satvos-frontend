export interface Stats {
  total_documents: number;
  total_collections: number;
  parsing_pending: number;
  parsing_queued: number;
  parsing_processing: number;
  parsing_completed: number;
  parsing_failed: number;
  validation_valid: number;
  validation_warning: number;
  validation_invalid: number;
  review_pending: number;
  review_approved: number;
  review_rejected: number;
  reconciliation_valid: number;
  reconciliation_warning: number;
  reconciliation_invalid: number;
}
