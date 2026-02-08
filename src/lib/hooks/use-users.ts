"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
} from "@/lib/api/users";
import {
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";
import { useMutationWithToast } from "./use-mutation-with-toast";

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users-search", query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
  });
}

export function useCreateUser() {
  return useMutationWithToast({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    invalidateKeys: [["users"]],
    successMessage: {
      title: "User created",
      description: "The user has been created successfully.",
    },
  });
}

export function useUpdateUser() {
  return useMutationWithToast({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    invalidateKeys: [
      ["users"],
      (vars) => ["user", vars.id],
    ],
    successMessage: {
      title: "User updated",
      description: "The user has been updated successfully.",
    },
  });
}

export function useDeleteUser() {
  return useMutationWithToast({
    mutationFn: (id: string) => deleteUser(id),
    invalidateKeys: [["users"]],
    successMessage: {
      title: "User deleted",
      description: "The user has been deleted successfully.",
    },
  });
}
