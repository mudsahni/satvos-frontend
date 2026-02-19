import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { RoleBadge } from "../role-badge";
import type { Role } from "@/lib/constants";

describe("RoleBadge", () => {
  it.each([
    ["admin", "Admin"],
    ["manager", "Manager"],
    ["member", "Member"],
    ["viewer", "Viewer"],
    ["free", "Free"],
    ["service", "Service"],
  ] as const)("renders correct label for role %s", (role, label) => {
    renderWithProviders(<RoleBadge role={role} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("falls back to the raw role string for an unknown role", () => {
    renderWithProviders(<RoleBadge role={"unknown" as Role} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
