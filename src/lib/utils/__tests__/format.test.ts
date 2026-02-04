import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatFileSize,
  formatPercentage,
} from "../format";

describe("formatDate", () => {
  it("returns '-' for null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-03-15T10:30:00Z");
    expect(result).toBe("Mar 15, 2024");
  });

  it("formats a Date object", () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    const result = formatDate(date);
    expect(result).toBe("Jan 5, 2024");
  });

  it("returns '-' for an invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("-");
  });

  it("returns '-' for an empty string", () => {
    expect(formatDate("")).toBe("-");
  });

  it("formats a date-only ISO string", () => {
    const result = formatDate("2023-12-25");
    expect(result).toBe("Dec 25, 2023");
  });
});

describe("formatDateTime", () => {
  it("returns '-' for null", () => {
    expect(formatDateTime(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatDateTime(undefined)).toBe("-");
  });

  it("formats a valid ISO date string with time", () => {
    // Use a fixed date to avoid timezone issues
    const date = new Date(2024, 2, 15, 10, 30, 0); // Mar 15, 2024 10:30 AM local
    const result = formatDateTime(date);
    expect(result).toBe("Mar 15, 2024 at 10:30 AM");
  });

  it("formats a Date object", () => {
    const date = new Date(2024, 0, 5, 14, 45, 0); // Jan 5, 2024 2:45 PM
    const result = formatDateTime(date);
    expect(result).toBe("Jan 5, 2024 at 2:45 PM");
  });

  it("returns '-' for an invalid date string", () => {
    expect(formatDateTime("garbage")).toBe("-");
  });

  it("returns '-' for an empty string", () => {
    expect(formatDateTime("")).toBe("-");
  });
});

describe("formatRelativeTime", () => {
  it("returns '-' for null", () => {
    expect(formatRelativeTime(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatRelativeTime(undefined)).toBe("-");
  });

  it("returns a relative time string for a recent date", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toMatch(/minutes? ago/);
  });

  it("returns a relative time string for an old date", () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeMonthsAgo);
    expect(result).toMatch(/months? ago|about \d+ months? ago/);
  });

  it("handles a date just seconds ago", () => {
    const justNow = new Date(Date.now() - 10 * 1000);
    const result = formatRelativeTime(justNow);
    // date-fns returns "less than a minute ago" for very recent dates
    expect(result).toMatch(/less than a minute ago|seconds? ago/);
  });

  it("returns '-' for an invalid string", () => {
    expect(formatRelativeTime("invalid-date")).toBe("-");
  });

  it("returns '-' for an empty string", () => {
    expect(formatRelativeTime("")).toBe("-");
  });

  it("handles an ISO date string", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = formatRelativeTime(oneHourAgo.toISOString());
    expect(result).toMatch(/hour ago|about 1 hour ago/);
  });
});

describe("formatCurrency", () => {
  it("formats a basic amount in INR by default", () => {
    const result = formatCurrency(1000);
    // en-IN INR format: ₹1,000.00
    expect(result).toContain("1,000.00");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });

  it("formats a decimal amount", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1,234.56");
  });

  it("formats a large amount in INR with lakh grouping", () => {
    const result = formatCurrency(100000);
    // en-IN uses lakh grouping: 1,00,000.00
    expect(result).toContain("1,00,000.00");
  });

  it("formats in USD when specified", () => {
    const result = formatCurrency(1000, "USD");
    expect(result).toContain("1,000.00");
    // Should include dollar sign
    expect(result).toMatch(/\$|US/);
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500.00");
    // Should have a negative indicator
    expect(result).toMatch(/-|−|\(/);
  });

  it("always shows two decimal places", () => {
    const result = formatCurrency(100);
    expect(result).toContain("100.00");
  });
});

describe("formatNumber", () => {
  it("formats an integer", () => {
    const result = formatNumber(1000);
    expect(result).toBe("1,000");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats a large number with Indian grouping", () => {
    const result = formatNumber(10000000);
    // en-IN: 1,00,00,000
    expect(result).toBe("1,00,00,000");
  });

  it("formats a decimal number", () => {
    const result = formatNumber(1234.567);
    // en-IN formatting preserves decimals
    expect(result).toContain("1,234");
  });

  it("formats a negative number", () => {
    const result = formatNumber(-5000);
    expect(result).toMatch(/-5,000|−5,000/);
  });
});

describe("formatFileSize", () => {
  it("returns '0 Bytes' for 0", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("formats bytes (less than 1024)", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  it("formats 1 byte", () => {
    expect(formatFileSize(1)).toBe("1 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats kilobytes with decimals", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  it("formats megabytes with decimals", () => {
    const result = formatFileSize(5.5 * 1024 * 1024);
    expect(result).toBe("5.5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });

  it("formats a typical file size", () => {
    // 2.34 MB
    const bytes = 2.34 * 1024 * 1024;
    const result = formatFileSize(bytes);
    expect(result).toBe("2.34 MB");
  });
});

describe("formatPercentage", () => {
  it("formats 0 as 0.0%", () => {
    expect(formatPercentage(0)).toBe("0.0%");
  });

  it("formats 0.5 (50%) correctly", () => {
    expect(formatPercentage(0.5)).toBe("50.0%");
  });

  it("formats 1 (100%) correctly", () => {
    expect(formatPercentage(1)).toBe("100.0%");
  });

  it("formats 0.956 (95.6%) correctly", () => {
    expect(formatPercentage(0.956)).toBe("95.6%");
  });

  it("formats small values", () => {
    expect(formatPercentage(0.001)).toBe("0.1%");
  });

  it("formats values over 1 (over 100%)", () => {
    expect(formatPercentage(1.5)).toBe("150.0%");
  });

  it("handles very precise decimals with rounding", () => {
    expect(formatPercentage(0.9999)).toBe("100.0%");
  });
});
