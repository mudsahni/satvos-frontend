import { screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DocumentDetailPage from "../page";

// --- Mocks ---

const mockMutationResult = {
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
};

vi.mock("@/lib/hooks/use-documents", () => ({
  useDocument: vi.fn(),
  useDocumentTags: vi.fn(() => ({ data: undefined })),
  useUpdateDocument: vi.fn(() => mockMutationResult),
  useReviewDocument: vi.fn(() => mockMutationResult),
  useTriggerParsing: vi.fn(() => mockMutationResult),
  useTriggerValidation: vi.fn(() => mockMutationResult),
  useAddDocumentTag: vi.fn(() => mockMutationResult),
  useDeleteDocumentTag: vi.fn(() => mockMutationResult),
}));

vi.mock("@/lib/hooks/use-files", () => ({
  useFileUrl: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollection: vi.fn(),
}));

vi.mock("@/lib/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => true),
}));

vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ id }: { id: string }) => <span>Test User</span>,
}));

vi.mock("@/components/documents/status-badge", () => ({
  StatusBadge: ({ type, status }: { type: string; status: string }) => (
    <span data-testid={`status-badge-${type}`}>{status}</span>
  ),
}));

vi.mock("@/components/documents/document-viewer", () => ({
  DocumentViewer: () => <div data-testid="pdf-viewer" />,
}));

vi.mock("@/components/documents/document-tabs", () => ({
  DocumentTabs: () => <div data-testid="document-tabs" />,
}));

vi.mock("@/components/documents/assign-reviewer", () => ({
  AssignReviewer: () => <div data-testid="assign-reviewer" />,
}));

import { useDocument } from "@/lib/hooks/use-documents";
import { useCollection } from "@/lib/hooks/use-collections";

// --- Helpers ---

function createMockDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    tenant_id: "tenant-1",
    collection_id: "col-1",
    file_id: "file-1",
    name: "Test Invoice.pdf",
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
    validation_results: [],
    ...overrides,
  };
}

// Stable promise reference — must be created once outside render so
// React's use() doesn't see a new object on every re-render and keep suspending.
const stableParams = Promise.resolve({ id: "doc-1" });

function renderPage() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading page...</div>}>
      <DocumentDetailPage params={stableParams} />
    </Suspense>
  );
}

// --- Tests ---

describe("DocumentDetailPage breadcrumb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when document is still loading", async () => {
    vi.mocked(useDocument).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useDocument>);
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useCollection>);

    // use() suspends the first render until the params promise resolves.
    // With isLoading=true, the page shows a skeleton — no "Documents" breadcrumb.
    renderPage();

    // The component may still be suspended on first tick — wait for content
    await waitFor(() => {
      // Either still in Suspense or showing skeleton (no breadcrumb)
      expect(screen.queryByText("Documents")).not.toBeInTheDocument();
    });
  });

  it("shows collection name in breadcrumb when collection has loaded", async () => {
    const doc = createMockDocument({ collection_id: "col-1" });
    vi.mocked(useDocument).mockReturnValue({
      data: doc,
      isLoading: false,
    } as unknown as ReturnType<typeof useDocument>);
    vi.mocked(useCollection).mockReturnValue({
      data: {
        id: "col-1",
        name: "My Test Collection",
        tenant_id: "t1",
        created_by: "u1",
        created_at: "",
        updated_at: "",
      },
      isPending: false,
    } as unknown as ReturnType<typeof useCollection>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    expect(screen.getByText("My Test Collection")).toBeInTheDocument();
    // Document name appears in breadcrumb AND title — at least one
    expect(screen.getAllByText("Test Invoice.pdf").length).toBeGreaterThanOrEqual(1);
  });

  it("shows skeleton placeholder while collection is pending", async () => {
    const doc = createMockDocument({ collection_id: "col-1" });
    vi.mocked(useDocument).mockReturnValue({
      data: doc,
      isLoading: false,
    } as unknown as ReturnType<typeof useDocument>);
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useCollection>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    // Collection name should NOT be present
    expect(screen.queryByText("My Test Collection")).not.toBeInTheDocument();
    // Fallback "Collection" should NOT be present (still pending)
    expect(screen.queryByText("Collection")).not.toBeInTheDocument();
    // Document name should be present
    expect(screen.getAllByText("Test Invoice.pdf").length).toBeGreaterThanOrEqual(1);
  });

  it("shows fallback link when collection fetch failed (not pending, no data)", async () => {
    const doc = createMockDocument({ collection_id: "col-1" });
    vi.mocked(useDocument).mockReturnValue({
      data: doc,
      isLoading: false,
    } as unknown as ReturnType<typeof useDocument>);
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useCollection>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    // Fallback "Collection" should be a link
    const fallbackLink = screen.getByText("Collection");
    expect(fallbackLink).toBeInTheDocument();
    expect(fallbackLink.closest("a")).toHaveAttribute("href", "/collections/col-1");
    expect(screen.getAllByText("Test Invoice.pdf").length).toBeGreaterThanOrEqual(1);
  });

  it("skips collection segment when document has empty collection_id", async () => {
    const doc = createMockDocument({ collection_id: "" });
    vi.mocked(useDocument).mockReturnValue({
      data: doc,
      isLoading: false,
    } as unknown as ReturnType<typeof useDocument>);
    vi.mocked(useCollection).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useCollection>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Test Invoice.pdf").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Collection")).not.toBeInTheDocument();
  });
});
