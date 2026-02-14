import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getFinancialSummary,
  getTaxSummary,
  getCollectionsOverview,
  getSellersReport,
  getBuyersReport,
  getPartyLedger,
  getHsnSummary,
} from "@/lib/api/reports";

vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);

describe("reports API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFinancialSummary", () => {
    it("calls GET /reports/financial-summary with params and returns data", async () => {
      const mockData = [
        { period: "2025-01", total_amount: 100000, subtotal: 90000, cgst: 2500, sgst: 2500, igst: 0, cess: 0, taxable_amount: 90000, invoice_count: 10, period_start: "2025-01-01", period_end: "2025-01-31" },
      ];
      mockGet.mockResolvedValue({ data: { data: mockData } });

      const params = { from: "2025-01-01", to: "2025-01-31", granularity: "monthly" as const };
      const result = await getFinancialSummary(params);

      expect(mockGet).toHaveBeenCalledWith("/reports/financial-summary", { params });
      expect(result).toEqual(mockData);
    });
  });

  describe("getTaxSummary", () => {
    it("calls GET /reports/tax-summary and returns data", async () => {
      const mockData = [
        { period: "2025-01", total_tax: 5000, cgst: 2000, sgst: 2000, igst: 1000, cess: 0, intrastate_count: 5, intrastate_taxable: 40000, interstate_count: 5, interstate_taxable: 50000, period_start: "2025-01-01", period_end: "2025-01-31" },
      ];
      mockGet.mockResolvedValue({ data: { data: mockData } });

      const result = await getTaxSummary({ granularity: "monthly" });

      expect(mockGet).toHaveBeenCalledWith("/reports/tax-summary", { params: { granularity: "monthly" } });
      expect(result).toEqual(mockData);
    });
  });

  describe("getCollectionsOverview", () => {
    it("calls GET /reports/collections-overview and returns data", async () => {
      const mockData = [
        { collection_id: "c1", collection_name: "Test", document_count: 10, total_amount: 50000, validation_valid_pct: 0.8, validation_warning_pct: 0.1, validation_invalid_pct: 0.1, review_approved_pct: 0.7, review_pending_pct: 0.3 },
      ];
      mockGet.mockResolvedValue({ data: { data: mockData } });

      const result = await getCollectionsOverview();

      expect(mockGet).toHaveBeenCalledWith("/reports/collections-overview", { params: undefined });
      expect(result).toEqual(mockData);
    });
  });

  describe("getSellersReport", () => {
    it("calls GET /reports/sellers with pagination and transforms response", async () => {
      const mockData = [
        { seller_gstin: "29ABCDE1234F1Z5", seller_name: "Seller 1", seller_state: "Karnataka", invoice_count: 5, total_amount: 25000, total_tax: 2500, cgst: 1000, sgst: 1000, igst: 500, average_invoice_value: 5000, first_invoice_date: "2025-01-01", last_invoice_date: "2025-01-15" },
      ];
      mockGet.mockResolvedValue({
        data: { data: mockData, meta: { total: 1, offset: 0, limit: 20 } },
      });

      const result = await getSellersReport({ offset: 0, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith("/reports/sellers", { params: { offset: 0, limit: 20 } });
      expect(result.items).toEqual(mockData);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe("getBuyersReport", () => {
    it("calls GET /reports/buyers and transforms pagination", async () => {
      const mockData = [
        { buyer_gstin: "27XYZAB5678C1Z3", buyer_name: "Buyer 1", buyer_state: "Maharashtra", invoice_count: 3, total_amount: 15000, total_tax: 1500, cgst: 600, sgst: 600, igst: 300, average_invoice_value: 5000, first_invoice_date: "2025-01-05", last_invoice_date: "2025-01-20" },
      ];
      mockGet.mockResolvedValue({
        data: { data: mockData, meta: { total: 1, offset: 0, limit: 20 } },
      });

      const result = await getBuyersReport();

      expect(mockGet).toHaveBeenCalledWith("/reports/buyers", { params: undefined });
      expect(result.items).toEqual(mockData);
    });
  });

  describe("getPartyLedger", () => {
    it("calls GET /reports/party-ledger with gstin and transforms response", async () => {
      const mockData = [
        { document_id: "d1", invoice_number: "INV-001", invoice_date: "2025-01-01", invoice_type: "regular", role: "seller", counterparty_gstin: "27XYZAB5678C1Z3", counterparty_name: "Buyer 1", subtotal: 10000, taxable_amount: 10000, cgst: 900, sgst: 900, igst: 0, total_amount: 11800, validation_status: "valid", review_status: "approved" },
      ];
      mockGet.mockResolvedValue({
        data: { data: mockData, meta: { total: 1, offset: 0, limit: 20 } },
      });

      const params = { gstin: "29ABCDE1234F1Z5", offset: 0, limit: 20 };
      const result = await getPartyLedger(params);

      expect(mockGet).toHaveBeenCalledWith("/reports/party-ledger", { params });
      expect(result.items).toEqual(mockData);
    });
  });

  describe("getHsnSummary", () => {
    it("calls GET /reports/hsn-summary and transforms pagination", async () => {
      const mockData = [
        { hsn_code: "8471", description: "Computers", line_item_count: 20, invoice_count: 15, total_quantity: 25, taxable_amount: 200000, cgst: 18000, sgst: 18000, igst: 0, total_tax: 36000 },
      ];
      mockGet.mockResolvedValue({
        data: { data: mockData, meta: { total: 1, offset: 0, limit: 20 } },
      });

      const result = await getHsnSummary({ offset: 0, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith("/reports/hsn-summary", { params: { offset: 0, limit: 20 } });
      expect(result.items).toEqual(mockData);
    });
  });

  describe("error handling", () => {
    it("propagates errors from API client", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      await expect(getFinancialSummary()).rejects.toThrow("Network error");
      await expect(getSellersReport()).rejects.toThrow("Network error");
    });
  });
});
