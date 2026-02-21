import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for file downloads.
 *
 * Presigned S3 URLs can't be fetched from the browser via fetch() due to CORS.
 * This route handler fetches the file server-side and streams it back to the client.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

  // Step 1: Get presigned URL from backend
  const metaResponse = await fetch(`${backendUrl}/api/v1/files/${id}`, {
    headers: { Authorization: authHeader },
  });

  if (!metaResponse.ok) {
    return NextResponse.json(
      { error: "Failed to get file metadata" },
      { status: metaResponse.status }
    );
  }

  const metaData = await metaResponse.json();
  const downloadUrl = metaData.data?.download_url;

  if (!downloadUrl) {
    return NextResponse.json(
      { error: "No download URL available" },
      { status: 404 }
    );
  }

  // Step 2: Fetch file from S3 and stream the response back
  const fileResponse = await fetch(downloadUrl);

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch file from storage" },
      { status: fileResponse.status }
    );
  }

  const contentType =
    fileResponse.headers.get("content-type") || "application/octet-stream";
  const contentLength = fileResponse.headers.get("content-length");

  const headers: Record<string, string> = { "Content-Type": contentType };
  if (contentLength) headers["Content-Length"] = contentLength;

  // Stream the body directly — avoids buffering entire file in memory
  return new NextResponse(fileResponse.body, { headers });
}
