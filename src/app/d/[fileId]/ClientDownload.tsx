"use client";

async function deleteFileAfterDownload(fileId: string) {
  await fetch(`/api/file/${fileId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => console.log(err));
}

export const ClientDownload = ({
  fileId,
  fileUrl,
}: {
  fileId: string;
  fileUrl: string;
}) => {
  return (
    <a
      href={fileUrl}
      download
      onClick={async () => await deleteFileAfterDownload(fileId)}
      className="mt-8 inline-flex items-center gap-2 bg-data px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-90"
    >
      Descargar archivo
    </a>
  );
};
