import { list } from "@vercel/blob";
import Link from "next/link";
import { formatSize } from "@/lib/format";
import { ArrowLeft, FileBox } from "lucide-react";
import { ClientDownload } from "./ClientDownload";

export const dynamic = "force-dynamic";

async function getFile(fileId: string) {
  const { blobs } = await list({ prefix: `${fileId}/`, limit: 1 });
  const blob = blobs[0];
  if (!blob) return null;
  return {
    url: blob.downloadUrl,
    filename: blob.pathname.slice(fileId.length + 1),
    size: blob.size,
  };
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const file = await getFile(fileId);

  return (
    <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 z-50">
      <Link href="/" className="font-display text-sm font-medium flex gap-2 items-center">
      <ArrowLeft size={16} />
         Volver
      </Link>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        {!file ? (
          <>
            <h1 className="font-display text-2xl font-medium">
              Este link ya no existe
            </h1>
            <p className="mt-2 text-sm text-muted">
              El archivo pudo haber sido eliminado o el link está mal escrito.
            </p>
          </>
        ) : (
          <>
            <FileBox size={56} />
            <p className="font-display mt-5 max-w-full truncate text-lg font-medium">
              {file.filename}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              {formatSize(file.size)}
            </p>
            <ClientDownload fileId={fileId} fileUrl={file.url} />
            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted/60">
              id de señal: {fileId}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
