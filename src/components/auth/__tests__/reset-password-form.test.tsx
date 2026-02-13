import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { ResetPasswordForm } from "../reset-password-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
}));

vi.mock("@/lib/api/auth", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong"
  ),
  isApiError: vi.fn((err: unknown, code: string) => {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      (err as Record<string, unknown>).response
    ) {
      const response = (err as Record<string, Record<string, Record<string, Record<string, string>>>>)
        .response;
      return response?.data?.error?.code === code;
    }
    return false;
  }),
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import { resetPassword } from "@/lib/api/auth";
const mockResetPassword = vi.mocked(resetPassword);

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("without token", () => {
    it("shows invalid token state when no token is present", () => {
      renderWithProviders(<ResetPasswordForm />);

      expect(screen.getByText("Link expired")).toBeInTheDocument();
      expect(
        screen.getByText(/no reset token found/i)
      ).toBeInTheDocument();
    });

    it("shows link to request a new reset", () => {
      renderWithProviders(<ResetPasswordForm />);

      const link = screen.getByRole("link", { name: /request new link/i });
      expect(link).toHaveAttribute("href", "/forgot-password");
    });

    it("shows back to login link", () => {
      renderWithProviders(<ResetPasswordForm />);

      const link = screen.getByRole("link", { name: /back to login/i });
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  describe("with valid token", () => {
    it("renders the password form", () => {
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      expect(screen.getByText("Set new password")).toBeInTheDocument();
      expect(screen.getByLabelText("New password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reset password/i })
      ).toBeInTheDocument();
    });

    it("validates password minimum length", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "short");
      await user.type(screen.getByLabelText("Confirm password"), "short");
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters")
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it("validates passwords match", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "password123");
      await user.type(
        screen.getByLabelText("Confirm password"),
        "different456"
      );
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText("Passwords do not match")
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it("shows success state after successful reset", async () => {
      mockResetPassword.mockResolvedValue({
        message: "password has been reset successfully",
      });

      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "newpassword123");
      await user.type(
        screen.getByLabelText("Confirm password"),
        "newpassword123"
      );
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(screen.getByText("Password reset!")).toBeInTheDocument();
      });

      const signInLink = screen.getByRole("link", { name: /sign in/i });
      expect(signInLink).toHaveAttribute("href", "/login");
    });

    it("calls resetPassword API with token and new_password", async () => {
      mockResetPassword.mockResolvedValue({ message: "done" });

      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "securepass99");
      await user.type(
        screen.getByLabelText("Confirm password"),
        "securepass99"
      );
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: "valid-jwt-token",
          new_password: "securepass99",
        });
      });
    });

    it("shows invalid token state on INVALID_RESET_TOKEN error", async () => {
      const apiError = Object.assign(new Error("unauthorized"), {
        response: {
          status: 401,
          data: {
            success: false,
            error: { code: "INVALID_RESET_TOKEN", message: "unauthorized" },
          },
        },
      });
      mockResetPassword.mockRejectedValue(apiError);

      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "newpassword123");
      await user.type(
        screen.getByLabelText("Confirm password"),
        "newpassword123"
      );
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(screen.getByText("Link expired")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("link", { name: /request new link/i })
      ).toHaveAttribute("href", "/forgot-password");
    });

    it("shows generic error for non-token errors", async () => {
      mockResetPassword.mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      await user.type(screen.getByLabelText("New password"), "newpassword123");
      await user.type(
        screen.getByLabelText("Confirm password"),
        "newpassword123"
      );
      await user.click(
        screen.getByRole("button", { name: /reset password/i })
      );

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      // Should still show the form (not invalid_token state)
      expect(screen.getByLabelText("New password")).toBeInTheDocument();
    });

    it("shows back to login link on the form", () => {
      renderWithProviders(<ResetPasswordForm token="valid-jwt-token" />);

      const link = screen.getByRole("link", { name: /back to login/i });
      expect(link).toHaveAttribute("href", "/login");
    });
  });
});
