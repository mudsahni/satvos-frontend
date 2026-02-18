import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { RoleBadge } from "../role-badge";
import type { Role } from "@/lib/constants";

describe("RoleBadge", () => {
  const roleLabels: Array<{ role: Role; label: string }> = [
    { role: "admin", label: "Admin" },
    { role: "manager", label: "Manager" },
    { role: "member", label: "Member" },
    { role: "viewer", label: "Viewer" },
    { role: "free", label: "Free" },
    { role: "service", label: "Service" },
  ];

  it.each(roleLabels)(
    "renders '$label' for role '$role'",
    ({ role, label }) => {
      renderWithProviders(<RoleBadge role={role} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  );

  it("renders as a badge with outline variant", () => {
    renderWithProviders(<RoleBadge role="admin" />);
    const badge = screen.getByText("Admin").closest("div");
    expect(badge).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProviders(<RoleBadge role="admin" className="custom-class" />);
    const badge = screen.getByText("Admin").closest("div");
    expect(badge).toHaveClass("custom-class");
  });

  it("falls back to the raw role string for an unknown role", () => {
    renderWithProviders(<RoleBadge role={"unknown" as Role} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
