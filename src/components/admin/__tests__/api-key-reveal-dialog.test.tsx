import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { ApiKeyRevealDialog } from "../api-key-reveal-dialog";

describe("ApiKeyRevealDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    apiKey: "sk-test-1234567890abcdef",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the API key text when open", () => {
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    expect(screen.getByText("sk-test-1234567890abcdef")).toBeInTheDocument();
  });

  it("shows the default title and description", () => {
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    expect(screen.getByText("API Key Created")).toBeInTheDocument();
    expect(
      screen.getByText("Your new API key has been generated.")
    ).toBeInTheDocument();
  });

  it("shows custom title and description", () => {
    renderWithProviders(
      <ApiKeyRevealDialog
        {...defaultProps}
        title="Key Rotated"
        description="A new key was generated."
      />
    );

    expect(screen.getByText("Key Rotated")).toBeInTheDocument();
    expect(screen.getByText("A new key was generated.")).toBeInTheDocument();
  });

  it("shows warning text about saving the key", () => {
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    expect(
      screen.getByText("Save this API key now. It will not be shown again.")
    ).toBeInTheDocument();
  });

  it("copies API key to clipboard when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    // Use fireEvent instead of userEvent to avoid user-event overriding navigator.clipboard
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    const copyButton = screen.getByRole("button", { name: "Copy API key" });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("sk-test-1234567890abcdef");
    });
  });

  it("has Done button disabled until checkbox is checked", () => {
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    const doneButton = screen.getByRole("button", { name: "Done" });
    expect(doneButton).toBeDisabled();
  });

  it("enables Done button after checking the confirmation checkbox", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApiKeyRevealDialog {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const doneButton = screen.getByRole("button", { name: "Done" });
    await waitFor(() => {
      expect(doneButton).toBeEnabled();
    });
  });

  it("calls onOpenChange(false) when Done is clicked after confirming", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ApiKeyRevealDialog {...defaultProps} onOpenChange={onOpenChange} />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const doneButton = screen.getByRole("button", { name: "Done" });
    await user.click(doneButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
