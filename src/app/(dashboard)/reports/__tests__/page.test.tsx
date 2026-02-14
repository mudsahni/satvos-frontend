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

  it("renders page title and tabs", () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Sellers")).toBeInTheDocument();
    expect(screen.getByText("Buyers")).toBeInTheDocument();
    expect(screen.getByText("Tax Analysis")).toBeInTheDocument();
    expect(screen.getByText("Party Ledger")).toBeInTheDocument();
  });

  it("renders filter bar with date range picker and collection selector", () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByText("Select date range")).toBeInTheDocument();
    expect(screen.getByText("All Collections")).toBeInTheDocument();
  });

  it("shows overview tab content by default", () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Total Tax")).toBeInTheDocument();
    expect(screen.getByText("Invoice Count")).toBeInTheDocument();
    expect(screen.getByText("Avg Invoice Value")).toBeInTheDocument();
  });

  it("switches to sellers tab on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByText("Sellers"));

    expect(screen.getByText("0 sellers found")).toBeInTheDocument();
  });

  it("switches to buyers tab on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByText("Buyers"));

    expect(screen.getByText("0 buyers found")).toBeInTheDocument();
  });

  it("switches to tax analysis tab on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByText("Tax Analysis"));

    expect(screen.getByText("HSN Summary")).toBeInTheDocument();
  });

  it("switches to party ledger tab on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByText("Party Ledger"));

    expect(screen.getByText("Search Party Ledger")).toBeInTheDocument();
  });
});
