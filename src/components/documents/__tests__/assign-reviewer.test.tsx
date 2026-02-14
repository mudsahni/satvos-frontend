import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AssignReviewer } from "../assign-reviewer";

const mockMutate = vi.fn();

vi.mock("@/lib/hooks/use-documents", () => ({
  useAssignDocument: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: vi.fn(() => ({
    data: {
      items: [
        { id: "user-2", full_name: "Jane Doe", email: "jane@example.com", is_active: true, role: "admin" },
        { id: "user-3", full_name: "Bob Owner", email: "bob@example.com", is_active: true, role: "member" },
        { id: "user-4", full_name: "Inactive User", email: "inactive@example.com", is_active: false, role: "member" },
      ],
    },
    isLoading: false,
  })),
}));

vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ id }: { id: string }) => <span>{id}</span>,
}));

describe("AssignReviewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Assign button when unassigned", () => {
    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo={null} />
    );

    expect(screen.getByRole("button", { name: /assign/i })).toBeInTheDocument();
  });

  it("shows assigned user with unassign button when assigned", () => {
    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo="user-2" />
    );

    expect(screen.getByText("Assigned to")).toBeInTheDocument();
    expect(screen.getByText("user-2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unassign/i })).toBeInTheDocument();
  });

  it("calls mutate with null assignee_id when unassign clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo="user-2" />
    );

    await user.click(screen.getByRole("button", { name: /unassign/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      id: "doc-1",
      data: { assignee_id: null },
    });
  });

  it("disables buttons when disabled prop is true", () => {
    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo="user-2" disabled />
    );

    expect(screen.getByRole("button", { name: /unassign/i })).toBeDisabled();
  });

  it("disables assign button when disabled prop is true", () => {
    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo={null} disabled />
    );

    expect(screen.getByRole("button", { name: /assign/i })).toBeDisabled();
  });

  it("opens popover and shows active users only", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo={null} />
    );

    await user.click(screen.getByRole("button", { name: /assign/i }));

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Owner")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    // Inactive user should not appear
    expect(screen.queryByText("Inactive User")).not.toBeInTheDocument();
  });

  it("calls mutate with user id when a user is selected from popover", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AssignReviewer documentId="doc-1" assignedTo={null} />
    );

    await user.click(screen.getByRole("button", { name: /assign/i }));
    await user.click(screen.getByText("Jane Doe"));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: "doc-1", data: { assignee_id: "user-2" } },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});
