/**
 * Fetches all pages of a paginated API endpoint with concurrency control.
 *
 * The API only supports offset/limit pagination. When client-side filtering
 * is needed, we must fetch all items. This utility replaces the copy-pasted
 * fetch-all pattern with concurrency-limited batching.
 */

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

interface FetchAllOptions {
  /** Max concurrent requests (default: 5) */
  concurrency?: number;
  /** Items per page (default: 100) */
  pageSize?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Fetches all items from a paginated endpoint.
 *
 * @param fetcher - Function that takes `{ limit, offset }` and returns `{ items, total }`
 * @param options - Concurrency, page size, and abort signal
 * @returns All items concatenated
 *
 * @example
 * ```ts
 * const items = await fetchAllPaginated(
 *   ({ limit, offset }) => getDocuments({ limit, offset, collection_id: "col-1" }),
 *   { concurrency: 3 }
 * );
 * ```
 */
export async function fetchAllPaginated<T>(
  fetcher: (params: { limit: number; offset: number }) => Promise<PaginatedResult<T>>,
  options: FetchAllOptions = {}
): Promise<T[]> {
  const { concurrency = 5, pageSize = 100, signal } = options;

  // Fetch first page to get total count
  const first = await fetcher({ limit: pageSize, offset: 0 });
  const items: T[] = [...first.items];
  const total = first.total;

  const remainingPages = Math.ceil(total / pageSize) - 1;
  if (remainingPages <= 0) return items;

  // Build list of offsets for remaining pages
  const offsets = Array.from({ length: remainingPages }, (_, i) => (i + 1) * pageSize);

  // Fetch in batches of `concurrency`
  for (let i = 0; i < offsets.length; i += concurrency) {
    signal?.throwIfAborted();

    const batch = offsets.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map((offset) => fetcher({ limit: pageSize, offset }))
    );
    for (const result of results) {
      items.push(...result.items);
    }
  }

  return items;
}
