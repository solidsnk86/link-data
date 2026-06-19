"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { PulseSignature } from "@/components/PulseSignature";
import { CopyLink } from "@/components/CopyLink";
import { createFileId } from "@/lib/ids";
import { formatSize } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

type Phase = "idle" | "uploading" | "done" | "error";

export default function TransferPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startUpload = useCallback(async (file: File) => {
    setPhase("uploading");
    setProgress(0);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const fileId = createFileId();
      await upload(`${fileId}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      const origin = window.location.origin;
      setShareUrl(`${origin}/d/${fileId}`);
      setPhase("done");
    } catch {
      setErrorMsg(
        "No pudimos subir el archivo. Revisa tu conexión e intenta otra vez."
      );
      setPhase("error");
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) startUpload(file);
  }

  function reset() {
    setPhase("idle");
    setProgress(0);
    setShareUrl("");
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 z-50">
     <Link href="/" className="font-display text-sm font-medium flex gap-2 items-center">
      <ArrowLeft size={16} />
         Volver
      </Link>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
        {phase === "idle" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex w-full cursor-pointer flex-col items-center border-2 border-dashed px-8 py-16 transition-colors ${
              dragOver
                ? "border-data bg-surface-2"
                : "border-border bg-surface"
            }`}
          >
            <PulseSignature variant="data" bars={7} height={40} />
            <p className="font-display mt-5 text-xl font-medium">
              Arrastra un archivo aquí
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">
              o haz clic para elegirlo
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) startUpload(file);
              }}
            />
          </div>
        )}

        {phase === "uploading" && (
          <div className="w-full">
            <p className="truncate font-mono text-sm text-foreground">
              {fileName}
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              {formatSize(fileSize)}
            </p>
            <div className="mt-5 h-2 w-full overflow-hidden bg-surface-2">
              <div
                className="h-full rounded-full bg-data transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
              subiendo… {Math.round(progress)}%
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="w-full">
            <p className="font-display text-xl font-medium">
              Listo. Aquí está tu link
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted">
              {fileName} · {formatSize(fileSize)}
            </p>
            <div className="mt-6">
              <CopyLink value={shareUrl} tone="data" />
            </div>
            <button
              onClick={reset}
              className="mt-8 border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-data hover:text-data"
            >
              Compartir otro archivo
            </button>
          </div>
        )}

        {phase === "error" && (
          <div>
            <p className="text-sm text-muted">{errorMsg}</p>
            <button
              onClick={reset}
              className="mt-6 bg-data px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
