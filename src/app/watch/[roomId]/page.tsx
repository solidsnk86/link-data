"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Peer as PeerType } from "peerjs";
import Link from "next/link";
import { PulseSignature } from "@/components/PulseSignature";
import { StatusDot } from "@/components/StatusDot";
import { ArrowLeft } from "lucide-react";

type Status = "connecting" | "live" | "ended" | "not-found" | "error";

export default function WatchPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = (params?.roomId ?? "").toString().toUpperCase();

  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<PeerType | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [paused, setPaused] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function start() {
      const { Peer } = await import("peerjs");
      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", () => {
        if (cancelled) return;
        // open a data connection just to signal our presence — the
        // broadcaster listens for this and calls us back with media
        const conn = peer.connect(roomId);

        timeoutId = setTimeout(() => {
          if (!cancelled && status !== "live") setStatus("not-found");
        }, 8000);

        conn.on("error", () => {
          if (!cancelled) setStatus("not-found");
        });
      });

      peer.on("call", (call) => {
        clearTimeout(timeoutId);
        call.answer();

        call.on("stream", (remoteStream) => {
          setStream(remoteStream);
          setStatus("live");
        });

        call.on("close", () => {
          if (!cancelled) setStatus("ended");
        });
      });

      peer.on("error", (err: { type?: string }) => {
        if (cancelled) return;
        if (err.type === "peer-unavailable") {
          setStatus("not-found");
        } else {
          setStatus("error");
        }
      });
    }

    start();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      peerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const video = videoRef.current;

    video.srcObject = stream;
  }, [stream]);

  return (
    <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 z-50">
      <Link href="/" className="font-display text-sm font-medium flex gap-2 items-center">
      <ArrowLeft size={16} />
         Volver
      </Link>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
        {status === "connecting" && (
          <>
            <PulseSignature variant="signal" bars={7} height={44} />
            <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted">
              conectando a la señal {roomId}…
            </p>
          </>
        )}

        {status === "not-found" && (
          <>
            <StatusDot label="sin señal" tone="muted" />
            <h1 className="font-display mt-4 text-2xl font-medium">
              No encontramos esta transmisión
            </h1>
            <p className="mt-2 text-sm text-muted">
              Puede que haya terminado o que el link esté mal escrito.
            </p>
          </>
        )}

        {status === "ended" && (
          <>
            <PulseSignature variant="muted" bars={5} height={36} />
            <h1 className="font-display mt-5 text-2xl font-medium">
              La transmisión terminó
            </h1>
          </>
        )}

        {status === "error" && (
          <>
            <StatusDot label="error" tone="muted" />
            <p className="mt-4 text-sm text-muted">
              Hubo un problema de conexión. Intenta abrir el link de nuevo.
            </p>
          </>
        )}

        {status === "live" && (
          <>
            <div className="mb-4 self-start">
              <StatusDot label="en vivo" tone="signal" blink />
            </div>
            <div className="aspect-video w-full overflow-hidden border border-border bg-surface relative">
              {paused && (
                <div className="absolute top-1/2 left-1/2 translate-[-50%] cursor-pointer">
                  <div
                    className="flex justify-center mx-auto w-10 h-10 bg-signal/50 border border-signal backdrop-blur-md rounded-full py-1 hover:outline-2 hover:outline-amber-800 hover:outline-offset-3"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                        setPaused(false);
                      }
                    }}
                  >
                    <div className="rotate-90 text-xl translate-x-0.5">🔺</div>
                  </div>
                  <small className="">Iniciar transmisión</small>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
