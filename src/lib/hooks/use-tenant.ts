"use client";

import { useQuery } from "@tanstack/react-query";
import { getTenant, updateTenant } from "@/lib/api/admin";
import { UpdateTenantRequest } from "@/types/tenant";
import { useMutationWithToast } from "./use-mutation-with-toast";

export function useTenant() {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: getTenant,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateTenant() {
  return useMutationWithToast({
    mutationFn: (data: UpdateTenantRequest) => updateTenant(data),
    invalidateKeys: [["tenant"]],
    successMessage: {
      title: "Tenant updated",
      description: "Tenant settings have been saved successfully.",
    },
    errorTitle: "Failed to update tenant",
  });
}
