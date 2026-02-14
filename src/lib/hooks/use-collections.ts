"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  exportCollectionCsv,
  getCollectionPermissions,
  addCollectionPermission,
  updateCollectionPermission,
  deleteCollectionPermission,
} from "@/lib/api/collections";
import {
  CollectionListParams,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddPermissionRequest,
  UpdatePermissionRequest,
} from "@/types/collection";
import { useMutationWithToast } from "./use-mutation-with-toast";

export function useCollections(params?: CollectionListParams) {
  return useQuery({
    queryKey: ["collections", params],
    queryFn: () => getCollections(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => getCollection(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCollection() {
  return useMutationWithToast({
    mutationFn: (data: CreateCollectionRequest) => createCollection(data),
    invalidateKeys: [["collections"]],
    successMessage: {
      title: "Collection created",
      description: "Your collection has been created successfully.",
    },
  });
}

export function useUpdateCollection() {
  return useMutationWithToast({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionRequest }) =>
      updateCollection(id, data),
    invalidateKeys: [
      ["collections"],
      (vars) => ["collection", vars.id],
    ],
    successMessage: {
      title: "Collection updated",
      description: "Your collection has been updated successfully.",
    },
  });
}

export function useDeleteCollection() {
  return useMutationWithToast({
    mutationFn: (id: string) => deleteCollection(id),
    invalidateKeys: [["collections"]],
    successMessage: {
      title: "Collection deleted",
      description: "Your collection has been deleted successfully.",
    },
  });
}

// CSV Export
export function useExportCollectionCsv() {
  return useMutationWithToast({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      exportCollectionCsv(id, name),
    successMessage: {
      title: "CSV exported",
      description: "Your CSV file has been downloaded.",
    },
    errorTitle: "Export failed",
  });
}

// Permissions hooks
export function useCollectionPermissions(collectionId: string) {
  return useQuery({
    queryKey: ["collection-permissions", collectionId],
    queryFn: () => getCollectionPermissions(collectionId),
    enabled: !!collectionId,
  });
}

export function useAddCollectionPermission() {
  return useMutationWithToast({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: AddPermissionRequest;
    }) => addCollectionPermission(collectionId, data),
    invalidateKeys: [
      (vars) => ["collection-permissions", vars.collectionId],
    ],
    successMessage: {
      title: "Permission added",
      description: "User permission has been added successfully.",
    },
  });
}

export function useUpdateCollectionPermission() {
  return useMutationWithToast({
    mutationFn: ({
      collectionId,
      userId,
      data,
    }: {
      collectionId: string;
      userId: string;
      data: UpdatePermissionRequest;
    }) => updateCollectionPermission(collectionId, userId, data),
    invalidateKeys: [
      (vars) => ["collection-permissions", vars.collectionId],
    ],
    successMessage: {
      title: "Permission updated",
      description: "User permission has been updated successfully.",
    },
  });
}

export function useDeleteCollectionPermission() {
  return useMutationWithToast({
    mutationFn: ({
      collectionId,
      userId,
    }: {
      collectionId: string;
      userId: string;
    }) => deleteCollectionPermission(collectionId, userId),
    invalidateKeys: [
      (vars) => ["collection-permissions", vars.collectionId],
    ],
    successMessage: {
      title: "Permission removed",
      description: "User permission has been removed successfully.",
    },
  });
}
