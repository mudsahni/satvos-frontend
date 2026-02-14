import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToCsv, type CsvColumn } from "@/lib/utils/csv-export";

describe("exportToCsv", () => {
  let mockCreateElement: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAnchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    mockCreateElement = vi.fn().mockReturnValue(mockAnchor);
    mockCreateObjectURL = vi.fn().mockReturnValue("blob:test");
    mockRevokeObjectURL = vi.fn();

    vi.stubGlobal("document", {
      createElement: mockCreateElement,
      body: { appendChild: vi.fn() },
    });
    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
    vi.stubGlobal("Blob", class {
      constructor(public parts: string[], public options: Record<string, string>) {}
    });
  });

  it("generates CSV with correct headers", () => {
    type TestRow = { name: string; value: number };
    const columns: CsvColumn<TestRow>[] = [
      { key: "name", header: "Name" },
      { key: "value", header: "Amount" },
    ];
    const data: TestRow[] = [{ name: "Test", value: 100 }];

    exportToCsv(data, columns, "test-export");

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchor.download).toBe("test-export.csv");
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("applies custom format functions", () => {
    type TestRow = { name: string; value: number };
    const columns: CsvColumn<TestRow>[] = [
      { key: "name", header: "Name" },
      { key: "value", header: "Amount", format: (v) => `$${v}` },
    ];
    const data: TestRow[] = [{ name: "Item", value: 50 }];

    exportToCsv(data, columns, "formatted");

    const blobCall = mockCreateObjectURL.mock.calls[0][0];
    const csvContent = blobCall.parts[0];
    expect(csvContent).toContain("Name,Amount");
    expect(csvContent).toContain("Item,$50");
  });

  it("escapes values containing commas and quotes", () => {
    type TestRow = { name: string; value: number };
    const columns: CsvColumn<TestRow>[] = [
      { key: "name", header: "Name" },
      { key: "value", header: "Amount" },
    ];
    const data: TestRow[] = [{ name: 'Test, "quoted"', value: 100 }];

    exportToCsv(data, columns, "escaped");

    const blobCall = mockCreateObjectURL.mock.calls[0][0];
    const csvContent = blobCall.parts[0];
    expect(csvContent).toContain('"Test, ""quoted"""');
  });

  it("handles empty data", () => {
    type TestRow = { name: string };
    const columns: CsvColumn<TestRow>[] = [
      { key: "name", header: "Name" },
    ];

    exportToCsv([] as TestRow[], columns, "empty");

    const blobCall = mockCreateObjectURL.mock.calls[0][0];
    const csvContent = blobCall.parts[0];
    expect(csvContent).toBe("Name");
  });
});
