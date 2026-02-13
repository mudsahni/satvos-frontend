import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { FreeLoginForm } from "../free-login-form";
import { AxiosError } from "axios";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
}));

const mockLogin = vi.fn();
vi.mock("@/lib/api/auth", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  socialLogin: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong"
  ),
  isApiError: vi.fn((error: unknown, code: string) => {
    if (error && typeof error === "object" && "response" in error) {
      const axiosErr = error as AxiosError<{ error?: { code: string } }>;
      return axiosErr.response?.data?.error?.code === code;
    }
    return false;
  }),
  renewAuthCookie: vi.fn(),
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock("../google-sign-in-button", () => ({
  GoogleSignInButton: () => (
    <>
      <span>Or</span>
      <div data-testid="google-signin-button" />
    </>
  ),
}));

describe("FreeLoginForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
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

  it("shows session expired banner when sessionExpired is true", () => {
    renderWithProviders(
      <FreeLoginForm sessionExpired returnUrl="/documents/123" />
    );

    expect(
      screen.getByText(/your session has expired/i)
    ).toBeInTheDocument();
  });

  it("does not show session expired banner when sessionExpired is false", () => {
    renderWithProviders(<FreeLoginForm sessionExpired={false} />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows forgot password link", () => {
    renderWithProviders(<FreeLoginForm />);

    const link = screen.getByRole("link", { name: /forgot your password/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("renders the Google sign-in button", () => {
    renderWithProviders(<FreeLoginForm />);

    expect(screen.getByTestId("google-signin-button")).toBeInTheDocument();
  });

  it("renders the 'Or' divider", () => {
    renderWithProviders(<FreeLoginForm />);

    expect(screen.getByText("Or")).toBeInTheDocument();
  });

  it("shows PASSWORD_LOGIN_NOT_ALLOWED error with Google sign-in prompt", async () => {
    const passwordNotAllowedError = {
      response: {
        status: 400,
        data: {
          error: {
            code: "PASSWORD_LOGIN_NOT_ALLOWED",
            message: "Password login not allowed",
          },
        },
      },
      isAxiosError: true,
    };
    mockLogin.mockRejectedValueOnce(passwordNotAllowedError);

    const user = userEvent.setup();
    renderWithProviders(<FreeLoginForm />);

    await user.type(screen.getByLabelText("Email"), "google-user@test.com");
    await user.type(screen.getByLabelText("Password"), "somepassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/this account uses google sign-in/i)
      ).toBeInTheDocument();
    });
  });
});
