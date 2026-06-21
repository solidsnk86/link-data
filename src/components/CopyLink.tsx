"use client";

import { Copy, CopyCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyLink({
  value,
  tone = "signal",
}: {
  value: string;
  tone?: "signal" | "data";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // clipboard API unavailable
    }
  }

  const ring =
    tone === "signal" ? "focus-visible:ring-signal" : "focus-visible:ring-data";

  return (
    <div className="flex w-full items-stretch gap-2">
      <div className="flex-1 overflow-x-auto border border-border bg-surface-2 px-2 py-2 font-mono text-sm text-foreground whitespace-nowrap">
        {value}
      </div>
      <button
        onClick={handleCopy}
        title="Copiar link"
        className={`shrink-0 px-2 py-2 font-mono text-xs uppercase tracking-widest transition-colors outline-none hover:bg-signal/75 group
           ${ring} ${
             tone === "signal"
               ? "bg-signal text-background hover:opacity-90"
               : "bg-data text-background hover:opacity-90"
           }`}
      >
        {copied ? (
          <CopyCheck
            id="copy-check"
            className="text-zinc-300 group-hover:text-zinc-200"
            size={24}
          />
        ) : (
          <Copy
            id="copy"
            className="text-zinc-300 group-hover:text-zinc-200"
            size={24}
          />
        )}
      </button>
    </div>
  );
}
