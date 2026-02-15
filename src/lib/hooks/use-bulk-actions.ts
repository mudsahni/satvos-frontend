"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";

export interface BulkActionResult {
  succeeded: number;
  failed: number;
}

interface UseBulkActionsOptions {
  /** When any value changes, selection is automatically cleared. */
  resetDeps?: unknown[];
}

export function useBulkActions(options: UseBulkActionsOptions = {}) {
  const { resetDeps = [] } = options;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Skip the initial render so selection isn't cleared on mount
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const createBulkHandler = useCallback(
    (action: (id: string) => Promise<unknown>) =>
      async (ids: string[]): Promise<BulkActionResult> => {
        setIsBulkProcessing(true);
        try {
          const results = await Promise.allSettled(ids.map(action));
          const succeeded = results.filter(
            (r) => r.status === "fulfilled"
          ).length;
          const failed = results.filter(
            (r) => r.status === "rejected"
          ).length;
          if (succeeded > 0) setSelectedIds([]);
          return { succeeded, failed };
        } finally {
          setIsBulkProcessing(false);
        }
      },
    []
  );

  return {
    selectedIds,
    setSelectedIds,
    selectedSet,
    isBulkProcessing,
    clearSelection,
    createBulkHandler,
  };
}
