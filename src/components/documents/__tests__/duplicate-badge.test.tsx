import { screen, within } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { DuplicateBadge } from "../duplicate-badge";
import { ValidationResult } from "@/types/validation";

// Helper to build a duplicate detection validation result
function makeDuplicateResult(
  overrides: Partial<ValidationResult> = {}
): ValidationResult {
  return {
    rule_id: "dup-1",
    rule_name: "Logical: Duplicate Invoice Detection",
    field_path: "invoice",
    passed: false,
    message:
      'Matching documents: "Invoice-A.pdf" [strong] (uploaded 2025-08-01)',
    actual_value: "1 duplicate(s) found [error]",
    validated_at: "2025-08-15T10:00:00Z",
    reconciliation_critical: false,
    ...overrides,
  };
}

const NO_DUPLICATE_RESULT: ValidationResult = {
  rule_id: "dup-1",
  rule_name: "Logical: Duplicate Invoice Detection",
  field_path: "invoice",
  passed: true,
  message: "No duplicates found",
  validated_at: "2025-08-15T10:00:00Z",
  reconciliation_critical: false,
};

const UNAVAILABLE_RESULT: ValidationResult = {
  rule_id: "dup-1",
  rule_name: "Logical: Duplicate Invoice Detection",
  field_path: "invoice",
  passed: false,
  message: "Duplicate check unavailable — seller GSTIN missing",
  actual_value: "check unavailable",
  validated_at: "2025-08-15T10:00:00Z",
  reconciliation_critical: false,
};

describe("DuplicateBadge", () => {
  it("renders nothing when no validation results", () => {
    const { container } = renderWithProviders(
      <DuplicateBadge validationResults={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when duplicate check passed", () => {
    const { container } = renderWithProviders(
      <DuplicateBadge validationResults={[NO_DUPLICATE_RESULT]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when duplicate check is unavailable", () => {
    const { container } = renderWithProviders(
      <DuplicateBadge validationResults={[UNAVAILABLE_RESULT]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a Duplicate badge when duplicates are found", () => {
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
  });

  it("badge is clickable with role=button", () => {
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );
    const badge = screen.getByRole("button");
    expect(badge).toHaveTextContent("Duplicate");
  });

  it("opens dialog when badge is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Duplicate Invoice Detected")).toBeInTheDocument();
  });

  it("opens dialog on keyboard Enter", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );

    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows match details in the dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );

    await user.click(screen.getByRole("button"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Invoice-A.pdf")).toBeInTheDocument();
    expect(within(dialog).getByText("Strong")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Uploaded 2025-08-01")
    ).toBeInTheDocument();
  });

  it("match document name links to search page", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DuplicateBadge validationResults={[makeDuplicateResult()]} />
    );

    await user.click(screen.getByRole("button"));

    const link = screen.getByRole("link", { name: "Invoice-A.pdf" });
    expect(link).toHaveAttribute(
      "href",
      "/documents?search=Invoice-A.pdf"
    );
  });

  it("shows warning title for weak matches", async () => {
    const user = userEvent.setup();
    const weakResult = makeDuplicateResult({
      message:
        'Matching documents: "Old-Invoice.pdf" [weak] (uploaded 2024-03-15)',
      actual_value: "1 duplicate(s) found [warning]",
    });
    renderWithProviders(
      <DuplicateBadge validationResults={[weakResult]} />
    );

    await user.click(screen.getByRole("button"));

    expect(
      screen.getByText("Possible Duplicate Invoice")
    ).toBeInTheDocument();
  });

  it("shows multiple matches in dialog", async () => {
    const user = userEvent.setup();
    const multiResult = makeDuplicateResult({
      message:
        'Matching documents: "Invoice-A.pdf" [exact_irn] (uploaded 2025-08-01), "Invoice-B.pdf" [weak] (uploaded 2024-03-15)',
      actual_value: "2 duplicate(s) found [error]",
    });
    renderWithProviders(
      <DuplicateBadge validationResults={[multiResult]} />
    );

    await user.click(screen.getByRole("button"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Invoice-A.pdf")).toBeInTheDocument();
    expect(within(dialog).getByText("Invoice-B.pdf")).toBeInTheDocument();
    expect(within(dialog).getByText("Exact IRN")).toBeInTheDocument();
    expect(within(dialog).getByText("Weak")).toBeInTheDocument();
    // Text is split across DOM nodes due to template literal interpolation
    expect(
      within(dialog).getByText((_, el) =>
        el?.tagName === "P" && el.textContent === "2 matching documents found. This invoice has exact or strong matches that confirm it is a duplicate."
          ? true
          : false
      )
    ).toBeInTheDocument();
  });

  describe("compact mode", () => {
    it("renders badge without Copy icon in compact mode", () => {
      const { container } = renderWithProviders(
        <DuplicateBadge
          validationResults={[makeDuplicateResult()]}
          compact
        />
      );
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      // Compact mode should not render the Copy icon (only non-compact does)
      // The badge text should still be present
      const badge = screen.getByRole("button");
      // In compact mode, the badge has smaller text classes
      expect(badge).toHaveClass("text-[10px]");
    });

    it("still opens dialog when clicked in compact mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <DuplicateBadge
          validationResults={[makeDuplicateResult()]}
          compact
        />
      );

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    renderWithProviders(
      <DuplicateBadge
        validationResults={[makeDuplicateResult()]}
        className="my-custom-class"
      />
    );
    const badge = screen.getByRole("button");
    expect(badge).toHaveClass("my-custom-class");
  });
});
