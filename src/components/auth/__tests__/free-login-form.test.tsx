import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { FreeLoginForm } from "../free-login-form";

const mockSearchParams = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams(),
  useParams: () => ({}),
}));

describe("FreeLoginForm", () => {
  afterEach(() => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders the free login form with email and password only", () => {
    renderWithProviders(<FreeLoginForm />);

    expect(screen.getByText("Sign in to Satvos")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("does not show Organization field", () => {
    renderWithProviders(<FreeLoginForm />);

    expect(screen.queryByLabelText("Organization")).not.toBeInTheDocument();
  });

  it("shows link to enterprise login", () => {
    renderWithProviders(<FreeLoginForm />);

    const link = screen.getByRole("link", { name: /log in with your organization/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login/enterprise");
  });

  it("shows link to register page", () => {
    renderWithProviders(<FreeLoginForm />);

    const link = screen.getByRole("link", { name: /sign up free/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });

  it("does not show session expired banner by default", () => {
    renderWithProviders(<FreeLoginForm />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows session expired banner when session_expired=true is in URL", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("session_expired=true&returnUrl=/documents/123")
    );

    renderWithProviders(<FreeLoginForm />);

    expect(
      screen.getByText(/your session has expired/i)
    ).toBeInTheDocument();
  });

  it("does not show session expired banner when session_expired is not true", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("session_expired=false")
    );

    renderWithProviders(<FreeLoginForm />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });
});
