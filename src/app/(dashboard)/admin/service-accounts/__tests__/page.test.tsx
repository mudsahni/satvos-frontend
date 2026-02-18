import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/hooks/use-service-accounts", () => ({
  useServiceAccounts: vi.fn(),
  useCreateServiceAccount: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ api_key: "sk-new-key" }),
    isPending: false,
  })),
  useRotateServiceAccountKey: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ api_key: "sk-rotated" }),
    isPending: false,
  })),
  useRevokeServiceAccount: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
  useDeleteServiceAccount: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}));

vi.mock("@/lib/utils/format", () => ({
  formatDate: vi.fn(() => "Jan 1, 2024"),
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

import ServiceAccountsPage from "../page";
import { useServiceAccounts } from "@/lib/hooks/use-service-accounts";

const mockAccounts = [
  {
    id: "sa-1",
    tenant_id: "t-1",
    name: "ERP Integration",
    description: "Uploads from Tally",
    api_key_prefix: "sk-abc123",
    is_active: true,
    created_by: "user-1",
    last_used_at: "2024-06-15T12:00:00Z",
    expires_at: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sa-2",
    tenant_id: "t-1",
    name: "CI Pipeline",
    description: "",
    api_key_prefix: "sk-def456",
    is_active: false,
    created_by: "user-1",
    last_used_at: null,
    expires_at: "2025-01-01T00:00:00Z",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
];

describe("ServiceAccountsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows table with key prefix in monospace when loaded", async () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: { items: mockAccounts, total: 2, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("ERP Integration")).toBeInTheDocument();
    });

    expect(screen.getByText("CI Pipeline")).toBeInTheDocument();

    // Key prefixes rendered in monospace code elements
    const keyPrefix1 = screen.getByText("sk-abc123...");
    expect(keyPrefix1.tagName.toLowerCase()).toBe("code");
    expect(keyPrefix1).toHaveClass("font-mono");

    const keyPrefix2 = screen.getByText("sk-def456...");
    expect(keyPrefix2.tagName.toLowerCase()).toBe("code");
    expect(keyPrefix2).toHaveClass("font-mono");
  });

  it("shows empty state when no accounts exist", async () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("No service accounts")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Create a service account for ERP integrations or automation."
      )
    ).toBeInTheDocument();
  });

  it("shows the Create Service Account button", () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    expect(
      screen.getByRole("button", { name: /create service account/i })
    ).toBeInTheDocument();
  });

  it("shows the page heading", () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    expect(screen.getByText("Service Accounts")).toBeInTheDocument();
    expect(
      screen.getByText("Manage API keys for programmatic access")
    ).toBeInTheDocument();
  });

  it("shows status badges for active and revoked accounts", async () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: { items: mockAccounts, total: 2, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    vi.mocked(useServiceAccounts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useServiceAccounts>);

    renderWithProviders(<ServiceAccountsPage />);

    expect(screen.queryByText("ERP Integration")).not.toBeInTheDocument();
    expect(screen.queryByText("No service accounts")).not.toBeInTheDocument();
  });
});
