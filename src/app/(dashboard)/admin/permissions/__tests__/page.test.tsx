import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollections: vi.fn(),
}));

vi.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="error-state">
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

import PermissionsOverviewPage from "../page";
import { useCollections } from "@/lib/hooks/use-collections";

const mockCollections = [
  {
    id: "col-1",
    tenant_id: "t-1",
    name: "Invoices Q1",
    description: "Q1 invoices",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    documents_count: 42,
    user_permission: "owner" as const,
  },
  {
    id: "col-2",
    tenant_id: "t-1",
    name: "Receipts",
    description: "",
    created_by: "user-1",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    documents_count: 10,
    user_permission: "editor" as const,
  },
];

describe("PermissionsOverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows collections table when loaded", async () => {
    vi.mocked(useCollections).mockReturnValue({
      data: { items: mockCollections, total: 2, page: 1, page_size: 100, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Invoices Q1")).toBeInTheDocument();
    });

    expect(screen.getByText("Receipts")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("shows empty state when no collections exist", async () => {
    vi.mocked(useCollections).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 100, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText("No collections")).toBeInTheDocument();
    });

    expect(
      screen.getByText("No collections exist in this tenant yet.")
    ).toBeInTheDocument();
  });

  it("shows Manage links for each collection", async () => {
    vi.mocked(useCollections).mockReturnValue({
      data: { items: mockCollections, total: 2, page: 1, page_size: 100, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Invoices Q1")).toBeInTheDocument();
    });

    const manageLinks = screen.getAllByRole("link", { name: /manage/i });
    expect(manageLinks).toHaveLength(2);
    expect(manageLinks[0]).toHaveAttribute(
      "href",
      "/collections/col-1/settings"
    );
    expect(manageLinks[1]).toHaveAttribute(
      "href",
      "/collections/col-2/settings"
    );
  });

  it("shows permission badges for each collection", async () => {
    vi.mocked(useCollections).mockReturnValue({
      data: { items: mockCollections, total: 2, page: 1, page_size: 100, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText("owner")).toBeInTheDocument();
    });

    expect(screen.getByText("editor")).toBeInTheDocument();
  });

  it("shows page heading", () => {
    vi.mocked(useCollections).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 100, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    expect(screen.getByText("Permissions Overview")).toBeInTheDocument();
    expect(
      screen.getByText(
        "View and manage collection access across your organization"
      )
    ).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    vi.mocked(useCollections).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<PermissionsOverviewPage />);

    expect(screen.queryByText("Invoices Q1")).not.toBeInTheDocument();
    expect(screen.queryByText("No collections")).not.toBeInTheDocument();
  });
});
