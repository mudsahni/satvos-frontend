import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { BulkActionsBar } from "../bulk-actions-bar";
import { vi } from "vitest";

describe("BulkActionsBar", () => {
  const defaultProps = {
    selectedCount: 3,
    onDeselect: vi.fn(),
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders selected count", () => {
    renderWithProviders(<BulkActionsBar {...defaultProps} />);
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("renders all action buttons", () => {
    renderWithProviders(<BulkActionsBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /deselect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("calls onDeselect when deselect button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /deselect/i }));
    expect(defaultProps.onDeselect).toHaveBeenCalledTimes(1);
  });

  it("shows confirmation dialog when approve is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(screen.getByText("Approve Documents")).toBeInTheDocument();
  });

  it("shows confirmation dialog when reject is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /reject/i }));
    expect(screen.getByText("Reject Documents")).toBeInTheDocument();
  });

  it("shows confirmation dialog when delete is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("Delete Documents")).toBeInTheDocument();
  });

  it("disables buttons when isProcessing is true", () => {
    renderWithProviders(<BulkActionsBar {...defaultProps} isProcessing />);

    expect(screen.getByRole("button", { name: /deselect/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /approve/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /reject/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });
});
