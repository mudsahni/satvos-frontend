import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from "fflate";
import { fetchCollectionCsvBlob, fetchCollectionTallyBlob } from "@/lib/api/collections";
import { getDocuments } from "@/lib/api/documents";
import { getAuthState } from "@/store/auth-store";
import { fetchAllPaginated } from "./fetch-all-paginated";
import { triggerBlobDownload } from "./download";
import type { Document } from "@/types/document";

export interface ZipExportOptions {
  collectionId: string;
  collectionName: string;
  companyName?: string;
  includeCsv?: boolean;
  includeTally?: boolean;
  includeDocuments?: boolean;
  onProgress?: (phase: string, current: number, total: number) => void;
  signal?: AbortSignal;
}

/** Sanitize a string for use as a filename */
export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "unnamed";
}

/** Get extension from a filename, defaulting to .pdf */
export function getExtension(name: string): string {
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

export function isCompressedFormat(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return COMPRESSED_EXTENSIONS.has(ext);
}

/** Generate a unique filename, adding (1), (2) etc. for duplicates */
export function deduplicateFilename(docName: string, usedNames: Set<string>): string {
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
async function fetchFileContent(
  fileId: string,
  accessToken: string | null,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  const response = await fetch(`/api/files/${fileId}/download`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    signal,
  });
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
  return response.arrayBuffer();
}

// ── Shared streaming ZIP helpers ──

interface StreamingZip {
  addEntry: (path: string, data: Uint8Array, store: boolean) => void;
  finalize: (emptyFallback?: string) => Blob;
  hasContent: () => boolean;
}

/**
 * Creates a streaming ZIP builder using fflate.
 * Files are added incrementally — each raw buffer can be GC'd immediately
 * after being pushed into the ZIP stream. Peak memory is (one raw file + ZIP chunks)
 * rather than (all raw files + ZIP output).
 */
function createStreamingZip(): StreamingZip {
  const chunks: Uint8Array[] = [];
  let zipError: Error | null = null;
  let contentAdded = false;

  const zip = new Zip((err, data) => {
    if (err) { zipError = err; return; }
    chunks.push(data);
  });

  function addEntry(path: string, data: Uint8Array, store: boolean) {
    if (zipError) throw zipError;
    const entry = store
      ? new ZipPassThrough(path)
      : new ZipDeflate(path, { level: 6 });
    zip.add(entry);
    entry.push(data, true);
    contentAdded = true;
  }

  function finalize(emptyFallback = "This archive had no content."): Blob {
    if (!contentAdded) {
      addEntry("README.txt", strToU8(emptyFallback), false);
    }
    zip.end();
    if (zipError) throw zipError;
    return new Blob(chunks.map((c) => c.buffer as ArrayBuffer), { type: "application/zip" });
  }

  return { addEntry, finalize, hasContent: () => contentAdded };
}

interface DownloadFilesIntoZipOptions {
  docs: Array<{ name: string; file_id: string }>;
  accessToken: string | null;
  addEntry: StreamingZip["addEntry"];
  pathPrefix?: string;
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Download files with limited concurrency (3 workers) and stream each into the ZIP
 * as soon as it arrives. Abort errors propagate; other failures are skipped gracefully.
 *
 * The shared `nextIndex` counter is safe because JS is single-threaded — the
 * only yield points are `await` calls, and the post-increment + array access
 * is atomic within a single microtask.
 */
async function downloadFilesIntoZip(options: DownloadFilesIntoZipOptions): Promise<void> {
  const { docs, accessToken, addEntry, pathPrefix = "", signal, onProgress } = options;
  const totalFiles = docs.length;
  let filesDownloaded = 0;
  const usedNames = new Set<string>();
  let nextIndex = 0;

  onProgress?.(0, totalFiles);

  async function worker() {
    while (nextIndex < docs.length) {
      signal?.throwIfAborted();
      const doc = docs[nextIndex++];

      try {
        const buffer = await fetchFileContent(doc.file_id, accessToken, signal);
        const data = new Uint8Array(buffer);
        const filename = deduplicateFilename(doc.name, usedNames);
        const path = pathPrefix ? `${pathPrefix}/${filename}` : filename;
        addEntry(path, data, isCompressedFormat(filename));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
      }

      filesDownloaded++;
      onProgress?.(filesDownloaded, totalFiles);
    }
  }

  if (docs.length > 0) {
    await Promise.all(
      Array.from({ length: Math.min(3, docs.length) }, () => worker())
    );
  }
}

// ── Public API ──

export async function exportCollectionZip(options: ZipExportOptions): Promise<void> {
  const {
    collectionId, collectionName, companyName, onProgress, signal,
    includeCsv = true, includeTally = true, includeDocuments = true,
  } = options;
  const safeName = sanitizeFilename(collectionName);

  // Cache auth token once — avoids calling getAuthState() per file
  const { accessToken } = getAuthState();

  // Phase 1: Fetch all documents in the collection (needed if downloading files)
  let documents: Document[] = [];
  if (includeDocuments) {
    onProgress?.("Fetching document list...", 0, 0);
    signal?.throwIfAborted();

    documents = await fetchAllPaginated(
      ({ limit, offset }) => getDocuments({ limit, offset, collection_id: collectionId }),
      { signal }
    );
  }

  // Phase 2: Fetch CSV and Tally exports in parallel (only the ones requested)
  const csvPromise = includeCsv ? fetchCollectionCsvBlob(collectionId) : null;
  const tallyPromise = includeTally ? fetchCollectionTallyBlob(collectionId, companyName) : null;
  const exportCount = [csvPromise, tallyPromise].filter(Boolean).length;

  if (exportCount > 0) {
    onProgress?.("Generating exports...", 0, exportCount);
    signal?.throwIfAborted();
  }

  const [csvResult, tallyResult] = await Promise.allSettled([
    csvPromise ?? Promise.resolve(null),
    tallyPromise ?? Promise.resolve(null),
  ]);

  if (exportCount > 0) {
    onProgress?.("Generating exports...", exportCount, exportCount);
  }

  // ── Build streaming ZIP ──
  const sz = createStreamingZip();

  if (csvResult.status === "fulfilled" && csvResult.value) {
    sz.addEntry(`exports/${safeName}.csv`, new Uint8Array(await csvResult.value.arrayBuffer()), false);
  }
  if (tallyResult.status === "fulfilled" && tallyResult.value) {
    sz.addEntry(`exports/${safeName}.xml`, new Uint8Array(await tallyResult.value.arrayBuffer()), false);
  }

  // Phase 3: Download files and stream into ZIP
  if (includeDocuments) {
    const docsWithFiles = documents.filter((d: Document) => d.file_id);
    await downloadFilesIntoZip({
      docs: docsWithFiles,
      accessToken,
      addEntry: sz.addEntry,
      pathPrefix: "documents",
      signal,
      onProgress: (current, total) => onProgress?.("Downloading files...", current, total),
    });
  }

  // Finalize and trigger download
  onProgress?.("Preparing download...", 0, 0);
  const blob = sz.finalize("This collection had no exportable content.");
  triggerBlobDownload(blob, `${safeName}.zip`);
}

// ── Download Selected Documents as ZIP ──

export interface DownloadSelectedOptions {
  documents: Array<{ id: string; name: string; file_id: string }>;
  zipFilename?: string;
  onProgress?: (phase: string, current: number, total: number) => void;
  signal?: AbortSignal;
}

export async function downloadSelectedDocumentsZip(options: DownloadSelectedOptions): Promise<void> {
  const { documents, zipFilename = "selected-documents", onProgress, signal } = options;
  const safeName = sanitizeFilename(zipFilename);
  const { accessToken } = getAuthState();

  const sz = createStreamingZip();

  await downloadFilesIntoZip({
    docs: documents,
    accessToken,
    addEntry: sz.addEntry,
    signal,
    onProgress: (current, total) => onProgress?.("Downloading files...", current, total),
  });

  onProgress?.("Preparing download...", 0, 0);
  const blob = sz.finalize("No files could be downloaded.");
  triggerBlobDownload(blob, `${safeName}.zip`);
}
