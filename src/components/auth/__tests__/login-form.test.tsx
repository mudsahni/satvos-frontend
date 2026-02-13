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

  it("renders the enterprise login form with all fields", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText("Enterprise Sign In")).toBeInTheDocument();
    expect(screen.getByLabelText("Organization")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows link to free login page", () => {
    renderWithProviders(<LoginForm />);

    const link = screen.getByRole("link", { name: /sign in here/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("does not show session expired banner by default", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows session expired banner when sessionExpired is true", () => {
    renderWithProviders(
      <LoginForm sessionExpired returnUrl="/documents/123" />
    );

    expect(
      screen.getByText(/your session has expired/i)
    ).toBeInTheDocument();
  });

  it("does not show session expired banner when sessionExpired is false", () => {
    renderWithProviders(<LoginForm sessionExpired={false} />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows forgot password link", () => {
    renderWithProviders(<LoginForm />);

    const link = screen.getByRole("link", { name: /forgot your password/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/forgot-password");
  });
});
