export type AuditAction =
  | "document.created"
  | "document.parse_completed"
  | "document.parse_failed"
  | "document.parse_queued"
  | "document.retry"
  | "document.review"
  | "document.edit_structured_data"
  | "document.validate"
  | "document.validation_completed"
  | "document.tags_added"
  | "document.tag_deleted"
  | "document.deleted";

export interface AuditEntry {
  id: string;
  tenant_id: string;
  document_id: string;
  user_id: string | null;
  action: AuditAction;
  changes: Record<string, unknown>;
  created_at: string;
}

export interface AuditResponse {
  success: boolean;
  data: AuditEntry[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}
