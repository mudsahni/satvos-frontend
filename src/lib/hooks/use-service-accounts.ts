"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServiceAccounts,
  getServiceAccount,
  createServiceAccount,
  rotateServiceAccountKey,
  revokeServiceAccount,
  deleteServiceAccount,
  getServiceAccountPermissions,
  grantServiceAccountPermission,
  removeServiceAccountPermission,
} from "@/lib/api/service-accounts";
import {
  CreateServiceAccountRequest,
  GrantServiceAccountPermissionRequest,
  ServiceAccountListParams,
} from "@/types/service-account";
import { useMutationWithToast } from "./use-mutation-with-toast";

export function useServiceAccounts(params?: ServiceAccountListParams) {
  return useQuery({
    queryKey: ["service-accounts", params],
    queryFn: () => getServiceAccounts(params),
  });
}

export function useServiceAccount(id: string) {
  return useQuery({
    queryKey: ["service-account", id],
    queryFn: () => getServiceAccount(id),
    enabled: !!id,
  });
}

// Returns raw mutation — caller handles the API key reveal UX
export function useCreateServiceAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceAccountRequest) =>
      createServiceAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-accounts"] });
    },
  });
}

// Returns raw mutation — caller handles the API key reveal UX
export function useRotateServiceAccountKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rotateServiceAccountKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-accounts"] });
    },
  });
}

export function useRevokeServiceAccount() {
  return useMutationWithToast({
    mutationFn: (id: string) => revokeServiceAccount(id),
    invalidateKeys: [
      ["service-accounts"],
      (id) => ["service-account", id],
    ],
    successMessage: {
      title: "Service account revoked",
      description:
        "The service account has been deactivated. API calls using this key will fail.",
    },
    errorTitle: "Failed to revoke service account",
  });
}

export function useDeleteServiceAccount() {
  return useMutationWithToast({
    mutationFn: (id: string) => deleteServiceAccount(id),
    invalidateKeys: [["service-accounts"]],
    successMessage: {
      title: "Service account deleted",
      description: "The service account has been permanently deleted.",
    },
    errorTitle: "Failed to delete service account",
  });
}

export function useServiceAccountPermissions(id: string) {
  return useQuery({
    queryKey: ["service-account-permissions", id],
    queryFn: () => getServiceAccountPermissions(id),
    enabled: !!id,
  });
}

export function useGrantServiceAccountPermission() {
  return useMutationWithToast({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: GrantServiceAccountPermissionRequest;
    }) => grantServiceAccountPermission(id, data),
    invalidateKeys: [
      (vars) => ["service-account-permissions", vars.id],
    ],
    successMessage: {
      title: "Permission granted",
      description: "Collection access has been granted to the service account.",
    },
    errorTitle: "Failed to grant permission",
  });
}

export function useRemoveServiceAccountPermission() {
  return useMutationWithToast({
    mutationFn: ({
      id,
      collectionId,
    }: {
      id: string;
      collectionId: string;
    }) => removeServiceAccountPermission(id, collectionId),
    invalidateKeys: [
      (vars) => ["service-account-permissions", vars.id],
    ],
    successMessage: {
      title: "Permission removed",
      description:
        "Collection access has been removed from the service account.",
    },
    errorTitle: "Failed to remove permission",
  });
}
