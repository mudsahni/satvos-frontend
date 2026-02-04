export type FileType = "pdf" | "jpg" | "png";
export type FileStatus = "pending" | "uploaded" | "failed" | "deleted";

export interface FileRecord {
  id: string;
  tenant_id: string;
  uploaded_by: string;
  file_name: string;
  original_name: string;
  file_type: FileType;
  file_size: number;
  s3_bucket: string;
  s3_key: string;
  content_type: string;
  status: FileStatus;
  created_at: string;
  updated_at: string;
}

export interface FileWithDownloadURL {
  file: FileRecord;
  download_url: string;
}

export interface UploadFileResponse {
  id: string;
  original_name: string;
  file_type: FileType;
  file_size: number;
  content_type: string;
  status: FileStatus;
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
