import {
  getValueAtPath,
  setValueAtPath,
  applyEditsToStructuredData,
} from "../structured-data";
import { StructuredInvoiceData } from "@/types/document";

function createSampleData(): StructuredInvoiceData {
  return {
    invoice: {
      invoice_number: "INV-001",
      invoice_date: "2024-01-15",
      due_date: "2024-02-15",
      invoice_type: "Tax Invoice",
      currency: "INR",
      place_of_supply: "Maharashtra",
      reverse_charge: false,
    },
    seller: {
      name: "Acme Corp",
      gstin: "27AABCA1234A1Z5",
      address: "123 Main St",
    },
    buyer: {
      name: "Buyer Inc",
      gstin: "27AABCB5678B1Z3",
      address: "456 Oak Ave",
    },
    line_items: [
      {
        description: "Widget A",
        hsn_sac_code: "8471",
        quantity: 10,
        unit_price: 100,
        taxable_amount: 1000,
        cgst_rate: 9,
        cgst_amount: 90,
        sgst_rate: 9,
        sgst_amount: 90,
        total: 1180,
      },
      {
        description: "Widget B",
        hsn_sac_code: "8472",
        quantity: 5,
        unit_price: 200,
        taxable_amount: 1000,
        igst_rate: 18,
        igst_amount: 180,
        total: 1180,
      },
    ],
    totals: {
      subtotal: 2000,
      taxable_amount: 2000,
      cgst: 90,
      sgst: 90,
      igst: 180,
      total: 2360,
      amount_in_words: "Two Thousand Three Hundred Sixty Rupees",
    },
    notes: "Thank you for your business",
  };
}

describe("getValueAtPath", () => {
  it("gets a top-level value", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "notes")).toBe("Thank you for your business");
  });

  it("gets a nested value", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "invoice.invoice_number")).toBe("INV-001");
  });

  it("gets a deeply nested value", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "totals.amount_in_words")).toBe(
      "Two Thousand Three Hundred Sixty Rupees"
    );
  });

  it("gets a value from an array by index", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "line_items.0.description")).toBe("Widget A");
    expect(getValueAtPath(data, "line_items.1.description")).toBe("Widget B");
  });

  it("returns undefined for non-existent paths", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "invoice.nonexistent")).toBeUndefined();
    expect(getValueAtPath(data, "nonexistent.field")).toBeUndefined();
  });

  it("returns undefined for null/undefined input", () => {
    expect(getValueAtPath(null, "field")).toBeUndefined();
    expect(getValueAtPath(undefined, "field")).toBeUndefined();
  });

  it("gets a boolean value", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "invoice.reverse_charge")).toBe(false);
  });

  it("gets a number value", () => {
    const data = createSampleData();
    expect(getValueAtPath(data, "totals.total")).toBe(2360);
  });
});

describe("setValueAtPath", () => {
  it("sets a top-level value", () => {
    const obj: Record<string, unknown> = { name: "old" };
    setValueAtPath(obj, "name", "new");
    expect(obj.name).toBe("new");
  });

  it("sets a nested value", () => {
    const obj: Record<string, unknown> = { invoice: { number: "old" } };
    setValueAtPath(obj, "invoice.number", "new");
    expect((obj.invoice as Record<string, unknown>).number).toBe("new");
  });

  it("creates intermediate objects if they don't exist", () => {
    const obj: Record<string, unknown> = {};
    setValueAtPath(obj, "a.b.c", "value");
    expect(
      ((obj.a as Record<string, unknown>).b as Record<string, unknown>).c
    ).toBe("value");
  });

  it("sets values in arrays by index", () => {
    const obj: Record<string, unknown> = { items: [{ name: "old" }] };
    setValueAtPath(obj, "items.0.name", "new");
    expect((obj.items as Array<Record<string, unknown>>)[0].name).toBe("new");
  });
});

describe("applyEditsToStructuredData", () => {
  it("applies a string field edit", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "invoice.invoice_number": "INV-999",
    });
    expect(result.invoice.invoice_number).toBe("INV-999");
  });

  it("does not mutate the original object", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "invoice.invoice_number": "INV-999",
    });
    expect(data.invoice.invoice_number).toBe("INV-001");
    expect(result.invoice.invoice_number).toBe("INV-999");
    expect(result).not.toBe(data);
  });

  it("coerces number fields from string", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "totals.total": "5000.50",
    });
    expect(result.totals.total).toBe(5000.5);
    expect(typeof result.totals.total).toBe("number");
  });

  it("coerces boolean fields from string", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "invoice.reverse_charge": "true",
    });
    expect(result.invoice.reverse_charge).toBe(true);
    expect(typeof result.invoice.reverse_charge).toBe("boolean");
  });

  it("coerces boolean false from string", () => {
    const data = createSampleData();
    data.invoice.reverse_charge = true;
    const result = applyEditsToStructuredData(data, {
      "invoice.reverse_charge": "false",
    });
    expect(result.invoice.reverse_charge).toBe(false);
  });

  it("handles line item path edits", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "line_items.0.description": "Updated Widget",
      "line_items.1.quantity": "20",
    });
    expect(result.line_items[0].description).toBe("Updated Widget");
    expect(result.line_items[1].quantity).toBe(20);
    expect(typeof result.line_items[1].quantity).toBe("number");
  });

  it("handles empty edits map", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {});
    expect(result).toEqual(data);
    expect(result).not.toBe(data); // Still returns a clone
  });

  it("applies multiple edits at once", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "invoice.invoice_number": "INV-999",
      "seller.name": "New Seller",
      "totals.subtotal": "3000",
      "notes": "Updated notes",
    });
    expect(result.invoice.invoice_number).toBe("INV-999");
    expect(result.seller.name).toBe("New Seller");
    expect(result.totals.subtotal).toBe(3000);
    expect(result.notes).toBe("Updated notes");
  });

  it("handles NaN number coercion by defaulting to 0", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "totals.total": "not-a-number",
    });
    expect(result.totals.total).toBe(0);
  });

  it("treats new fields (not in original) as strings", () => {
    const data = createSampleData();
    const result = applyEditsToStructuredData(data, {
      "seller.email": "seller@example.com",
    });
    expect(result.seller.email).toBe("seller@example.com");
  });
});
