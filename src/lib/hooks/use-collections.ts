"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
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
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

export function useCollections(params?: CollectionListParams) {
  return useQuery({
    queryKey: ["collections", params],
    queryFn: () => getCollections(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes - collections rarely change
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => getCollection(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionRequest) => createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Collection created",
        description: "Your collection has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionRequest }) =>
      updateCollection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", variables.id] });
      toast({
        title: "Collection updated",
        description: "Your collection has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: AddPermissionRequest;
    }) => addCollectionPermission(collectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["collection-permissions", variables.collectionId],
      });
      toast({
        title: "Permission added",
        description: "User permission has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateCollectionPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      permissionId,
      data,
    }: {
      collectionId: string;
      permissionId: string;
      data: UpdatePermissionRequest;
    }) => updateCollectionPermission(collectionId, permissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["collection-permissions", variables.collectionId],
      });
      toast({
        title: "Permission updated",
        description: "User permission has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteCollectionPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      permissionId,
    }: {
      collectionId: string;
      permissionId: string;
    }) => deleteCollectionPermission(collectionId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["collection-permissions", variables.collectionId],
      });
      toast({
        title: "Permission removed",
        description: "User permission has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}
