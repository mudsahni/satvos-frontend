"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

type InvalidateKey<TVariables> =
  | string[]
  | ((variables: TVariables) => string[]);

type ToastMessage<TData, TVariables> =
  | { title: string; description: string }
  | ((data: TData, variables: TVariables) => { title: string; description: string });

interface MutationWithToastOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: InvalidateKey<TVariables>[];
  successMessage: ToastMessage<TData, TVariables>;
  errorTitle?: string;
}

export function useMutationWithToast<TData, TVariables>({
  mutationFn,
  invalidateKeys,
  successMessage,
  errorTitle = "Error",
}: MutationWithToastOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          const queryKey = typeof key === "function" ? key(variables) : key;
          queryClient.invalidateQueries({ queryKey });
        }
      }

      const message =
        typeof successMessage === "function"
          ? successMessage(data, variables)
          : successMessage;

      toast(message);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: errorTitle,
        description: getErrorMessage(error),
      });
    },
  });
}
