import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const { blobs } = await list({ prefix: `${fileId}/`, limit: 1 });
  const blob = blobs[0];

  if (!blob) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const filename = blob.pathname.slice(fileId.length + 1);

  return NextResponse.json({
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    filename,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { blobs } = await list({ prefix: `${fileId}/`, limit: 1 });
  const blob = blobs[0];
  if (!blob) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  const { del } = await import("@vercel/blob");
  await del(blob.url);
  return NextResponse.json({ deleted: true });
}
