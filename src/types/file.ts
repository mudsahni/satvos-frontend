export interface FileRecord {
  id: string;
  tenant_id: string;
  collection_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadFileResponse {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
  collection_id: string;
  created_at: string;
}

export interface FileListParams {
  collection_id?: string;
  offset?: number;
  limit?: number;
  search?: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "uploaded" | "creating_document" | "completed" | "error";
  error?: string;
  fileRecord?: FileRecord;
  documentId?: string;
}
