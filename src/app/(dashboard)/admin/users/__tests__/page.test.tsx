import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useCreateUser: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
  useUpdateUser: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
  useDeleteUser: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
  useResendInvitation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: "current-user",
      role: "admin",
      email: "admin@test.com",
      full_name: "Admin",
    },
  })),
}));

vi.mock("@/lib/hooks/use-debounced-value", () => ({
  useDebouncedValue: vi.fn((v: unknown) => v),
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

import AdminUsersPage from "../page";
import { useUsers } from "@/lib/hooks/use-users";

const mockUsers = [
  {
    id: "user-1",
    tenant_id: "t-1",
    email: "alice@test.com",
    full_name: "Alice Smith",
    role: "admin",
    is_active: true,
    email_verified: true,
    email_verified_at: "2024-01-01T00:00:00Z",
    auth_provider: "email" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    tenant_id: "t-1",
    email: "bob@test.com",
    full_name: "Bob Jones",
    role: "member",
    is_active: true,
    email_verified: false,
    email_verified_at: null,
    auth_provider: "email" as const,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows user table with role badges when loaded", async () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { items: mockUsers, total: 2, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUsers>);

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();

    // Role badges
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("shows empty state with page controls when no users exist", async () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUsers>);

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /invite user/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUsers>);

    renderWithProviders(<AdminUsersPage />);

    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("No users found")).not.toBeInTheDocument();
  });
});
