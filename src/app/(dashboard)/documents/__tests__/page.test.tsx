import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

// --- Module-level mocks (must be before imports of mocked modules) ---

vi.mock("@/lib/hooks/use-documents", () => ({
  useDocuments: vi.fn(),
  useDeleteDocument: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}));

vi.mock("@/lib/hooks/use-debounced-value", () => ({
  useDebouncedValue: vi.fn((v: unknown) => v),
}));

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollections: vi.fn(() => ({
    data: {
      items: [
        { id: "col-1", name: "Invoices Q1" },
        { id: "col-2", name: "Receipts" },
      ],
    },
  })),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock("@/lib/api/documents", () => ({
  getDocuments: vi.fn(),
}));

vi.mock("@/lib/utils/fetch-all-paginated", () => ({
  fetchAllPaginated: vi.fn(),
}));

vi.mock("@/lib/utils/format", () => ({
  formatRelativeTime: vi.fn((date: string) => "2 days ago"),
}));

vi.mock("next/link", () => ({
  default: vi.fn(({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/documents"),
}));

vi.mock("@/components/documents/status-badge", () => ({
  StatusBadge: ({ type, status }: { type: string; status: string }) => (
    <span data-testid={`status-badge-${type}`}>{status}</span>
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

vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ id }: { id: string }) => <span data-testid="user-name">{id}</span>,
}));

// --- Imports after mocks ---

import DocumentsPage from "../page";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useQuery } from "@tanstack/react-query";

// --- Helpers ---

function createMockDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    tenant_id: "tenant-1",
    collection_id: "col-1",
    file_id: "file-1",
    name: "Invoice 001.pdf",
    parsing_status: "completed",
    validation_status: "valid",
    review_status: "pending",
    reconciliation_status: "pending",
    parse_mode: "single",
    assigned_to: null,
    assigned_at: null,
    assigned_by: null,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderPage() {
  return renderWithProviders(<DocumentsPage />);
}

// --- Tests ---

describe("DocumentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when data is loading", async () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDocuments>);

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    // The page title and description should be visible
    expect(
      screen.getByText("View and manage your processed documents")
    ).toBeInTheDocument();

    // Documents table should NOT be rendered while loading
    expect(screen.queryByText("Invoice 001.pdf")).not.toBeInTheDocument();
  });

  it("shows empty state when no documents exist", async () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDocuments>);

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("No documents")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Upload some documents to get started.")
    ).toBeInTheDocument();
  });

  it("renders document data when documents exist", async () => {
    const docs = [
      createMockDocument({ id: "doc-1", name: "Invoice 001.pdf" }),
      createMockDocument({ id: "doc-2", name: "Invoice 002.pdf" }),
    ];

    vi.mocked(useDocuments).mockReturnValue({
      data: { items: docs, total: 2, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDocuments>);

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Invoice 001.pdf")).toBeInTheDocument();
    });

    expect(screen.getByText("Invoice 002.pdf")).toBeInTheDocument();
    // Status badges should be rendered for each document
    expect(screen.getAllByTestId("status-badge-parsing")).toHaveLength(2);
    expect(screen.getAllByTestId("status-badge-validation")).toHaveLength(2);
    expect(screen.getAllByTestId("status-badge-review")).toHaveLength(2);
  });

  it("shows search input", async () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDocuments>);

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search documents...")
      ).toBeInTheDocument();
    });
  });

  it("shows collection filter dropdown", async () => {
    vi.mocked(useDocuments).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDocuments>);

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      // The collection filter select should show the default "All Collections" text
      expect(screen.getByText("All Collections")).toBeInTheDocument();
    });
  });
});
