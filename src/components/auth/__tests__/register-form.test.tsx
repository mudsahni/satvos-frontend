import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { RegisterForm } from "../register-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("@/lib/api/auth", () => ({
  register: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong"
  ),
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

describe("RegisterForm", () => {
  it("renders the registration form with all fields", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("shows 'Create Account' button", () => {
    renderWithProviders(<RegisterForm />);

    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("shows link to login page", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows validation errors for empty required fields on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("renders card title and description", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(
      screen.getByText(/start processing invoices for free/i)
    ).toBeInTheDocument();
  });
});
