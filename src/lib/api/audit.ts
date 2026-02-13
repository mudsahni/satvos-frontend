import apiClient from "./client";
import { AuditResponse } from "@/types/audit";

export async function getDocumentAudit(
  documentId: string,
  params?: { page?: number; page_size?: number }
): Promise<AuditResponse> {
  const response = await apiClient.get<AuditResponse>(
    `/documents/${documentId}/audit`,
    { params }
  );
  return response.data;
}
