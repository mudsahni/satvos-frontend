import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { GlobalSearch } from "../global-search";

// Mock API modules
vi.mock("@/lib/api/documents", () => ({
  getDocuments: vi.fn(),
}));

vi.mock("@/lib/api/collections", () => ({
  getCollections: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

import { getDocuments } from "@/lib/api/documents";
import { getCollections } from "@/lib/api/collections";

const mockGetDocuments = vi.mocked(getDocuments);
const mockGetCollections = vi.mocked(getCollections);

import { Document } from "@/types/document";

const mockDocuments: Document[] = [
  { id: "d1", name: "Invoice-001.pdf", collection_id: "c1", parsing_status: "completed", validation_status: "valid", review_status: "approved", reconciliation_status: "valid", parse_mode: "single", tenant_id: "t1", file_id: "f1", created_by: "u1", assigned_to: null, assigned_at: null, assigned_by: null, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "d2", name: "Receipt-002.pdf", collection_id: "c1", parsing_status: "completed", validation_status: "valid", review_status: "approved", reconciliation_status: "valid", parse_mode: "single", tenant_id: "t1", file_id: "f2", created_by: "u1", assigned_to: null, assigned_at: null, assigned_by: null, created_at: "2025-01-02T00:00:00Z", updated_at: "2025-01-02T00:00:00Z" },
  { id: "d3", name: "Invoice-003.pdf", collection_id: "c2", parsing_status: "failed", validation_status: "pending", review_status: "pending", reconciliation_status: "pending", parse_mode: "single", tenant_id: "t1", file_id: "f3", created_by: "u1", assigned_to: null, assigned_at: null, assigned_by: null, created_at: "2025-01-03T00:00:00Z", updated_at: "2025-01-03T00:00:00Z" },
];

const mockCollections = [
  { id: "c1", name: "January Invoices", description: "Monthly invoices", tenant_id: "t1", created_by: "u1", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "c2", name: "Tax Documents", description: "Tax filings", tenant_id: "t1", created_by: "u1", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
];

function setup(open = true) {
  const onOpenChange = vi.fn();
  const result = renderWithProviders(
    <GlobalSearch open={open} onOpenChange={onOpenChange} />
  );
  return { ...result, onOpenChange };
}

describe("GlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocuments.mockResolvedValue({
      items: mockDocuments,
      total: mockDocuments.length,
      page: 1,
      page_size: 100,
      total_pages: 1,
    });
    mockGetCollections.mockResolvedValue({
      items: mockCollections,
      total: mockCollections.length,
      page: 1,
      page_size: 1000,
      total_pages: 1,
    });
  });

  describe("quick navigation", () => {
    it("shows quick navigation items when no search query", () => {
      setup();
      expect(screen.getByText("Quick Navigation")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Collections")).toBeInTheDocument();
      expect(screen.getByText("Documents")).toBeInTheDocument();
      expect(screen.getByText("Upload")).toBeInTheDocument();
    });

    it("shows the search input with correct placeholder", () => {
      setup();
      expect(
        screen.getByPlaceholderText("Search documents, collections, or pages...")
      ).toBeInTheDocument();
    });
  });

  describe("searching pages", () => {
    it("filters page results by title", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "upload");

      expect(screen.getByText("Upload")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });

    it("shows 'Pages' section header when searching", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "dash");

      expect(screen.getByText("Pages")).toBeInTheDocument();
    });
  });

  describe("searching documents and collections", () => {
    it("shows matching documents when searching", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "Invoice");

      await waitFor(() => {
        expect(screen.getByText("Invoice-001.pdf")).toBeInTheDocument();
        expect(screen.getByText("Invoice-003.pdf")).toBeInTheDocument();
      });
      expect(screen.queryByText("Receipt-002.pdf")).not.toBeInTheDocument();
    });

    it("shows matching collections when searching", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "January");

      await waitFor(() => {
        expect(screen.getByText("January Invoices")).toBeInTheDocument();
      });
      expect(screen.queryByText("Tax Documents")).not.toBeInTheDocument();
    });

    it("shows grouped section headers for results", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "Invoice");

      await waitFor(() => {
        expect(screen.getByText("Documents")).toBeInTheDocument();
        expect(screen.getByText("Collections")).toBeInTheDocument();
      });
    });

    it("searches collection descriptions", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "tax filings");

      await waitFor(() => {
        expect(screen.getByText("Tax Documents")).toBeInTheDocument();
      });
    });
  });

  describe("empty results", () => {
    it("shows 'No results found' for non-matching query", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "zzzznonexistent");

      await waitFor(() => {
        expect(screen.getByText("No results found.")).toBeInTheDocument();
      });
    });
  });

  describe("navigation", () => {
    it("navigates to selected result on click", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "Invoice");

      await waitFor(() => {
        expect(screen.getByText("Invoice-001.pdf")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("Invoice-001.pdf"));
      expect(mockPush).toHaveBeenCalledWith("/documents/d1");
    });

    it("navigates to page result on click", async () => {
      setup();
      await userEvent.click(screen.getByText("Dashboard"));
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("navigates on Enter key", async () => {
      setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "{Enter}");

      // First item is Dashboard
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("dialog behavior", () => {
    it("does not render content when closed", () => {
      setup(false);
      expect(
        screen.queryByPlaceholderText("Search documents, collections, or pages...")
      ).not.toBeInTheDocument();
    });

    it("calls onOpenChange on Escape", async () => {
      const { onOpenChange } = setup();
      const input = screen.getByPlaceholderText("Search documents, collections, or pages...");
      await userEvent.type(input, "{Escape}");

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("data fetching", () => {
    it("fetches documents when dialog is open", async () => {
      setup();
      await waitFor(() => {
        expect(mockGetDocuments).toHaveBeenCalledWith({
          limit: 100,
          offset: 0,
        });
      });
    });

    it("fetches collections when dialog is open", async () => {
      setup();
      await waitFor(() => {
        expect(mockGetCollections).toHaveBeenCalledWith({
          limit: 100,
          offset: 0,
        });
      });
    });

    it("does not fetch when dialog is closed", () => {
      setup(false);
      expect(mockGetDocuments).not.toHaveBeenCalled();
      expect(mockGetCollections).not.toHaveBeenCalled();
    });
  });
});
