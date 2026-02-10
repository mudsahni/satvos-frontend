import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { ForgotPasswordForm } from "../forgot-password-form";

vi.mock("@/lib/api/auth", () => ({
  forgotPassword: vi.fn(),
}));

import { forgotPassword } from "@/lib/api/auth";
const mockForgotPassword = vi.mocked(forgotPassword);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with email field and submit button", () => {
    renderWithProviders(<ForgotPasswordForm />);

    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("shows back to login link", () => {
    renderWithProviders(<ForgotPasswordForm />);

    const link = screen.getByRole("link", { name: /back to login/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("validates email field on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });

    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it("shows success state after submission regardless of API result", async () => {
    mockForgotPassword.mockResolvedValue({
      message: "if an account with that email exists, a password reset link has been sent",
    });

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("shows success state even when API call fails (prevents email enumeration)", async () => {
    mockForgotPassword.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "unknown@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
  });

  it("allows trying a different email from the success state", async () => {
    mockForgotPassword.mockResolvedValue({ message: "sent" });

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "first@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /try a different email/i })
    );

    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("calls forgotPassword API with tenant_slug satvos and email", async () => {
    mockForgotPassword.mockResolvedValue({ message: "sent" });

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "hello@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({
        tenant_slug: "satvos",
        email: "hello@test.com",
      });
    });
  });

  it("disables form fields while submitting", async () => {
    let resolvePromise: (value: { message: string }) => void;
    mockForgotPassword.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    // Resolve to clean up
    resolvePromise!({ message: "sent" });

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
  });
});
