import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from "fflate";
import { fetchCollectionCsvBlob, fetchCollectionTallyBlob } from "@/lib/api/collections";
import { getDocuments } from "@/lib/api/documents";
import { getAuthState } from "@/store/auth-store";
import { fetchAllPaginated } from "./fetch-all-paginated";
import type { Document } from "@/types/document";

export interface ZipExportOptions {
  collectionId: string;
  collectionName: string;
  companyName?: string;
  onProgress?: (phase: string, current: number, total: number) => void;
  signal?: AbortSignal;
}

/** Sanitize a string for use as a filename */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "unnamed";
}

/** Get extension from a filename, defaulting to .pdf */
function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot > 0) return name.slice(dot);
  return ".pdf";
}

/** Extensions that are already compressed — store without re-compressing */
const COMPRESSED_EXTENSIONS = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".zip", ".gz", ".bz2", ".xz", ".7z", ".rar",
  ".mp3", ".mp4", ".avi", ".mov",
  ".docx", ".xlsx", ".pptx",
]);

function isCompressedFormat(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return COMPRESSED_EXTENSIONS.has(ext);
}

/** Generate a unique filename, adding (1), (2) etc. for duplicates */
function deduplicateFilename(docName: string, usedNames: Set<string>): string {
  const ext = getExtension(docName);
  const base = sanitizeFilename(docName.replace(/\.[^.]+$/, ""));
  let filename = `${base}${ext}`;
  let counter = 1;
  while (usedNames.has(filename.toLowerCase())) {
    filename = `${base} (${counter})${ext}`;
    counter++;
  }
  usedNames.add(filename.toLowerCase());
  return filename;
}

/**
 * Fetch file content via the server-side proxy route.
 * This avoids CORS issues with presigned S3 URLs by fetching server-side.
 */
async function fetchFileContent(fileId: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const { accessToken } = getAuthState();
  const response = await fetch(`/api/files/${fileId}/download`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    signal,
  });
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
  return response.arrayBuffer();
}

export async function exportCollectionZip(options: ZipExportOptions): Promise<void> {
  const { collectionId, collectionName, companyName, onProgress, signal } = options;
  const safeName = sanitizeFilename(collectionName);

  // Phase 1: Fetch all documents in the collection
  onProgress?.("Fetching document list...", 0, 0);
  signal?.throwIfAborted();

  const documents = await fetchAllPaginated(
    ({ limit, offset }) => getDocuments({ limit, offset, collection_id: collectionId }),
    { signal }
  );

  // Phase 2: Fetch CSV and Tally exports in parallel
  onProgress?.("Generating exports...", 0, 2);
  signal?.throwIfAborted();

  const [csvResult, tallyResult] = await Promise.allSettled([
    fetchCollectionCsvBlob(collectionId),
    fetchCollectionTallyBlob(collectionId, companyName),
  ]);

  onProgress?.("Generating exports...", 2, 2);

  // ── Streaming ZIP construction ──
  // Instead of loading every file into a giant object and calling zipSync(),
  // we use fflate's streaming Zip class. Each file is added incrementally
  // and its raw buffer can be garbage-collected immediately. Peak memory
  // drops from (all raw files + ZIP output) to (one raw file + ZIP chunks).
  const chunks: Uint8Array[] = [];
  let zipError: Error | null = null;

  const zip = new Zip((err, data) => {
    if (err) { zipError = err; return; }
    chunks.push(data);
  });

  function addToZip(path: string, data: Uint8Array, store: boolean) {
    if (zipError) throw zipError;
    const entry = store
      ? new ZipPassThrough(path)
      : new ZipDeflate(path, { level: 6 });
    zip.add(entry);
    entry.push(data, true);
  }

  let hasContent = false;

  // Add CSV export
  if (csvResult.status === "fulfilled") {
    const csvBytes = new Uint8Array(await csvResult.value.arrayBuffer());
    addToZip(`exports/${safeName}.csv`, csvBytes, false);
    hasContent = true;
  }

  // Add Tally XML export
  if (tallyResult.status === "fulfilled") {
    const xmlBytes = new Uint8Array(await tallyResult.value.arrayBuffer());
    addToZip(`exports/${safeName}.xml`, xmlBytes, false);
    hasContent = true;
  }

  // Phase 3: Download files and stream into ZIP (avoids holding all in memory)
  const docsWithFiles = documents.filter((d: Document) => d.file_id);
  const totalFiles = docsWithFiles.length;
  let filesDownloaded = 0;
  const usedNames = new Set<string>();

  onProgress?.("Downloading files...", 0, totalFiles);

  // Download with limited concurrency — each file is added to the ZIP
  // as soon as it arrives, then its raw buffer can be GC'd.
  let nextIndex = 0;

  async function downloadWorker() {
    while (nextIndex < docsWithFiles.length) {
      signal?.throwIfAborted();
      const doc = docsWithFiles[nextIndex++];

      try {
        const buffer = await fetchFileContent(doc.file_id, signal);
        const data = new Uint8Array(buffer);
        const filename = deduplicateFilename(doc.name, usedNames);
        const path = `documents/${filename}`;

        // Store already-compressed formats as-is; deflate everything else
        addToZip(path, data, isCompressedFormat(filename));
        hasContent = true;
        // `data` / `buffer` references go out of scope here → eligible for GC
      } catch {
        // Skip failed files gracefully
      }

      filesDownloaded++;
      onProgress?.("Downloading files...", filesDownloaded, totalFiles);
    }
  }

  if (docsWithFiles.length > 0) {
    const workers = Array.from(
      { length: Math.min(3, docsWithFiles.length) },
      () => downloadWorker()
    );
    await Promise.all(workers);
  }

  // Empty ZIP guard
  if (!hasContent) {
    addToZip("README.txt", strToU8("This collection had no exportable content."), false);
  }

  // Finalize the ZIP (writes central directory)
  zip.end();
  if (zipError) throw zipError;

  // Phase 4: Trigger download — Blob accepts chunk array (no concatenation copy)
  onProgress?.("Preparing download...", 0, 0);
  const blob = new Blob(chunks.map((c) => c.buffer as ArrayBuffer), { type: "application/zip" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  try {
    a.href = url;
    a.download = `${safeName}.zip`;
    document.body.appendChild(a);
    a.click();
  } finally {
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
