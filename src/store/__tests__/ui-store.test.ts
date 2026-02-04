import { useUIStore } from "../ui-store";

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: {},
};

describe("useUIStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUIStore.setState(initialState);
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toEqual({});
    });
  });

  describe("toggleSidebar", () => {
    it("toggles sidebarOpen from true to false", () => {
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it("toggles sidebarOpen from false to true", () => {
      useUIStore.setState({ sidebarOpen: false });
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it("toggles back and forth correctly", () => {
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar(); // true -> false
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().toggleSidebar(); // false -> true
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe("setSidebarOpen", () => {
    it("sets sidebarOpen to a specific value (true)", () => {
      useUIStore.setState({ sidebarOpen: false });
      const { setSidebarOpen } = useUIStore.getState();
      setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it("sets sidebarOpen to a specific value (false)", () => {
      const { setSidebarOpen } = useUIStore.getState();
      setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe("toggleSidebarCollapsed", () => {
    it("toggles sidebarCollapsed from false to true", () => {
      const { toggleSidebarCollapsed } = useUIStore.getState();
      toggleSidebarCollapsed();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it("toggles sidebarCollapsed from true to false", () => {
      useUIStore.setState({ sidebarCollapsed: true });
      const { toggleSidebarCollapsed } = useUIStore.getState();
      toggleSidebarCollapsed();
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe("setSidebarCollapsed", () => {
    it("sets sidebarCollapsed to true", () => {
      const { setSidebarCollapsed } = useUIStore.getState();
      setSidebarCollapsed(true);
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it("sets sidebarCollapsed to false", () => {
      useUIStore.setState({ sidebarCollapsed: true });
      const { setSidebarCollapsed } = useUIStore.getState();
      setSidebarCollapsed(false);
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe("openModal", () => {
    it("sets activeModal to the given id", () => {
      const { openModal } = useUIStore.getState();
      openModal("confirm-delete");
      expect(useUIStore.getState().activeModal).toBe("confirm-delete");
    });

    it("sets modalData to the given data", () => {
      const { openModal } = useUIStore.getState();
      openModal("confirm-delete", { documentId: "doc-1", name: "Invoice" });

      const state = useUIStore.getState();
      expect(state.activeModal).toBe("confirm-delete");
      expect(state.modalData).toEqual({ documentId: "doc-1", name: "Invoice" });
    });

    it("defaults modalData to empty object when no data is provided", () => {
      const { openModal } = useUIStore.getState();
      openModal("settings");

      const state = useUIStore.getState();
      expect(state.activeModal).toBe("settings");
      expect(state.modalData).toEqual({});
    });

    it("replaces previous modal state when opening a new modal", () => {
      const { openModal } = useUIStore.getState();
      openModal("modal-1", { key: "value-1" });
      openModal("modal-2", { key: "value-2" });

      const state = useUIStore.getState();
      expect(state.activeModal).toBe("modal-2");
      expect(state.modalData).toEqual({ key: "value-2" });
    });
  });

  describe("closeModal", () => {
    it("clears activeModal and modalData", () => {
      // First open a modal
      const { openModal } = useUIStore.getState();
      openModal("confirm-delete", { documentId: "doc-1" });

      // Verify modal is open
      expect(useUIStore.getState().activeModal).toBe("confirm-delete");

      // Close it
      const { closeModal } = useUIStore.getState();
      closeModal();

      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toEqual({});
    });

    it("is safe to call when no modal is open", () => {
      const { closeModal } = useUIStore.getState();
      closeModal();

      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toEqual({});
    });
  });
});
