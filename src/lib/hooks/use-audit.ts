"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocumentAudit } from "@/lib/api/audit";

export function useDocumentAudit(
  documentId: string,
  page = 1,
  pageSize = 50
) {
  return useQuery({
    queryKey: ["document-audit", documentId, page],
    queryFn: () => getDocumentAudit(documentId, { page, page_size: pageSize }),
    enabled: !!documentId,
  });
}
