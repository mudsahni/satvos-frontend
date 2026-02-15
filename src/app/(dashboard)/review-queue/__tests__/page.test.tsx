import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReviewQueuePage from "../page";

const mockRefetch = vi.fn();

vi.mock("@/lib/hooks/use-documents", () => ({
  useReviewQueue: vi.fn(),
  useReviewDocument: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollections: vi.fn(() => ({ data: { items: [] } })),
}));

vi.mock("@/lib/hooks/use-users", () => ({
  useUser: () => ({ data: { full_name: "Test User" }, isLoading: false }),
}));

vi.mock("@/components/documents/status-badge", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

vi.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="error-state">
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

import { useReviewQueue } from "@/lib/hooks/use-documents";

describe("ReviewQueuePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons while loading", () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useReviewQueue>);

    renderWithProviders(<ReviewQueuePage />);

    expect(screen.getByText("Review Queue")).toBeInTheDocument();
  });

  it("shows empty state when queue is empty", () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useReviewQueue>);

    renderWithProviders(<ReviewQueuePage />);

    expect(screen.getByText("Queue is empty")).toBeInTheDocument();
    expect(
      screen.getByText("No documents are currently assigned to you for review.")
    ).toBeInTheDocument();
  });

  it("renders document list when data is available", () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: {
        items: [
          {
            id: "doc-1",
            name: "Invoice 001",
            assigned_to: "user-1",
            assigned_at: "2026-02-14T10:00:00Z",
            assigned_by: "user-2",
            collection_id: "col-1",
            validation_status: "valid",
            review_status: "pending",
            parsing_status: "completed",
            reconciliation_status: "pending",
            parse_mode: "single",
            created_by: "user-2",
            created_at: "2026-02-13T00:00:00Z",
            updated_at: "2026-02-13T00:00:00Z",
          },
          {
            id: "doc-2",
            name: "Invoice 002",
            assigned_to: "user-1",
            assigned_at: "2026-02-14T11:00:00Z",
            assigned_by: "user-3",
            collection_id: "col-1",
            validation_status: "warning",
            review_status: "pending",
            parsing_status: "completed",
            reconciliation_status: "pending",
            parse_mode: "single",
            created_by: "user-3",
            created_at: "2026-02-13T00:00:00Z",
            updated_at: "2026-02-13T00:00:00Z",
          },
        ],
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useReviewQueue>);

    renderWithProviders(<ReviewQueuePage />);

    expect(screen.getByText("Invoice 001")).toBeInTheDocument();
    expect(screen.getByText("Invoice 002")).toBeInTheDocument();
    expect(screen.getByText("2 documents to review")).toBeInTheDocument();
  });

  it("shows error state on error", () => {
    vi.mocked(useReviewQueue).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useReviewQueue>);

    renderWithProviders(<ReviewQueuePage />);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
  });
});
