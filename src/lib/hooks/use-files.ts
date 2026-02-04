"use client";

import { useQuery } from "@tanstack/react-query";
import { getFile, getFileDownloadUrl } from "@/lib/api/files";

export function useFile(id: string) {
  return useQuery({
    queryKey: ["file", id],
    queryFn: () => getFile(id),
    enabled: !!id,
  });
}

export function useFileUrl(fileId: string | undefined) {
  return useQuery({
    queryKey: ["file-url", fileId],
    queryFn: () => getFileDownloadUrl(fileId!),
    enabled: !!fileId,
    staleTime: 1000 * 60 * 10, // URLs typically valid for 15 mins, cache for 10
    gcTime: 1000 * 60 * 12,
  });
}
