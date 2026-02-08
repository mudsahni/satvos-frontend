import { vi, describe, it, expect } from "vitest";
import { fetchAllPaginated } from "../fetch-all-paginated";

function createMockFetcher(totalItems: number, pageSize: number = 100) {
  const allItems = Array.from({ length: totalItems }, (_, i) => ({ id: i + 1 }));
  return vi.fn(({ limit, offset }: { limit: number; offset: number }) => {
    const items = allItems.slice(offset, offset + limit);
    return Promise.resolve({ items, total: totalItems });
  });
}

describe("fetchAllPaginated", () => {
  it("returns items from a single page when total fits in one page", async () => {
    const fetcher = createMockFetcher(50);

    const result = await fetchAllPaginated(fetcher, { pageSize: 100 });

    expect(result).toHaveLength(50);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith({ limit: 100, offset: 0 });
  });

  it("fetches multiple pages and concatenates results", async () => {
    const fetcher = createMockFetcher(250);

    const result = await fetchAllPaginated(fetcher, { pageSize: 100 });

    expect(result).toHaveLength(250);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith({ limit: 100, offset: 0 });
    expect(fetcher).toHaveBeenCalledWith({ limit: 100, offset: 100 });
    expect(fetcher).toHaveBeenCalledWith({ limit: 100, offset: 200 });
  });

  it("respects concurrency limit", async () => {
    // Track concurrent in-flight requests
    let concurrent = 0;
    let maxConcurrent = 0;

    const fetcher = vi.fn(async ({ limit, offset }: { limit: number; offset: number }) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      // Simulate async delay
      await new Promise((r) => setTimeout(r, 10));
      concurrent--;
      const total = 600;
      const items = Array.from(
        { length: Math.min(limit, total - offset) },
        (_, i) => ({ id: offset + i + 1 })
      );
      return { items, total };
    });

    const result = await fetchAllPaginated(fetcher, {
      pageSize: 100,
      concurrency: 2,
    });

    expect(result).toHaveLength(600);
    // 1 initial + 5 remaining = 6 calls total
    expect(fetcher).toHaveBeenCalledTimes(6);
    // Max concurrent should be capped at 2 (within a batch)
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it("uses default concurrency of 5", async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    const fetcher = vi.fn(async ({ limit, offset }: { limit: number; offset: number }) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((r) => setTimeout(r, 10));
      concurrent--;
      const total = 1000;
      const items = Array.from(
        { length: Math.min(limit, total - offset) },
        (_, i) => ({ id: offset + i + 1 })
      );
      return { items, total };
    });

    await fetchAllPaginated(fetcher, { pageSize: 100 });

    // 10 pages total, 1 initial + 9 remaining, batches of 5: max 5 concurrent
    expect(maxConcurrent).toBeLessThanOrEqual(5);
  });

  it("handles exact page boundary (total = pageSize)", async () => {
    const fetcher = createMockFetcher(100);

    const result = await fetchAllPaginated(fetcher, { pageSize: 100 });

    expect(result).toHaveLength(100);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("handles empty result set", async () => {
    const fetcher = createMockFetcher(0);

    const result = await fetchAllPaginated(fetcher);

    expect(result).toHaveLength(0);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("aborts when signal is aborted between batches", async () => {
    const controller = new AbortController();

    const fetcher = vi.fn(async ({ limit, offset }: { limit: number; offset: number }) => {
      // Abort after first batch completes
      if (offset >= 200) {
        controller.abort();
      }
      const total = 1000;
      const items = Array.from(
        { length: Math.min(limit, total - offset) },
        (_, i) => ({ id: offset + i + 1 })
      );
      return { items, total };
    });

    await expect(
      fetchAllPaginated(fetcher, {
        pageSize: 100,
        concurrency: 2,
        signal: controller.signal,
      })
    ).rejects.toThrow();
  });

  it("preserves item order across pages", async () => {
    const fetcher = createMockFetcher(300, 100);

    const result = await fetchAllPaginated(fetcher, { pageSize: 100 });

    const ids = result.map((item) => (item as { id: number }).id);
    expect(ids).toEqual(Array.from({ length: 300 }, (_, i) => i + 1));
  });
});
