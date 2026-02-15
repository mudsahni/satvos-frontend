import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/lib/api/documents", () => ({
  reviewDocument: vi.fn(),
  deleteDocument: vi.fn(),
  assignDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  triggerParsing: vi.fn(),
  getValidationResults: vi.fn(),
  triggerValidation: vi.fn(),
  getReviewQueue: vi.fn(),
  getDocumentTags: vi.fn(),
  addDocumentTag: vi.fn(),
  deleteDocumentTag: vi.fn(),
}));

vi.mock("@/lib/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  getErrorMessage: vi.fn((e: any) => e?.message || "Error"),
}));

import {
  useReviewDocument,
  useDeleteDocument,
  useAssignDocument,
} from "../use-documents";
import {
  reviewDocument,
  deleteDocument,
  assignDocument,
} from "@/lib/api/documents";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

const mockReviewDocument = vi.mocked(reviewDocument);
const mockDeleteDocument = vi.mocked(deleteDocument);
const mockAssignDocument = vi.mocked(assignDocument);
const mockToast = vi.mocked(toast);
const mockGetErrorMessage = vi.mocked(getErrorMessage);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useReviewDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls reviewDocument with correct args when approving", async () => {
    mockReviewDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useReviewDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-1",
        data: { status: "approved" },
      });
    });

    expect(mockReviewDocument).toHaveBeenCalledTimes(1);
    expect(mockReviewDocument).toHaveBeenCalledWith("doc-1", {
      status: "approved",
    });
  });

  it("calls reviewDocument with correct args when rejecting", async () => {
    mockReviewDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useReviewDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-2",
        data: { status: "rejected" },
      });
    });

    expect(mockReviewDocument).toHaveBeenCalledTimes(1);
    expect(mockReviewDocument).toHaveBeenCalledWith("doc-2", {
      status: "rejected",
    });
  });

  it('shows "Document approved" toast on approval', async () => {
    mockReviewDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useReviewDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-1",
        data: { status: "approved" },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Document approved",
      description: "The document has been approved.",
    });
  });

  it('shows "Document rejected" toast on rejection', async () => {
    mockReviewDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useReviewDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-1",
        data: { status: "rejected" },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Document rejected",
      description: "The document has been rejected.",
    });
  });
});

describe("useDeleteDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteDocument with the document id", async () => {
    mockDeleteDocument.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("doc-99");
    });

    expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
    expect(mockDeleteDocument).toHaveBeenCalledWith("doc-99");
  });

  it("shows success toast after deletion", async () => {
    mockDeleteDocument.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("doc-99");
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Document deleted",
      description: "Your document has been deleted successfully.",
    });
  });

  it("shows error toast on failure", async () => {
    const error = new Error("Not found");
    mockDeleteDocument.mockRejectedValue(error);
    mockGetErrorMessage.mockReturnValue("Not found");

    const { result } = renderHook(() => useDeleteDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync("doc-bad");
      } catch {
        // expected
      }
    });

    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Error",
      description: "Not found",
    });
  });
});

describe("useAssignDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls assignDocument with correct args", async () => {
    mockAssignDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useAssignDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-5",
        data: { assignee_id: "user-42" },
      });
    });

    expect(mockAssignDocument).toHaveBeenCalledTimes(1);
    expect(mockAssignDocument).toHaveBeenCalledWith("doc-5", {
      assignee_id: "user-42",
    });
  });

  it('shows "Reviewer assigned" toast when assigning a reviewer', async () => {
    mockAssignDocument.mockResolvedValue({} as any);

    const { result } = renderHook(() => useAssignDocument(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "doc-5",
        data: { assignee_id: "user-42" },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Reviewer assigned",
      description: "The document has been assigned for review.",
    });
  });
});
