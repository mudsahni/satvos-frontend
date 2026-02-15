import { screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

// --- Module-level mocks (must be before imports of mocked modules) ---

const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
const mockMutationResult = {
  mutateAsync: mockMutateAsync,
  isPending: false,
};

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollection: vi.fn(),
  useExportCollectionCsv: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useExportCollectionTally: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/lib/hooks/use-documents", () => ({
  useReviewDocument: vi.fn(() => mockMutationResult),
  useDeleteDocument: vi.fn(() => mockMutationResult),
  useAssignDocument: vi.fn(() => mockMutationResult),
}));

vi.mock("@/lib/hooks/use-bulk-actions", () => ({
  useBulkActions: vi.fn(() => ({
    selectedIds: [],
    setSelectedIds: vi.fn(),
    selectedSet: new Set(),
    isBulkProcessing: false,
    clearSelection: vi.fn(),
    createBulkHandler: vi.fn(() => vi.fn()),
  })),
}));

vi.mock("@/lib/hooks/use-debounced-value", () => ({
  useDebouncedValue: vi.fn((v: unknown) => v),
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

vi.mock("@/lib/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: vi.fn(({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/collections/coll-1"),
}));

// Mock child components to keep tests focused on the page itself
vi.mock("@/components/collections/collection-header", () => ({
  CollectionHeader: ({ collection }: { collection: { name: string } }) => (
    <div data-testid="collection-header">{collection.name}</div>
  ),
}));

vi.mock("@/components/collections/collection-filters", () => ({
  CollectionFilters: () => <div data-testid="collection-filters" />,
  // Re-export the type aliases so the page import doesn't break
  ValidationStatusFilter: undefined,
  ReviewStatusFilter: undefined,
}));

vi.mock("@/components/documents/documents-table", () => ({
  DocumentsTable: ({ documents }: { documents: Array<{ id: string; name: string }> }) => (
    <table data-testid="documents-table">
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock("@/components/documents/bulk-actions-bar", () => ({
  BulkActionsBar: () => <div data-testid="bulk-actions-bar" />,
}));

vi.mock("@/components/documents/bulk-assign-dialog", () => ({
  BulkAssignDialog: () => <div data-testid="bulk-assign-dialog" />,
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

// --- Imports after mocks ---

import CollectionDetailPage from "../page";
import { useCollection } from "@/lib/hooks/use-collections";
import { useQuery } from "@tanstack/react-query";

// --- Helpers ---

function createMockCollection(overrides: Record<string, unknown> = {}) {
  return {
    id: "coll-1",
    tenant_id: "tenant-1",
    name: "Test Collection",
    description: "A test collection",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    user_permission: "owner",
    ...overrides,
  };
}

function createMockDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    tenant_id: "tenant-1",
    collection_id: "coll-1",
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

// Stable promise reference for React 19 use(params)
const stableParams = Promise.resolve({ id: "coll-1" });

function renderPage() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading page...</div>}>
      <CollectionDetailPage params={stableParams} />
    </Suspense>
  );
}

// --- Tests ---

describe("CollectionDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when collection is loading", async () => {
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useCollection>);

    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      // When collectionLoading is true, the page renders Skeleton placeholders
      // and does NOT render the collection header or "Collection not found"
      expect(screen.queryByTestId("collection-header")).not.toBeInTheDocument();
      expect(screen.queryByText("Collection not found")).not.toBeInTheDocument();
    });
  });

  it("shows 'Collection not found' when collection is null and not loading", async () => {
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof useCollection>);

    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Collection not found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /The collection you're looking for doesn't exist or you don't have access to it./
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Back to Collections")).toBeInTheDocument();
  });

  it("renders collection header when collection exists", async () => {
    const collection = createMockCollection();

    vi.mocked(useCollection).mockReturnValue({
      data: collection,
      isPending: false,
    } as unknown as ReturnType<typeof useCollection>);

    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("collection-header")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Collection")).toBeInTheDocument();
  });

  it("shows empty state when documents array is empty", async () => {
    const collection = createMockCollection();

    vi.mocked(useCollection).mockReturnValue({
      data: collection,
      isPending: false,
    } as unknown as ReturnType<typeof useCollection>);

    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("No documents")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /This collection doesn't have any documents yet/
      )
    ).toBeInTheDocument();
  });

  it("shows documents table when documents exist", async () => {
    const collection = createMockCollection();
    const docs = [
      createMockDocument({ id: "doc-1", name: "Invoice 001.pdf" }),
      createMockDocument({ id: "doc-2", name: "Invoice 002.pdf" }),
    ];

    vi.mocked(useCollection).mockReturnValue({
      data: collection,
      isPending: false,
    } as unknown as ReturnType<typeof useCollection>);

    vi.mocked(useQuery).mockReturnValue({
      data: docs,
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("documents-table")).toBeInTheDocument();
    });

    expect(screen.getByText("Invoice 001.pdf")).toBeInTheDocument();
    expect(screen.getByText("Invoice 002.pdf")).toBeInTheDocument();
  });
});
