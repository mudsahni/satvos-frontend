import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { BulkActionsBar } from "../bulk-actions-bar";
import { vi } from "vitest";

describe("BulkActionsBar", () => {
  const defaultProps = {
    selectedIds: ["doc-1", "doc-2", "doc-3"],
    onDeselect: vi.fn(),
    onApprove: vi.fn().mockResolvedValue({ succeeded: 3, failed: 0 }),
    onReject: vi.fn().mockResolvedValue({ succeeded: 3, failed: 0 }),
    onDelete: vi.fn().mockResolvedValue({ succeeded: 3, failed: 0 }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
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
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /deselect/i }));
    expect(defaultProps.onDeselect).toHaveBeenCalledTimes(1);
  });

  it("shows confirmation dialog when approve is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(screen.getByText("Approve Documents")).toBeInTheDocument();
  });

  it("shows confirmation dialog when reject is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /reject/i }));
    expect(screen.getByText("Reject Documents")).toBeInTheDocument();
  });

  it("shows confirmation dialog when delete is clicked", async () => {
    vi.useRealTimers();
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

  it("shows success results banner after approve", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(
        screen.getByText("All 3 documents approved successfully")
      ).toBeInTheDocument();
    });
  });

  it("shows partial failure results banner", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      onDelete: vi.fn().mockResolvedValue({ succeeded: 2, failed: 1 }),
    };
    renderWithProviders(<BulkActionsBar {...props} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete all/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "2 of 3 documents deleted successfully, 1 failed"
        )
      ).toBeInTheDocument();
    });
  });

  it("passes selectedIds to callback", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    await waitFor(() => {
      expect(defaultProps.onApprove).toHaveBeenCalledWith([
        "doc-1",
        "doc-2",
        "doc-3",
      ]);
    });
  });

  it("dismisses results banner when dismiss button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    // Trigger an action to get results
    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /dismiss results/i }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("auto-clears results after 5 seconds", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<BulkActionsBar {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /approve all/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows all-failed results banner", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      onReject: vi.fn().mockResolvedValue({ succeeded: 0, failed: 3 }),
    };
    renderWithProviders(<BulkActionsBar {...props} />);

    await user.click(screen.getByRole("button", { name: /reject/i }));
    await user.click(screen.getByRole("button", { name: /reject all/i }));

    await waitFor(() => {
      expect(
        screen.getByText("All 3 documents failed to be rejected")
      ).toBeInTheDocument();
    });
  });
});
