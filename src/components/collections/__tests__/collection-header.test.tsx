import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { CollectionHeader } from "../collection-header";
import { Collection } from "@/types/collection";

// Mock UserName to prevent network requests
vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ }: { id: string }) => <span>Test User</span>,
}));

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

  it("shows created date when created_at is valid", () => {
    renderWithProviders(<CollectionHeader collection={baseCollection} />);
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it("hides created date when created_at is null", () => {
    const collectionNoDate: Collection = {
      ...baseCollection,
      created_at: null as unknown as string,
    };
    renderWithProviders(<CollectionHeader collection={collectionNoDate} />);
    expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    // Dot separator should also be hidden
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("hides created date when created_at is undefined", () => {
    const collectionNoDate: Collection = {
      ...baseCollection,
      created_at: undefined as unknown as string,
    };
    renderWithProviders(<CollectionHeader collection={collectionNoDate} />);
    expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
  });

  describe("export dropdown", () => {
    it("shows Export dropdown when onExportCsv is provided", () => {
      renderWithProviders(
        <CollectionHeader collection={baseCollection} onExportCsv={() => {}} />
      );
      expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    });

    it("does not show Export dropdown when no export handlers are provided", () => {
      renderWithProviders(<CollectionHeader collection={baseCollection} />);
      expect(screen.queryByRole("button", { name: /export/i })).not.toBeInTheDocument();
    });

    it("shows Export CSV option in dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CollectionHeader collection={baseCollection} onExportCsv={() => {}} />
      );

      await user.click(screen.getByRole("button", { name: /export/i }));
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("calls onExportCsv when Export CSV is clicked", async () => {
      const user = userEvent.setup();
      const onExportCsv = vi.fn();
      renderWithProviders(
        <CollectionHeader collection={baseCollection} onExportCsv={onExportCsv} />
      );

      await user.click(screen.getByRole("button", { name: /export/i }));
      await user.click(screen.getByText("Export CSV"));
      expect(onExportCsv).toHaveBeenCalledTimes(1);
    });

    it("disables Export dropdown when isExportingCsv is true", () => {
      renderWithProviders(
        <CollectionHeader
          collection={baseCollection}
          onExportCsv={() => {}}
          isExportingCsv
        />
      );
      expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
    });

    it("shows Export Tally XML option when onExportTally is provided", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CollectionHeader
          collection={baseCollection}
          onExportTally={() => {}}
        />
      );

      await user.click(screen.getByRole("button", { name: /export/i }));
      expect(screen.getByText("Export Tally XML")).toBeInTheDocument();
    });

    it("shows both export options when both handlers are provided", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CollectionHeader
          collection={baseCollection}
          onExportCsv={() => {}}
          onExportTally={() => {}}
        />
      );

      await user.click(screen.getByRole("button", { name: /export/i }));
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
      expect(screen.getByText("Export Tally XML")).toBeInTheDocument();
    });
  });
});
