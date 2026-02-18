import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { DuplicateInvoiceAlert } from "../duplicate-invoice-alert";
import { ValidationResult } from "@/types/validation";

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

describe("DuplicateInvoiceAlert", () => {
  it("renders nothing when no validation results", () => {
    const { container } = renderWithProviders(
      <DuplicateInvoiceAlert validationResults={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when duplicate check passed", () => {
    const passed: ValidationResult = {
      rule_id: "dup-1",
      rule_name: "Logical: Duplicate Invoice Detection",
      field_path: "invoice",
      passed: true,
      message: "No duplicates found",
      validated_at: "2025-08-15T10:00:00Z",
      reconciliation_critical: false,
    };
    const { container } = renderWithProviders(
      <DuplicateInvoiceAlert validationResults={[passed]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders unavailable info alert when check was skipped", () => {
    const unavailable: ValidationResult = {
      rule_id: "dup-1",
      rule_name: "Logical: Duplicate Invoice Detection",
      field_path: "invoice",
      passed: false,
      message: "Duplicate check unavailable — seller GSTIN missing",
      actual_value: "check unavailable",
      validated_at: "2025-08-15T10:00:00Z",
      reconciliation_critical: false,
    };
    renderWithProviders(
      <DuplicateInvoiceAlert validationResults={[unavailable]} />
    );
    expect(
      screen.getByText("Duplicate check unavailable")
    ).toBeInTheDocument();
  });

  it("renders error alert for strong/exact_irn duplicates", () => {
    renderWithProviders(
      <DuplicateInvoiceAlert
        validationResults={[makeDuplicateResult()]}
      />
    );
    expect(
      screen.getByText("Duplicate invoice detected (1 match)")
    ).toBeInTheDocument();
  });

  it("renders warning alert for weak duplicates", () => {
    const weakResult = makeDuplicateResult({
      message:
        'Matching documents: "Old-Invoice.pdf" [weak] (uploaded 2024-03-15)',
      actual_value: "1 duplicate(s) found [warning]",
    });
    renderWithProviders(
      <DuplicateInvoiceAlert validationResults={[weakResult]} />
    );
    expect(
      screen.getByText("Possible duplicate invoice (1 match)")
    ).toBeInTheDocument();
  });

  it("shows matching document names as links", () => {
    renderWithProviders(
      <DuplicateInvoiceAlert
        validationResults={[makeDuplicateResult()]}
      />
    );
    const link = screen.getByRole("link", { name: "Invoice-A.pdf" });
    expect(link).toHaveAttribute("href", "/documents?search=Invoice-A.pdf");
  });

  it("shows match type badges", () => {
    renderWithProviders(
      <DuplicateInvoiceAlert
        validationResults={[makeDuplicateResult()]}
      />
    );
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("shows upload date for matches", () => {
    renderWithProviders(
      <DuplicateInvoiceAlert
        validationResults={[makeDuplicateResult()]}
      />
    );
    expect(screen.getByText("Uploaded 2025-08-01")).toBeInTheDocument();
  });

  it("renders multiple matches", () => {
    const multiResult = makeDuplicateResult({
      message:
        'Matching documents: "Invoice-A.pdf" [exact_irn] (uploaded 2025-08-01), "Invoice-B.pdf" [weak] (uploaded 2024-03-15)',
      actual_value: "2 duplicate(s) found [error]",
    });
    renderWithProviders(
      <DuplicateInvoiceAlert validationResults={[multiResult]} />
    );

    expect(
      screen.getByText("Duplicate invoice detected (2 matches)")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoice-A.pdf" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoice-B.pdf" })).toBeInTheDocument();
    expect(screen.getByText("Exact IRN")).toBeInTheDocument();
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <DuplicateInvoiceAlert
        validationResults={[makeDuplicateResult()]}
        className="my-custom"
      />
    );
    const alert = container.querySelector("[role='alert']");
    expect(alert).toHaveClass("my-custom");
  });
});
