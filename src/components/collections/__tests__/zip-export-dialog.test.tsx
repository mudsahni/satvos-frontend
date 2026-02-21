import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { ZipExportDialog } from "../zip-export-dialog";
import { vi } from "vitest";

// Mock the zip export so we don't actually download
vi.mock("@/lib/utils/zip-export", () => ({
  exportCollectionZip: vi.fn().mockResolvedValue(undefined),
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  collectionId: "col-1",
  collectionName: "Test Collection",
};

describe("ZipExportDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three checkboxes checked by default", () => {
    renderWithProviders(<ZipExportDialog {...defaultProps} />);
    expect(screen.getByLabelText("CSV Export")).toBeInTheDocument();
    expect(screen.getByLabelText("Tally XML Export")).toBeInTheDocument();
    expect(screen.getByLabelText("All Document Files")).toBeInTheDocument();
  });

  it("shows company name input when Tally is checked", () => {
    renderWithProviders(<ZipExportDialog {...defaultProps} />);
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });

  it("hides company name input when Tally is unchecked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ZipExportDialog {...defaultProps} />);

    await user.click(screen.getByLabelText("Tally XML Export"));
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });

  it("disables download button when all checkboxes are unchecked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ZipExportDialog {...defaultProps} />);

    await user.click(screen.getByLabelText("CSV Export"));
    await user.click(screen.getByLabelText("Tally XML Export"));
    await user.click(screen.getByLabelText("All Document Files"));

    expect(screen.getByRole("button", { name: /download/i })).toBeDisabled();
  });

  it("enables download button when at least one checkbox is checked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ZipExportDialog {...defaultProps} />);

    // Uncheck all
    await user.click(screen.getByLabelText("CSV Export"));
    await user.click(screen.getByLabelText("Tally XML Export"));
    await user.click(screen.getByLabelText("All Document Files"));
    expect(screen.getByRole("button", { name: /download/i })).toBeDisabled();

    // Re-check one
    await user.click(screen.getByLabelText("CSV Export"));
    expect(screen.getByRole("button", { name: /download/i })).not.toBeDisabled();
  });

  it("does not render when open is false", () => {
    renderWithProviders(<ZipExportDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Download All as ZIP")).not.toBeInTheDocument();
  });
});
