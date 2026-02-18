import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/layout/quota-indicator", () => ({
  QuotaIndicator: () => <div data-testid="quota-indicator" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn(() => "/dashboard"),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth-store";

function renderSidebar() {
  return renderWithProviders(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Admin section label and 5 admin nav items for admin users", () => {
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

    renderSidebar();

    // Admin section label should be visible
    expect(screen.getByText("Admin")).toBeInTheDocument();

    // 5 admin nav items
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Tenant Settings")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Service Accounts")).toBeInTheDocument();
    expect(screen.getByText("Permissions")).toBeInTheDocument();
  });

  it("does NOT show Admin section for manager users", () => {
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

    renderSidebar();

    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Tenant Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Service Accounts")).not.toBeInTheDocument();
    expect(screen.queryByText("Permissions")).not.toBeInTheDocument();
  });

  it("shows common navigation items for all roles", () => {
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

    renderSidebar();

    // Sidebar items render as links — check their href attributes
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/upload");
    expect(hrefs).toContain("/collections");
    expect(hrefs).toContain("/documents");
  });

  it("does NOT show admin nav items for viewer users", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-4",
        tenant_id: "t-1",
        email: "viewer@test.com",
        full_name: "Viewer User",
        role: "viewer",
        is_active: true,
        email_verified: true,
        email_verified_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    renderSidebar();

    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Tenant Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Service Accounts")).not.toBeInTheDocument();
    expect(screen.queryByText("Permissions")).not.toBeInTheDocument();
  });
});
