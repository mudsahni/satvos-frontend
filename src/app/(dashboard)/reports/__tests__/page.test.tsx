import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReportsPage from "../page";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock report hooks
vi.mock("@/lib/hooks/use-reports", () => ({
  useFinancialSummary: vi.fn(() => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useTaxSummary: vi.fn(() => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useCollectionsOverview: vi.fn(() => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useSellersReport: vi.fn(() => ({
    data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useBuyersReport: vi.fn(() => ({
    data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  usePartyLedger: vi.fn(() => ({
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useHsnSummary: vi.fn(() => ({
    data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

// Mock collections hook for filter bar
vi.mock("@/lib/hooks/use-collections", () => ({
  useCollections: vi.fn(() => ({ data: { items: [] } })),
}));

// Mock recharts to avoid canvas errors
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Area: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with title, tabs, filter bar, and overview content by default", () => {
    renderWithProviders(<ReportsPage />);

    // Title and tabs
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Sellers")).toBeInTheDocument();
    expect(screen.getByText("Buyers")).toBeInTheDocument();
    expect(screen.getByText("Tax Analysis")).toBeInTheDocument();
    expect(screen.getByText("Party Ledger")).toBeInTheDocument();

    // Filter bar
    expect(screen.getByText("Select date range")).toBeInTheDocument();
    expect(screen.getByText("All Collections")).toBeInTheDocument();

    // Overview content shown by default
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Total Tax")).toBeInTheDocument();
  });

  it.each([
    ["Sellers", "0 sellers found"],
    ["Buyers", "0 buyers found"],
    ["Tax Analysis", "HSN Summary"],
    ["Party Ledger", "Search Party Ledger"],
  ])("switches to %s tab and shows expected content", async (tab, expectedText) => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByText(tab));

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
