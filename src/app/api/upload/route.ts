import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// This route never touches the file bytes — it only issues a short-lived
// token so the browser can upload directly to Blob storage. That keeps
// large files off of this serverless function entirely.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/webp",
            "application/pdf",
            "application/zip",
            "text/plain",
          ],
          addRandomSuffix: false,
          maximumSizeInBytes: 1 * 1024 * 1024 * 1024, // 1000MB per file
        };
      },
      onUploadCompleted: async () => {
        // No extra bookkeeping needed: the download page derives
        // filename/size directly from the blob by listing its prefix.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
