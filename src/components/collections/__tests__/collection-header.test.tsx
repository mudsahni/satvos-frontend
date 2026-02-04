import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { CollectionHeader } from "../collection-header";
import { Collection } from "@/types/collection";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

const baseCollection: Collection = {
  id: "col-1",
  tenant_id: "tenant-1",
  name: "Test Collection",
  description: "A test collection",
  created_by: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  documents_count: 10,
  user_permission: "owner",
};

describe("CollectionHeader", () => {
  it("renders collection name", () => {
    renderWithProviders(<CollectionHeader collection={baseCollection} />);
    expect(screen.getByText("Test Collection")).toBeInTheDocument();
  });

  it("uses documentCount prop when provided", () => {
    renderWithProviders(
      <CollectionHeader collection={baseCollection} documentCount={5} />
    );
    expect(screen.getByText("5 documents")).toBeInTheDocument();
  });

  it("falls back to getCollectionDocumentCount when documentCount is not provided", () => {
    renderWithProviders(<CollectionHeader collection={baseCollection} />);
    expect(screen.getByText("10 documents")).toBeInTheDocument();
  });

  it("shows 0 documents when collection has no count fields and no documentCount", () => {
    const collectionNoCount: Collection = {
      ...baseCollection,
      documents_count: undefined,
    };
    renderWithProviders(<CollectionHeader collection={collectionNoCount} />);
    expect(screen.getByText("0 documents")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    const { container } = renderWithProviders(
      <CollectionHeader collection={undefined} isLoading />
    );
    // Skeletons render as divs with animate-shimmer-skeleton class
    const skeletons = container.querySelectorAll(".animate-shimmer-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders nothing when collection is undefined and not loading", () => {
    const { container } = renderWithProviders(
      <CollectionHeader collection={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });
});
