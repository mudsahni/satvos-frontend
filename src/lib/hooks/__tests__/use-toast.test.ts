import { reducer } from "@/lib/hooks/use-toast";

// Minimal toast objects for testing. The reducer expects objects that
// conform to ToasterToast (ToastProps & { id, title?, description?, action? }).
// For unit-testing the reducer logic we only need `id` and `open`.
function makeToast(id: string, overrides: Record<string, unknown> = {}) {
  return { id, open: true, ...overrides } as Parameters<typeof reducer>[0]["toasts"][number];
}

describe("reducer", () => {
  describe("ADD_TOAST", () => {
    it("adds a toast to empty state", () => {
      const state = { toasts: [] };
      const toast = makeToast("1");

      const result = reducer(state, {
        type: "ADD_TOAST",
        toast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual(toast);
    });

    it("prepends new toast (newest first)", () => {
      const existing = makeToast("1");
      const state = { toasts: [existing] };
      const newToast = makeToast("2");

      const result = reducer(state, {
        type: "ADD_TOAST",
        toast: newToast,
      });

      // TOAST_LIMIT is 1, so the old toast is sliced off
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("respects TOAST_LIMIT of 1 (new toast replaces old)", () => {
      const first = makeToast("1");
      const state = { toasts: [first] };
      const second = makeToast("2");

      const result = reducer(state, {
        type: "ADD_TOAST",
        toast: second,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
      // The first toast should no longer be present
      expect(result.toasts.find((t) => t.id === "1")).toBeUndefined();
    });

    it("does not mutate the original state", () => {
      const state = { toasts: [] };
      const toast = makeToast("1");

      reducer(state, { type: "ADD_TOAST", toast });

      expect(state.toasts).toHaveLength(0);
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates an existing toast by id", () => {
      const toast = makeToast("1", { title: "Original" });
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].title).toBe("Updated");
      expect(result.toasts[0].id).toBe("1");
    });

    it("only updates the matching toast, leaves others unchanged", () => {
      // Even though TOAST_LIMIT is 1 for ADD_TOAST, the state can have
      // multiple toasts if constructed directly for testing purposes.
      const toast1 = makeToast("1", { title: "First" });
      const toast2 = makeToast("2", { title: "Second" });
      const state = { toasts: [toast1, toast2] };

      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "2", title: "Updated Second" },
      });

      expect(result.toasts).toHaveLength(2);
      expect(result.toasts[0].title).toBe("First");
      expect(result.toasts[1].title).toBe("Updated Second");
    });

    it("merges partial updates without removing existing fields", () => {
      const toast = makeToast("1", { title: "Title", description: "Desc" });
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", description: "New Desc" },
      });

      expect(result.toasts[0].title).toBe("Title");
      expect(result.toasts[0].description).toBe("New Desc");
    });

    it("does not modify state if toast id does not match", () => {
      const toast = makeToast("1", { title: "Original" });
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "nonexistent", title: "Updated" },
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].title).toBe("Original");
    });
  });

  describe("DISMISS_TOAST", () => {
    it("dismisses a specific toast by setting open to false", () => {
      const toast = makeToast("1", { open: true });
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].open).toBe(false);
    });

    it("only dismisses the matching toast", () => {
      const toast1 = makeToast("1", { open: true });
      const toast2 = makeToast("2", { open: true });
      const state = { toasts: [toast1, toast2] };

      const result = reducer(state, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(true);
    });

    it("dismisses all toasts when no toastId is provided", () => {
      const toast1 = makeToast("1", { open: true });
      const toast2 = makeToast("2", { open: true });
      const state = { toasts: [toast1, toast2] };

      const result = reducer(state, {
        type: "DISMISS_TOAST",
      });

      expect(result.toasts).toHaveLength(2);
      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(false);
    });

    it("preserves other toast properties when dismissing", () => {
      const toast = makeToast("1", { open: true, title: "Keep me" });
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[0].title).toBe("Keep me");
      expect(result.toasts[0].id).toBe("1");
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes a specific toast by id", () => {
      const toast = makeToast("1");
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(0);
    });

    it("only removes the matching toast, leaves others", () => {
      const toast1 = makeToast("1");
      const toast2 = makeToast("2");
      const state = { toasts: [toast1, toast2] };

      const result = reducer(state, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("removes all toasts when no toastId is provided", () => {
      const toast1 = makeToast("1");
      const toast2 = makeToast("2");
      const toast3 = makeToast("3");
      const state = { toasts: [toast1, toast2, toast3] };

      const result = reducer(state, {
        type: "REMOVE_TOAST",
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });

    it("returns unchanged state when id does not match any toast", () => {
      const toast = makeToast("1");
      const state = { toasts: [toast] };

      const result = reducer(state, {
        type: "REMOVE_TOAST",
        toastId: "nonexistent",
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("1");
    });

    it("does not mutate the original state", () => {
      const toast = makeToast("1");
      const state = { toasts: [toast] };

      reducer(state, { type: "REMOVE_TOAST", toastId: "1" });

      expect(state.toasts).toHaveLength(1);
    });
  });
});
