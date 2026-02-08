import apiClient from "./client";
import { ApiResponse, ApiPaginatedResponse, PaginatedResponse, transformPagination } from "@/types/api";
import { FileRecord, FileWithDownloadURL, FileListParams, UploadFileResponse } from "@/types/file";

export async function getFiles(
  params?: FileListParams
): Promise<PaginatedResponse<FileRecord>> {
  const response = await apiClient.get<ApiPaginatedResponse<FileRecord>>(
    "/files",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getFile(id: string): Promise<FileWithDownloadURL> {
  const response = await apiClient.get<ApiResponse<FileWithDownloadURL>>(`/files/${id}`);
  return response.data.data;
}

export async function uploadFile(
  file: File,
  collectionId: string,
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("collection_id", collectionId);

  const response = await apiClient.post<ApiResponse<UploadFileResponse>>(
    "/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for file uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    }
  );
  return response.data.data;
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

export async function getFileDownloadUrl(id: string): Promise<string> {
  const response = await apiClient.get<ApiResponse<FileWithDownloadURL>>(
    `/files/${id}`
  );
  return response.data.data.download_url;
}
