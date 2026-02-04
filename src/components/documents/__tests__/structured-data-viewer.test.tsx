import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { StructuredDataViewer } from "../structured-data-viewer";
import { StructuredInvoiceData } from "@/types/document";

function createSampleData(): StructuredInvoiceData {
  return {
    invoice: {
      invoice_number: "INV-001",
      invoice_date: "2024-01-15",
      currency: "INR",
      reverse_charge: false,
    },
    seller: {
      name: "Acme Corp",
      gstin: "27AABCA1234A1Z5",
    },
    buyer: {
      name: "Buyer Inc",
    },
    line_items: [
      {
        description: "Widget A",
        hsn_sac_code: "8471",
        quantity: 10,
        unit_price: 100,
        taxable_amount: 1000,
        cgst_amount: 90,
        sgst_amount: 90,
        total: 1180,
      },
    ],
    totals: {
      subtotal: 1000,
      total: 1180,
      amount_in_words: "One Thousand One Hundred Eighty Rupees",
    },
  };
}

describe("StructuredDataViewer", () => {
  describe("read mode", () => {
    it("renders field labels and values", () => {
      renderWithProviders(<StructuredDataViewer data={createSampleData()} />);

      expect(screen.getByText("Invoice Number")).toBeInTheDocument();
      expect(screen.getByText("INV-001")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Buyer Inc")).toBeInTheDocument();
    });

    it("hides empty fields in read mode", () => {
      const data = createSampleData();
      // due_date is not set
      renderWithProviders(<StructuredDataViewer data={data} />);

      expect(screen.queryByText("Due Date")).not.toBeInTheDocument();
    });

    it("displays line items in table", () => {
      renderWithProviders(<StructuredDataViewer data={createSampleData()} />);

      expect(screen.getByText("Widget A")).toBeInTheDocument();
      expect(screen.getByText("8471")).toBeInTheDocument();
    });

    it("displays grand total", () => {
      renderWithProviders(<StructuredDataViewer data={createSampleData()} />);

      expect(screen.getByText("Grand Total")).toBeInTheDocument();
      expect(
        screen.getByText("One Thousand One Hundred Eighty Rupees")
      ).toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    it("renders input fields when editing", () => {
      renderWithProviders(
        <StructuredDataViewer
          data={createSampleData()}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      // Should have input elements for fields
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("shows empty fields in edit mode so users can fill them", () => {
      const data = createSampleData();
      // due_date is not set, but should appear in edit mode
      renderWithProviders(
        <StructuredDataViewer
          data={data}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      // "Due Date" should appear even though value is undefined
      expect(screen.getByText("Due Date")).toBeInTheDocument();
    });

    it("calls onFieldChange when input value changes", async () => {
      const onFieldChange = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <StructuredDataViewer
          data={createSampleData()}
          isEditing={true}
          editedValues={{}}
          onFieldChange={onFieldChange}
        />
      );

      // Find the Invoice Number input by its placeholder
      const invoiceNumberInput = screen.getByPlaceholderText("Invoice Number");
      await user.clear(invoiceNumberInput);
      await user.type(invoiceNumberInput, "X");

      expect(onFieldChange).toHaveBeenCalledWith(
        "invoice.invoice_number",
        expect.any(String)
      );
    });

    it("pre-fills inputs with editedValues when provided", () => {
      renderWithProviders(
        <StructuredDataViewer
          data={createSampleData()}
          isEditing={true}
          editedValues={{ "invoice.invoice_number": "EDITED-001" }}
          onFieldChange={vi.fn()}
        />
      );

      const invoiceNumberInput = screen.getByPlaceholderText("Invoice Number");
      expect(invoiceNumberInput).toHaveValue("EDITED-001");
    });

    it("renders number inputs for currency fields", () => {
      renderWithProviders(
        <StructuredDataViewer
          data={createSampleData()}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      // The Grand Total input should be a number type
      const grandTotalInput = screen.getByPlaceholderText("Grand Total");
      expect(grandTotalInput).toHaveAttribute("type", "number");
    });

    it("renders line item inputs in edit mode", () => {
      renderWithProviders(
        <StructuredDataViewer
          data={createSampleData()}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      const descInput = screen.getByPlaceholderText("Description");
      expect(descInput).toBeInTheDocument();
      expect(descInput).toHaveValue("Widget A");
    });

    it("renders notes textarea in edit mode", () => {
      const data = createSampleData();
      data.notes = "Some notes";
      renderWithProviders(
        <StructuredDataViewer
          data={data}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      const notesTextarea = screen.getByPlaceholderText("Add notes...");
      expect(notesTextarea).toBeInTheDocument();
      expect(notesTextarea).toHaveValue("Some notes");
    });

    it("shows notes section even when notes is empty in edit mode", () => {
      const data = createSampleData();
      // notes is undefined
      renderWithProviders(
        <StructuredDataViewer
          data={data}
          isEditing={true}
          editedValues={{}}
          onFieldChange={vi.fn()}
        />
      );

      // Notes section should be visible in edit mode
      expect(screen.getByText("Notes")).toBeInTheDocument();
    });
  });
});
