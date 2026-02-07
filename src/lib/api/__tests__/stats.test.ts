import { vi, describe, it, expect, beforeEach } from "vitest";
import { getStats } from "@/lib/api/stats";

vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);

describe("stats API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("calls GET /stats and returns data", async () => {
      const mockStats = {
        total_documents: 156,
        total_collections: 12,
        parsing_pending: 0,
        parsing_queued: 0,
        parsing_processing: 2,
        parsing_completed: 150,
        parsing_failed: 4,
        validation_valid: 60,
        validation_warning: 2,
        validation_invalid: 86,
        review_pending: 84,
        review_approved: 10,
        review_rejected: 0,
        reconciliation_valid: 0,
        reconciliation_warning: 0,
        reconciliation_invalid: 0,
      };

      mockGet.mockResolvedValue({ data: { data: mockStats } });

      const result = await getStats();

      expect(mockGet).toHaveBeenCalledWith("/stats");
      expect(result).toEqual(mockStats);
    });

    it("propagates errors from API client", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      await expect(getStats()).rejects.toThrow("Network error");
    });
  });
});
