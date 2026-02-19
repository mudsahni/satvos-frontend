import { useUIStore } from "../ui-store";

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: {},
};

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState(initialState);
  });

  it.each([
    ["toggleSidebar", "sidebarOpen", false],
    ["toggleSidebarCollapsed", "sidebarCollapsed", true],
  ] as const)("%s toggles the boolean", (action, key, expected) => {
    useUIStore.getState()[action]();
    expect(useUIStore.getState()[key]).toBe(expected);
    // Toggle back
    useUIStore.getState()[action]();
    expect(useUIStore.getState()[key]).toBe(!expected);
  });

  it.each([
    ["setSidebarOpen", "sidebarOpen"],
    ["setSidebarCollapsed", "sidebarCollapsed"],
  ] as const)("%s sets the value directly", (action, key) => {
    useUIStore.getState()[action](true);
    expect(useUIStore.getState()[key]).toBe(true);
    useUIStore.getState()[action](false);
    expect(useUIStore.getState()[key]).toBe(false);
  });

  it("openModal sets activeModal and modalData", () => {
    useUIStore.getState().openModal("confirm-delete", { documentId: "doc-1" });

    const state = useUIStore.getState();
    expect(state.activeModal).toBe("confirm-delete");
    expect(state.modalData).toEqual({ documentId: "doc-1" });
  });

  it("openModal defaults modalData to empty object", () => {
    useUIStore.getState().openModal("settings");
    expect(useUIStore.getState().modalData).toEqual({});
  });

  it("openModal replaces previous modal state", () => {
    useUIStore.getState().openModal("modal-1", { key: "value-1" });
    useUIStore.getState().openModal("modal-2", { key: "value-2" });

    const state = useUIStore.getState();
    expect(state.activeModal).toBe("modal-2");
    expect(state.modalData).toEqual({ key: "value-2" });
  });

  it("closeModal clears activeModal and modalData", () => {
    useUIStore.getState().openModal("confirm-delete", { documentId: "doc-1" });
    useUIStore.getState().closeModal();

    const state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.modalData).toEqual({});
  });
});
