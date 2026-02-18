import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/hooks/use-tenant", () => ({
  useTenant: vi.fn(),
}));

vi.mock("@/lib/hooks/use-stats", () => ({
  useStats: vi.fn(),
}));

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: vi.fn(),
}));

vi.mock("@/lib/hooks/use-service-accounts", () => ({
  useServiceAccounts: vi.fn(),
}));

import AdminOverviewPage from "../page";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useStats } from "@/lib/hooks/use-stats";
import { useUsers } from "@/lib/hooks/use-users";
import { useServiceAccounts } from "@/lib/hooks/use-service-accounts";

const mockStats = {
  total_collections: 5,
  parsing_failed: 2,
  review_pending: 3,
  validation_invalid: 1,
  validation_warning: 4,
  total_documents: 100,
};

function setupLoadedMocks() {
  vi.mocked(useTenant).mockReturnValue({
    data: { id: "t-1", name: "Acme Corp", slug: "acme", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
    isLoading: false,
  } as unknown as ReturnType<typeof useTenant>);

  vi.mocked(useStats).mockReturnValue({
    data: mockStats,
    isLoading: false,
  } as unknown as ReturnType<typeof useStats>);

  vi.mocked(useUsers).mockReturnValue({
    data: { items: [], total: 12, page: 1, page_size: 1, total_pages: 12 },
    isLoading: false,
  } as unknown as ReturnType<typeof useUsers>);

  vi.mocked(useServiceAccounts).mockReturnValue({
    data: { items: [], total: 3, page: 1, page_size: 1, total_pages: 3 },
    isLoading: false,
  } as unknown as ReturnType<typeof useServiceAccounts>);
}

function setupLoadingMocks() {
  vi.mocked(useTenant).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as ReturnType<typeof useTenant>);

  vi.mocked(useStats).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as ReturnType<typeof useStats>);

  vi.mocked(useUsers).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as ReturnType<typeof useUsers>);

  vi.mocked(useServiceAccounts).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as ReturnType<typeof useServiceAccounts>);
}

describe("AdminOverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons when hooks are loading", () => {
    setupLoadingMocks();
    renderWithProviders(<AdminOverviewPage />);

    expect(screen.getByText("Overview of your organization")).toBeInTheDocument();
    // Tenant name heading should not be visible yet
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("shows tenant name heading when loaded", async () => {
    setupLoadedMocks();
    renderWithProviders(<AdminOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
  });

  it("shows stat values when loaded", () => {
    setupLoadedMocks();
    renderWithProviders(<AdminOverviewPage />);

    // Find each stat card by its label, then verify the value in the same card container
    function getStatValue(label: string): string | null {
      const labelEl = screen.getByText(label);
      const cardContent = labelEl.closest("div.flex.items-center");
      const valueEl = cardContent?.querySelector("p.text-2xl");
      return valueEl?.textContent ?? null;
    }

    expect(getStatValue("Total Users")).toBe("12");
    expect(getStatValue("Total Collections")).toBe("5");
    expect(getStatValue("Service Accounts")).toBe("3");
    expect(getStatValue("Parsing Failures")).toBe("2");
    expect(getStatValue("Pending Review")).toBe("3");
    // validation_invalid (1) + validation_warning (4) = 5
    expect(getStatValue("Validation Issues")).toBe("5");
  });

  it("shows stat card labels", () => {
    setupLoadedMocks();
    renderWithProviders(<AdminOverviewPage />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Total Collections")).toBeInTheDocument();
    expect(screen.getByText("Service Accounts")).toBeInTheDocument();
    expect(screen.getByText("Parsing Failures")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByText("Validation Issues")).toBeInTheDocument();
  });

  it("renders stat cards as links", () => {
    setupLoadedMocks();
    renderWithProviders(<AdminOverviewPage />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/admin/users");
    expect(hrefs).toContain("/collections");
    expect(hrefs).toContain("/admin/service-accounts");
    expect(hrefs).toContain("/documents");
    expect(hrefs).toContain("/review-queue");
    expect(hrefs).toContain("/exceptions");
  });
});
