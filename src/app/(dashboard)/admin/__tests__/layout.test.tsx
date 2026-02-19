import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

import AdminLayout from "../layout";
import { useAuthStore } from "@/store/auth-store";

function mockUser(role: string | null) {
  vi.mocked(useAuthStore).mockReturnValue({
    user: role
      ? {
          id: "user-1",
          tenant_id: "t-1",
          email: `${role}@test.com`,
          full_name: `${role} User`,
          role,
          is_active: true,
          email_verified: true,
          email_verified_at: "2024-01-01T00:00:00Z",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        }
      : null,
  } as unknown as ReturnType<typeof useAuthStore>);
}

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is an admin", () => {
    mockUser("admin");

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it.each(["manager", "member", null])(
    "shows Access Denied with dashboard link for role=%s",
    (role) => {
      mockUser(role);

      renderWithProviders(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Back to Dashboard" })
      ).toHaveAttribute("href", "/dashboard");
    }
  );
});
