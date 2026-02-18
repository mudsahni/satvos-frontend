import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/hooks/use-tenant", () => ({
  useTenant: vi.fn(),
  useUpdateTenant: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}));

vi.mock("@/lib/utils/format", () => ({
  formatDate: vi.fn(() => "Jan 1, 2024"),
}));

import TenantSettingsPage from "../page";
import { useTenant } from "@/lib/hooks/use-tenant";

const mockTenant = {
  id: "t-1",
  name: "Acme Corp",
  slug: "acme-corp",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("TenantSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when loading", () => {
    vi.mocked(useTenant).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTenant>);

    renderWithProviders(<TenantSettingsPage />);

    // Should not show tenant details yet
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
    expect(screen.queryByText("Tenant Settings")).not.toBeInTheDocument();
  });

  it("shows tenant info in view mode when loaded", async () => {
    vi.mocked(useTenant).mockReturnValue({
      data: mockTenant,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTenant>);

    renderWithProviders(<TenantSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tenant Settings")).toBeInTheDocument();
    });

    expect(screen.getByText("Organization Details")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("acme-corp")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
  });

  it("shows an Edit button in view mode", async () => {
    vi.mocked(useTenant).mockReturnValue({
      data: mockTenant,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTenant>);

    renderWithProviders(<TenantSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /edit/i })
      ).toBeInTheDocument();
    });
  });

  it("switches to edit mode when Edit is clicked", async () => {
    vi.mocked(useTenant).mockReturnValue({
      data: mockTenant,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTenant>);

    const user = userEvent.setup();
    renderWithProviders(<TenantSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /edit/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Form fields should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText("Organization Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Slug")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  it("shows error state when tenant fails to load", () => {
    vi.mocked(useTenant).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTenant>);

    renderWithProviders(<TenantSettingsPage />);

    expect(
      screen.getByText("Failed to load tenant settings")
    ).toBeInTheDocument();
  });
});
