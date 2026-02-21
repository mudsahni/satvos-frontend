/**
 * Trigger a browser file download from a Blob.
 * Shared helper to avoid repeating the ObjectURL + anchor pattern.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  try {
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
  } finally {
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
