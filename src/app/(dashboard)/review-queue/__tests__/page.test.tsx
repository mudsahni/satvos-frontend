import { screen, within } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
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

vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ }: { id: string }) => <span>Test User</span>,
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

import { useReviewQueue, useReviewDocument } from "@/lib/hooks/use-documents";

const mockDocuments = [
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
];

function mockWithDocuments() {
  vi.mocked(useReviewQueue).mockReturnValue({
    data: {
      items: mockDocuments,
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useReviewQueue>);
}

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
    mockWithDocuments();
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

  it("renders checkboxes for each document row and a select-all checkbox", () => {
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    const checkboxes = screen.getAllByRole("checkbox");
    // 1 select-all + 2 per-row
    expect(checkboxes).toHaveLength(3);
    expect(screen.getByLabelText("Select all documents")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Invoice 001")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Invoice 002")).toBeInTheDocument();
  });

  it("selects and deselects individual documents", async () => {
    const user = userEvent.setup();
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    const checkbox1 = screen.getByLabelText("Select Invoice 001");
    await user.click(checkbox1);

    // Bulk bar should appear with 1 selected
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    // Click again to deselect
    await user.click(checkbox1);
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });

  it("select-all toggles all documents", async () => {
    const user = userEvent.setup();
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    await user.click(screen.getByLabelText("Select all documents"));
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    // Click again to deselect all
    await user.click(screen.getByLabelText("Select all documents"));
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });

  it("shows bulk actions bar with approve and reject but no delete", async () => {
    const user = userEvent.setup();
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    await user.click(screen.getByLabelText("Select all documents"));

    const bulkBar = screen.getByText("2 selected").closest("div")!;
    expect(within(bulkBar).getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(within(bulkBar).getByRole("button", { name: /reject/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("bulk approve calls reviewDocument for each selected doc", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useReviewDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof useReviewDocument>);
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    await user.click(screen.getByLabelText("Select all documents"));
    await user.click(screen.getByRole("button", { name: /approve/i }));
    // Confirm dialog
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "doc-1",
      data: { status: "approved" },
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "doc-2",
      data: { status: "approved" },
    });
  });

  it("bulk reject calls reviewDocument for each selected doc", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useReviewDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof useReviewDocument>);
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    await user.click(screen.getByLabelText("Select all documents"));
    await user.click(screen.getByRole("button", { name: /reject/i }));
    // Confirm dialog
    await user.click(screen.getByRole("button", { name: /reject all/i }));

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "doc-1",
      data: { status: "rejected" },
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "doc-2",
      data: { status: "rejected" },
    });
  });

  it("clears selection after successful bulk action", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useReviewDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof useReviewDocument>);
    mockWithDocuments();
    renderWithProviders(<ReviewQueuePage />);

    await user.click(screen.getByLabelText("Select all documents"));
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    // Selection should be cleared
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });
});
