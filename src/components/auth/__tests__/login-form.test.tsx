import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { LoginForm } from "../login-form";

// Default mock from setup.ts returns empty URLSearchParams.
// Override per-test to simulate session_expired param.
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

describe("LoginForm", () => {
  afterEach(() => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders the login form with all fields", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText("Sign in to Satvos")).toBeInTheDocument();
    expect(screen.getByLabelText("Organization")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("does not show session expired banner by default", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows session expired banner when session_expired=true is in URL", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("session_expired=true&returnUrl=/documents/123")
    );

    renderWithProviders(<LoginForm />);

    expect(
      screen.getByText(/your session has expired/i)
    ).toBeInTheDocument();
  });

  it("does not show session expired banner when session_expired is not true", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("session_expired=false")
    );

    renderWithProviders(<LoginForm />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });
});
