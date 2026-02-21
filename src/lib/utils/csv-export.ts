import { triggerBlobDownload } from "./download";

export interface CsvColumn<T> {
  key: keyof T & string;
  header: string;
  format?: (value: T[keyof T], row: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value, row) : String(value ?? "");
      // Escape CSV: wrap in quotes if contains comma, quote, or newline
      if (/[",\n\r]/.test(formatted)) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, `${filename}.csv`);
}
