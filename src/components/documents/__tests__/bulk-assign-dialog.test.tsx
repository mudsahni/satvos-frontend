import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BulkAssignDialog } from "../bulk-assign-dialog";

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: vi.fn(),
}));

import { useUsers } from "@/lib/hooks/use-users";

const mockUsers = {
  items: [
    { id: "user-1", full_name: "Jane Editor", email: "jane@example.com", is_active: true, role: "admin" },
    { id: "user-2", full_name: "Bob Owner", email: "bob@example.com", is_active: true, role: "member" },
    { id: "user-3", full_name: "Inactive User", email: "inactive@example.com", is_active: false, role: "member" },
  ],
};

describe("BulkAssignDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedCount: 3,
    onConfirm: vi.fn(),
    isProcessing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsers>);
  });

  it("renders dialog title and description with selected count", () => {
    renderWithProviders(<BulkAssignDialog {...defaultProps} />);

    expect(screen.getByText("Assign Reviewer")).toBeInTheDocument();
    expect(
      screen.getByText("Choose a reviewer to assign to 3 selected documents.")
    ).toBeInTheDocument();
  });

  it("shows singular form for 1 document", () => {
    renderWithProviders(<BulkAssignDialog {...defaultProps} selectedCount={1} />);

    expect(
      screen.getByText("Choose a reviewer to assign to 1 selected document.")
    ).toBeInTheDocument();
  });

  it("shows only active users", () => {
    renderWithProviders(<BulkAssignDialog {...defaultProps} />);

    expect(screen.getByText("Jane Editor")).toBeInTheDocument();
    expect(screen.getByText("Bob Owner")).toBeInTheDocument();
    expect(screen.queryByText("Inactive User")).not.toBeInTheDocument();
  });

  it("calls onConfirm with user id when a user is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkAssignDialog {...defaultProps} />);

    await user.click(screen.getByText("Jane Editor"));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith("user-1");
  });

  it("shows empty state when no active users exist", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { items: [mockUsers.items[2]] }, // inactive only
      isLoading: false,
    } as unknown as ReturnType<typeof useUsers>);

    renderWithProviders(<BulkAssignDialog {...defaultProps} />);

    expect(
      screen.getByText("No users available")
    ).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    renderWithProviders(<BulkAssignDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Assign Reviewer")).not.toBeInTheDocument();
  });

  it("disables user buttons when isProcessing is true", () => {
    renderWithProviders(<BulkAssignDialog {...defaultProps} isProcessing />);

    const janeButton = screen.getByText("Jane Editor").closest("button");
    expect(janeButton).toBeDisabled();
  });
});
