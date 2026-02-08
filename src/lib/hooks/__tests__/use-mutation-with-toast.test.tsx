import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useMutationWithToast } from "../use-mutation-with-toast";

// Mock toast and getErrorMessage
vi.mock("@/lib/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  getErrorMessage: vi.fn((err: Error) => err.message),
}));

import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

const mockToast = vi.mocked(toast);
const mockGetErrorMessage = vi.mocked(getErrorMessage);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useMutationWithToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls mutationFn with provided variables", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Done", description: "Success" },
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.mutateAsync({ name: "test" });
    });

    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(mutationFn.mock.calls[0][0]).toEqual({ name: "test" });
  });

  it("shows success toast with static message on success", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Created", description: "Item was created." },
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.mutateAsync("input");
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Created",
      description: "Item was created.",
    });
  });

  it("shows success toast with dynamic message on success", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ name: "Test" });

    const { result } = renderHook(
      () =>
        useMutationWithToast<{ name: string }, { action: string }>({
          mutationFn,
          successMessage: (data, vars) => ({
            title: `${vars.action} completed`,
            description: `${data.name} was ${vars.action}ed.`,
          }),
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.mutateAsync({ action: "approv" });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "approv completed",
      description: "Test was approved.",
    });
  });

  it("shows error toast with default title on failure", async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error("Network error"));
    mockGetErrorMessage.mockReturnValue("Network error");

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Done", description: "Success" },
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync("input");
      } catch {
        // expected
      }
    });

    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Error",
      description: "Network error",
    });
  });

  it("shows error toast with custom title on failure", async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error("Export failed"));
    mockGetErrorMessage.mockReturnValue("Export failed");

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Done", description: "Success" },
          errorTitle: "Export failed",
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync("input");
      } catch {
        // expected
      }
    });

    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Export failed",
      description: "Export failed",
    });
  });

  it("invalidates static query keys on success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          invalidateKeys: [["documents"], ["stats"]],
          successMessage: { title: "Done", description: "Success" },
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync("input");
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["documents"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["stats"] });
  });

  it("invalidates dynamic query keys using variables", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(
      () =>
        useMutationWithToast<unknown, { id: string }>({
          mutationFn,
          invalidateKeys: [
            ["documents"],
            (vars) => ["document", vars.id],
          ],
          successMessage: { title: "Done", description: "Success" },
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({ id: "doc-123" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["documents"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["document", "doc-123"],
    });
  });

  it("does not invalidate queries when no invalidateKeys provided", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const mutationFn = vi.fn().mockResolvedValue({});

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Done", description: "Success" },
        }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync("input");
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("does not show success toast when mutation fails", async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error("fail"));
    mockGetErrorMessage.mockReturnValue("fail");

    const { result } = renderHook(
      () =>
        useMutationWithToast({
          mutationFn,
          successMessage: { title: "Created", description: "Item created." },
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync("input");
      } catch {
        // expected
      }
    });

    // Only the error toast, not the success toast
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });
});
