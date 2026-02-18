import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

import AdminLayout from "../layout";
import { useAuthStore } from "@/store/auth-store";

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is an admin", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-1",
        tenant_id: "t-1",
        email: "admin@test.com",
        full_name: "Admin User",
        role: "admin",
        is_active: true,
        email_verified: true,
        email_verified_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("shows Access Denied when user is a manager", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-2",
        tenant_id: "t-1",
        email: "manager@test.com",
        full_name: "Manager User",
        role: "manager",
        is_active: true,
        email_verified: true,
        email_verified_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("shows Access Denied when user is a member", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-3",
        tenant_id: "t-1",
        email: "member@test.com",
        full_name: "Member User",
        role: "member",
        is_active: true,
        email_verified: true,
        email_verified_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("shows Access Denied when there is no user", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthStore>);

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("shows a link back to dashboard on Access Denied", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthStore>);

    renderWithProviders(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const backLink = screen.getByRole("link", { name: "Back to Dashboard" });
    expect(backLink).toHaveAttribute("href", "/dashboard");
  });
});
