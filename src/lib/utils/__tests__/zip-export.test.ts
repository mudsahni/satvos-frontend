import { describe, it, expect } from "vitest";
import {
  sanitizeFilename,
  getExtension,
  isCompressedFormat,
  deduplicateFilename,
} from "../zip-export";

describe("sanitizeFilename", () => {
  it("replaces forbidden characters with underscores", () => {
    expect(sanitizeFilename("file/name\\with?bad*chars")).toBe(
      "file_name_with_bad_chars"
    );
  });

  it("replaces pipe, colon, quotes, angle brackets", () => {
    expect(sanitizeFilename('a|b:c"d<e>f')).toBe("a_b_c_d_e_f");
  });

  it("trims whitespace", () => {
    expect(sanitizeFilename("  hello  ")).toBe("hello");
  });

  it("returns 'unnamed' for empty/whitespace-only input", () => {
    expect(sanitizeFilename("")).toBe("unnamed");
    expect(sanitizeFilename("   ")).toBe("unnamed");
  });

  it("returns 'unnamed' when string is entirely forbidden chars", () => {
    expect(sanitizeFilename("???")).toBe("___");
  });

  it("preserves valid characters", () => {
    expect(sanitizeFilename("invoice-2024_Q4 (final)")).toBe(
      "invoice-2024_Q4 (final)"
    );
  });
});

describe("getExtension", () => {
  it("returns the extension including the dot", () => {
    expect(getExtension("report.pdf")).toBe(".pdf");
    expect(getExtension("image.JPEG")).toBe(".JPEG");
  });

  it("returns the last extension for multi-dot filenames", () => {
    expect(getExtension("archive.tar.gz")).toBe(".gz");
  });

  it("defaults to .pdf when there is no extension", () => {
    expect(getExtension("noextension")).toBe(".pdf");
  });

  it("defaults to .pdf when dot is at position 0 (hidden file)", () => {
    expect(getExtension(".gitignore")).toBe(".pdf");
  });
});

describe("isCompressedFormat", () => {
  it("returns true for PDF", () => {
    expect(isCompressedFormat("invoice.pdf")).toBe(true);
  });

  it("returns true for common compressed extensions", () => {
    expect(isCompressedFormat("photo.jpg")).toBe(true);
    expect(isCompressedFormat("photo.jpeg")).toBe(true);
    expect(isCompressedFormat("photo.png")).toBe(true);
    expect(isCompressedFormat("archive.zip")).toBe(true);
    expect(isCompressedFormat("file.gz")).toBe(true);
    expect(isCompressedFormat("doc.docx")).toBe(true);
    expect(isCompressedFormat("sheet.xlsx")).toBe(true);
    expect(isCompressedFormat("video.mp4")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isCompressedFormat("file.PDF")).toBe(true);
    expect(isCompressedFormat("file.Jpg")).toBe(true);
  });

  it("returns false for uncompressed formats", () => {
    expect(isCompressedFormat("file.txt")).toBe(false);
    expect(isCompressedFormat("file.csv")).toBe(false);
    expect(isCompressedFormat("file.xml")).toBe(false);
    expect(isCompressedFormat("file.html")).toBe(false);
  });
});

describe("deduplicateFilename", () => {
  it("returns the original filename when no duplicates", () => {
    const used = new Set<string>();
    expect(deduplicateFilename("report.pdf", used)).toBe("report.pdf");
  });

  it("adds (1) suffix for the first duplicate", () => {
    const used = new Set<string>(["report.pdf"]);
    expect(deduplicateFilename("report.pdf", used)).toBe("report (1).pdf");
  });

  it("increments counter for multiple duplicates", () => {
    const used = new Set<string>(["report.pdf", "report (1).pdf"]);
    expect(deduplicateFilename("report.pdf", used)).toBe("report (2).pdf");
  });

  it("is case-insensitive for deduplication", () => {
    const used = new Set<string>(["report.pdf"]);
    expect(deduplicateFilename("REPORT.pdf", used)).toBe("REPORT (1).pdf");
  });

  it("tracks used names in the set", () => {
    const used = new Set<string>();
    deduplicateFilename("a.pdf", used);
    deduplicateFilename("a.pdf", used);
    expect(used.has("a.pdf")).toBe(true);
    expect(used.has("a (1).pdf")).toBe(true);
  });

  it("preserves original extension", () => {
    const used = new Set<string>();
    expect(deduplicateFilename("image.png", used)).toBe("image.png");
  });

  it("defaults extension to .pdf for extensionless names", () => {
    const used = new Set<string>();
    expect(deduplicateFilename("noext", used)).toBe("noext.pdf");
  });

  it("sanitizes the base name", () => {
    const used = new Set<string>();
    expect(deduplicateFilename("file/with:bad.txt", used)).toBe(
      "file_with_bad.txt"
    );
  });
});
