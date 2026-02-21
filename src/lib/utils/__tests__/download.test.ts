import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerBlobDownload } from "../download";

describe("triggerBlobDownload", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  const mockClick = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: mockClick,
      remove: mockRemove,
    } as unknown as HTMLAnchorElement);
    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/fake-id");
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it("creates an anchor element, clicks it, and cleans up", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    triggerBlobDownload(blob, "test.txt");

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/fake-id");
  });

  it("sets the download attribute to the provided filename", () => {
    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
      remove: mockRemove,
    };
    createElementSpy.mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

    const blob = new Blob(["data"], { type: "application/octet-stream" });
    triggerBlobDownload(blob, "report.zip");

    expect(mockAnchor.download).toBe("report.zip");
    expect(mockAnchor.href).toBe("blob:http://localhost/fake-id");
  });

  it("cleans up even if click throws", () => {
    mockClick.mockImplementationOnce(() => {
      throw new Error("click failed");
    });

    const blob = new Blob(["test"]);
    expect(() => triggerBlobDownload(blob, "fail.txt")).toThrow("click failed");
    expect(mockRemove).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
