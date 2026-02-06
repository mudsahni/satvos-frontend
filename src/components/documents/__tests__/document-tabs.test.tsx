import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { DocumentTabs } from "../document-tabs";
import { Document, StructuredInvoiceData } from "@/types/document";

function createMockDocument(
  overrides: Partial<Document> = {}
): Document {
  return {
    id: "doc-1",
    tenant_id: "tenant-1",
    collection_id: "col-1",
    file_id: "file-1",
    name: "Test Invoice.pdf",
    parsing_status: "completed",
    validation_status: "valid",
    review_status: "pending",
    reconciliation_status: "pending",
    parse_mode: "single",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function createMockStructuredData(): StructuredInvoiceData {
  return {
    invoice: {
      invoice_number: "INV-001",
      invoice_date: "2024-01-15",
    },
    seller: { name: "Seller Corp" },
    buyer: { name: "Buyer Inc" },
    line_items: [
      {
        description: "Item A",
        taxable_amount: 1000,
        total: 1180,
      },
    ],
    totals: {
      subtotal: 1000,
      total: 1180,
    },
  };
}

describe("DocumentTabs", () => {
  const defaultProps = {
    validationResults: [],
    parsingStatus: "completed",
  };

  describe("Edit button visibility", () => {
    it("shows Edit button when onSaveEdits is provided and document has data", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });

    it("does not show Edit button when onSaveEdits is not provided", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} />
      );

      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });

    it("does not show Edit button when parsing is not completed", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
        parsing_status: "processing",
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          parsingStatus="processing"
          onSaveEdits={vi.fn()}
        />
      );

      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });

    it("does not show Edit button when document has no structured data", () => {
      const doc = createMockDocument();

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe("edit mode toolbar", () => {
    it("shows Save and Cancel buttons after clicking Edit", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("hides Raw JSON and Edit buttons while editing", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(screen.queryByRole("button", { name: /raw json/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });

    it("Save button is disabled when no edits have been made", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
    });

    it("exits edit mode when Cancel is clicked with no changes", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Should be back to read mode with Edit button visible
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });

  describe("tab rendering", () => {
    it("renders all three tabs", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} />
      );

      expect(screen.getByRole("tab", { name: /extracted data/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /validations/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();
    });

    it("shows processing state when parsing is in progress", () => {
      const doc = createMockDocument({ parsing_status: "processing" });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          parsingStatus="processing"
        />
      );

      expect(screen.getByText("Processing Document")).toBeInTheDocument();
    });

    it("shows no data state when document has no structured data", () => {
      const doc = createMockDocument();

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} />
      );

      expect(screen.getByText("No parsed data")).toBeInTheDocument();
    });

    it("shows Raw JSON toggle when data is available", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} />
      );

      expect(screen.getByRole("button", { name: /raw json/i })).toBeInTheDocument();
    });
  });

  describe("data tab status indicator", () => {
    it("shows check icon on data tab when parsing completed and data exists", () => {
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
        parsing_status: "completed",
      });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} parsingStatus="completed" />
      );

      // The data tab should contain a CheckCircle (success) SVG
      const dataTab = screen.getByRole("tab", { name: /extracted data/i });
      const successIcon = dataTab.querySelector(".text-success");
      expect(successIcon).toBeInTheDocument();
    });

    it("shows spinner icon on data tab when parsing is in progress", () => {
      const doc = createMockDocument({ parsing_status: "processing" });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} parsingStatus="processing" />
      );

      const dataTab = screen.getByRole("tab", { name: /extracted data/i });
      const spinner = dataTab.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("shows error icon on data tab when parsing failed", () => {
      const doc = createMockDocument({ parsing_status: "failed" });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} parsingStatus="failed" />
      );

      const dataTab = screen.getByRole("tab", { name: /extracted data/i });
      const errorIcon = dataTab.querySelector(".text-error");
      expect(errorIcon).toBeInTheDocument();
    });

    it("shows no indicator on data tab when parsing is pending with no data", () => {
      const doc = createMockDocument({ parsing_status: "pending" });

      renderWithProviders(
        <DocumentTabs document={doc} {...defaultProps} parsingStatus="pending" />
      );

      const dataTab = screen.getByRole("tab", { name: /extracted data/i });
      expect(dataTab.querySelector(".text-success")).not.toBeInTheDocument();
      expect(dataTab.querySelector(".animate-spin")).not.toBeInTheDocument();
      expect(dataTab.querySelector(".text-error")).not.toBeInTheDocument();
    });
  });

  describe("saving", () => {
    it("calls onSaveEdits with updated data when Save is clicked", async () => {
      const user = userEvent.setup();
      const onSaveEdits = vi.fn().mockResolvedValue(undefined);
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={onSaveEdits}
        />
      );

      // Enter edit mode
      await user.click(screen.getByRole("button", { name: /edit/i }));

      // Make an edit to enable Save button
      const invoiceInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceInput);
      await user.type(invoiceInput, "INV-999");

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      expect(onSaveEdits).toHaveBeenCalledTimes(1);
      const savedData = onSaveEdits.mock.calls[0][0] as StructuredInvoiceData;
      expect(savedData.invoice.invoice_number).toBe("INV-999");
    });

    it("exits edit mode after successful save", async () => {
      const user = userEvent.setup();
      const onSaveEdits = vi.fn().mockResolvedValue(undefined);
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={onSaveEdits}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));

      const invoiceInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceInput);
      await user.type(invoiceInput, "INV-999");

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      // Should be back in read mode
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });

  describe("unsaved changes guard", () => {
    it("shows discard dialog when Cancel is clicked with unsaved changes", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      // Enter edit mode and make a change
      await user.click(screen.getByRole("button", { name: /edit/i }));
      const invoiceInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceInput);
      await user.type(invoiceInput, "CHANGED");

      // Click cancel
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Discard dialog should appear
      expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();
    });

    it("keeps editing when Keep Editing is clicked in discard dialog", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const invoiceInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceInput);
      await user.type(invoiceInput, "CHANGED");
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Click Keep Editing
      await user.click(screen.getByRole("button", { name: /keep editing/i }));

      // Should still be in edit mode
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("discards changes when Discard is clicked in discard dialog", async () => {
      const user = userEvent.setup();
      const doc = createMockDocument({
        structured_data: createMockStructuredData(),
      });

      renderWithProviders(
        <DocumentTabs
          document={doc}
          {...defaultProps}
          onSaveEdits={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const invoiceInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceInput);
      await user.type(invoiceInput, "CHANGED");
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Click Discard Changes
      await user.click(screen.getByRole("button", { name: /discard changes/i }));

      // Should be back in read mode
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });
});
