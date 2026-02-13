import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { CollectionCard, CollectionCardSkeleton } from "../collection-card";
import { Collection } from "@/types/collection";

// Mock useUser to prevent network requests from UserName component
vi.mock("@/lib/hooks/use-users", () => ({
  useUser: () => ({ data: { full_name: "Test User" }, isLoading: false }),
}));

// Mock next/navigation for Link components
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/collections",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

function createMockCollection(
  overrides: Partial<Collection> = {}
): Collection {
  return {
    id: "col-abc-123",
    tenant_id: "tenant-1",
    name: "Q4 Invoices",
    description: "Fourth quarter invoices for 2024",
    created_by: "user@example.com",
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
    documents_count: 42,
    user_permission: "owner",
    ...overrides,
  };
}

describe("CollectionCard", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe("basic rendering", () => {
    it("renders collection name", () => {
      const collection = createMockCollection({ name: "My Invoices" });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("My Invoices")).toBeInTheDocument();
    });

    it("renders collection description", () => {
      const collection = createMockCollection({
        description: "Important documents",
      });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("Important documents")).toBeInTheDocument();
    });

    it("renders 'No description' when description is empty", () => {
      const collection = createMockCollection({ description: undefined });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("No description")).toBeInTheDocument();
    });
  });

  describe("document count", () => {
    it("shows document count from documents_count", () => {
      const collection = createMockCollection({ documents_count: 15 });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("15 docs")).toBeInTheDocument();
    });

    it("shows 0 docs when no count fields are set", () => {
      const collection = createMockCollection({
        documents_count: undefined,
        document_count: undefined,
        files_count: undefined,
        file_count: undefined,
        total_documents: undefined,
      });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("0 docs")).toBeInTheDocument();
    });

    it("falls back to files_count when documents_count is not set", () => {
      const collection = createMockCollection({
        documents_count: undefined,
        files_count: 7,
      });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("7 docs")).toBeInTheDocument();
    });
  });

  describe("creation date", () => {
    it("shows formatted creation date", () => {
      const collection = createMockCollection({
        created_at: "2025-06-15T08:00:00Z",
      });
      renderWithProviders(<CollectionCard collection={collection} />);

      // formatDate returns "MMM d, yyyy" format
      expect(screen.getByText("Jun 15, 2025")).toBeInTheDocument();
    });
  });

  describe("permission badge", () => {
    it("shows 'owner' badge when user_permission is owner", () => {
      const collection = createMockCollection({ user_permission: "owner" });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("owner")).toBeInTheDocument();
    });

    it("shows 'editor' badge when user_permission is editor", () => {
      const collection = createMockCollection({ user_permission: "editor" });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("editor")).toBeInTheDocument();
    });

    it("shows 'viewer' badge when user_permission is viewer", () => {
      const collection = createMockCollection({ user_permission: "viewer" });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("viewer")).toBeInTheDocument();
    });

    it("shows 'viewer' as default when user_permission is not set", () => {
      const collection = createMockCollection({
        user_permission: undefined,
      });
      renderWithProviders(<CollectionCard collection={collection} />);

      expect(screen.getByText("viewer")).toBeInTheDocument();
    });
  });

  describe("link navigation", () => {
    it("renders a link to the collection detail page", () => {
      const collection = createMockCollection({ id: "col-xyz-789" });
      renderWithProviders(<CollectionCard collection={collection} />);

      const link = screen.getByRole("link", { name: /Q4 Invoices/i });
      expect(link).toHaveAttribute("href", "/collections/col-xyz-789");
    });
  });

  describe("export CSV action", () => {
    it("shows Export CSV menu item when onExportCsv is provided", async () => {
      const user = userEvent.setup();
      const collection = createMockCollection();
      const onExportCsv = vi.fn();
      renderWithProviders(
        <CollectionCard collection={collection} onExportCsv={onExportCsv} />
      );

      // Open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("does not show Export CSV when onExportCsv is not provided", async () => {
      const user = userEvent.setup();
      const collection = createMockCollection();
      renderWithProviders(<CollectionCard collection={collection} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.queryByText("Export CSV")).not.toBeInTheDocument();
    });

    it("calls onExportCsv with collection id and name when clicked", async () => {
      const user = userEvent.setup();
      const collection = createMockCollection({ id: "col-99", name: "Tax Docs" });
      const onExportCsv = vi.fn();
      renderWithProviders(
        <CollectionCard collection={collection} onExportCsv={onExportCsv} />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);
      await user.click(screen.getByText("Export CSV"));

      expect(onExportCsv).toHaveBeenCalledWith("col-99", "Tax Docs");
    });
  });
});

describe("CollectionCardSkeleton", () => {
  it("renders skeleton loading state", () => {
    const { container } = renderWithProviders(<CollectionCardSkeleton />);

    // The Skeleton component uses the "animate-shimmer-skeleton" class
    const skeletons = container.querySelectorAll(
      '[class*="animate-shimmer-skeleton"]'
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("does not render any collection data text", () => {
    renderWithProviders(<CollectionCardSkeleton />);

    expect(screen.queryByText("Q4 Invoices")).not.toBeInTheDocument();
    expect(screen.queryByText(/docs/)).not.toBeInTheDocument();
  });
});
