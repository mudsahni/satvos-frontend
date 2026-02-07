import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { ErrorState, InlineErrorState } from "@/components/ui/error-state";

describe("ErrorState", () => {
  it("renders default title and message", () => {
    renderWithProviders(<ErrorState />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An error occurred while loading data. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    renderWithProviders(
      <ErrorState title="Custom Title" message="Custom error message" />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    renderWithProviders(<ErrorState onRetry={onRetry} />);

    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    renderWithProviders(<ErrorState />);

    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("InlineErrorState", () => {
  it("renders default message", () => {
    renderWithProviders(<InlineErrorState />);

    expect(screen.getByText("Failed to load data.")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    renderWithProviders(
      <InlineErrorState message="Something specific failed" />
    );

    expect(
      screen.getByText("Something specific failed")
    ).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<InlineErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    renderWithProviders(<InlineErrorState />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
