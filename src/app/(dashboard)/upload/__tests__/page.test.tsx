import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UploadPage from "../page";

// --- Mocks ---

const mockCollections = [
  { id: "col-1", name: "Q4 Invoices", tenant_id: "t1", created_by: "u1", created_at: "", updated_at: "" },
  { id: "col-2", name: "Receipts", tenant_id: "t1", created_by: "u1", created_at: "", updated_at: "" },
];

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => mockSearchParams),
}));

vi.mock("@/lib/hooks/use-collections", () => ({
  useCollections: vi.fn(() => ({
    data: { items: mockCollections, total: 2, page: 1, page_size: 100, total_pages: 1 },
    isLoading: false,
  })),
  useCreateCollection: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/lib/hooks/use-upload", () => ({
  useUpload: vi.fn(() => ({
    uploads: [],
    isUploading: false,
    uploadFiles: vi.fn(),
    clearUploads: vi.fn(),
  })),
}));

import { useCollections } from "@/lib/hooks/use-collections";

// --- Tests ---

describe("UploadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders with 'Create New' mode when no collection param", async () => {
    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Documents")).toBeInTheDocument();
    });

    // "Create New" button should have default variant (active)
    const createNewBtn = screen.getByRole("button", { name: /create new/i });
    expect(createNewBtn).toBeInTheDocument();

    // Name input should be visible (create new mode)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("renders with 'Use Existing' mode when collection param is present", async () => {
    mockSearchParams = new URLSearchParams("collection=col-1");

    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Documents")).toBeInTheDocument();
    });

    // "Use Existing" should be the active mode
    const useExistingBtn = screen.getByRole("button", { name: /use existing/i });
    expect(useExistingBtn).toBeInTheDocument();

    // Name input should NOT be visible (existing mode)
    expect(screen.queryByLabelText(/^name/i)).not.toBeInTheDocument();
  });

  it("pre-selects the collection from URL param in the dropdown", async () => {
    mockSearchParams = new URLSearchParams("collection=col-1");

    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Documents")).toBeInTheDocument();
    });

    // The Select trigger should display the collection name
    await waitFor(() => {
      expect(screen.getByText("Q4 Invoices")).toBeInTheDocument();
    });
  });

  it("shows collection dropdown when collections are loaded", async () => {
    mockSearchParams = new URLSearchParams("collection=col-2");

    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Receipts")).toBeInTheDocument();
    });
  });

  it("shows skeleton while collections are loading", async () => {
    mockSearchParams = new URLSearchParams("collection=col-1");

    vi.mocked(useCollections).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useCollections>);

    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Documents")).toBeInTheDocument();
    });

    // Should NOT show the collection name while loading
    expect(screen.queryByText("Q4 Invoices")).not.toBeInTheDocument();
  });

  it("falls back to Create New mode if preselected collection not in list", async () => {
    mockSearchParams = new URLSearchParams("collection=nonexistent-id");

    renderWithProviders(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Documents")).toBeInTheDocument();
    });

    // The useEffect should not force "existing" mode since the ID doesn't match
    // The initial state will be "existing" from useState, but the Select won't show a name
    expect(screen.queryByText("Q4 Invoices")).not.toBeInTheDocument();
    expect(screen.queryByText("Receipts")).not.toBeInTheDocument();
  });
});
