import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { LoginForm } from "../login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
}));

describe("LoginForm (Enterprise)", () => {
  it("renders the enterprise login form with all fields and links", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText("Enterprise Sign In")).toBeInTheDocument();
    expect(screen.getByLabelText("Organization")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in here/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /forgot your password/i })).toHaveAttribute("href", "/forgot-password");
  });

  it("shows session expired banner only when sessionExpired is true", () => {
    const { unmount } = renderWithProviders(<LoginForm />);
    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
    unmount();

    renderWithProviders(
      <LoginForm sessionExpired returnUrl="/documents/123" />
    );
    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
  });
});
