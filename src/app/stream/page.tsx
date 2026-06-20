"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Peer as PeerType, MediaConnection, DataConnection } from "peerjs";
import Link from "next/link";
import { PulseSignature } from "@/components/PulseSignature";
import { StatusDot } from "@/components/StatusDot";
import { CopyLink } from "@/components/CopyLink";
import { createRoomCode } from "@/lib/ids";
import { ArrowLeft, ScreenShare, Share2, SwitchCamera } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { share } from "@/lib/share";

type Status = "requesting-camera" | "connecting" | "live" | "ended" | "error";
type FacingMode = "user" | "environment";
type Device = "phone" | "desktop";
type UserSystem =
  | "Windows"
  | "Linux"
  | "macOs"
  | "Android"
  | "iOS"
  | "No Disponible";

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<PeerType | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const viewerCallsRef = useRef<Map<string, MediaConnection>>(new Map());
  const { data: location } = useLocation();
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<Status>("requesting-camera");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // --- estado para cambio de cámara ---
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [switchingCamera, setSwitchingCamera] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const [sharingWindow, setSharingWindow] = useState(false);

  const cleanup = useCallback(() => {
    viewerCallsRef.current.forEach((call) => call.close());
    viewerCallsRef.current.clear();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
  }, []);

  const userSystem: UserSystem = location.sysInfo.system as UserSystem;
  if (userSystem === "Android" || userSystem === "iOS") {
    setDevice("phone");
  }

  // --- se revisa cuántas cámaras hay disponibles ---
  useEffect(() => {
    if (status !== "live" && status !== "connecting") return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const cams = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(cams.length > 1);
      })
      .catch(() => setHasMultipleCameras(false));
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        setStatus("connecting");

        const { Peer } = await import("peerjs");
        const code = createRoomCode();
        const peer = new Peer(code);
        peerRef.current = peer;

        peer.on("open", () => {
          if (cancelled) return;
          setRoomCode(code);
          setStatus("live");
        });

        peer.on("connection", (conn: DataConnection) => {
          conn.on("open", () => {
            // usamos streamRef.current en vez de "stream" para que viewers
            // que se conectan después del switch reciban la cámara actual
            const call = peer.call(conn.peer, streamRef.current!);

            viewerCallsRef.current.set(conn.peer, call);
            setViewerCount(viewerCallsRef.current.size);

            const remove = () => {
              viewerCallsRef.current.delete(conn.peer);
              setViewerCount(viewerCallsRef.current.size);
            };
            call.on("close", remove);
            conn.on("close", remove);
          });
        });

        peer.on("error", (err: { type?: string }) => {
          if (cancelled) return;
          if (err.type === "unavailable-id") {
            peer.destroy();
            start();
            return;
          }
          setErrorMsg(
            "Hubo un problema con la conexión. Revisa tu red e intenta de nuevo.",
          );
          setStatus("error");
        });
      } catch {
        if (cancelled) return;
        setErrorMsg(
          "No pudimos acceder a tu cámara. Revisa los permisos del navegador.",
        );
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanup]);

  // --- cambio de cámara si es móvil ---
  const switchCamera = useCallback(async () => {
    if (!streamRef.current || switchingCamera) return;
    setSwitchingCamera(true);
    const nextFacing: FacingMode =
      facingMode === "user" ? "environment" : "user";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: nextFacing } },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      const oldTrack = streamRef.current.getVideoTracks()[0];

      // Reemplaza el track en cada conexión activa sin renegociar
      viewerCallsRef.current.forEach((call) => {
        const sender = call.peerConnection
          ?.getSenders()
          .find((s) => s.track?.kind === "video");
        sender?.replaceTrack(newTrack); // reemplazo de la pista
      });

      // Actualiza el stream local (mismo objeto, así el <video> y
      // las llamadas futuras quedan sincronizadas automáticamente)
      streamRef.current.removeTrack(oldTrack);
      streamRef.current.addTrack(newTrack);
      oldTrack.stop();

      setFacingMode(nextFacing);
    } catch (err) {
      console.error("No se pudo cambiar de cámara:", err);
    } finally {
      setSwitchingCamera(false);
    }
  }, [facingMode, switchingCamera]);

  // --- opción para compartir pantalla
  const switchShareWindowsMedia = useCallback(async () => {
    if (!streamRef.current || sharingWindow) return;

    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const newTrack = newStream.getVideoTracks()[0];
      const oldTrack = streamRef.current.getVideoTracks()[0];

      viewerCallsRef.current.forEach((call) => {
        const sender = call.peerConnection
          ?.getSenders()
          .find((s) => s.track?.kind === "video");

        sender?.replaceTrack(newTrack);
      });

      cameraTrackRef.current = oldTrack;
      streamRef.current.removeTrack(oldTrack);
      streamRef.current.addTrack(newTrack);
      setSharingWindow(true);

      newTrack.onended = () => {
        const cameraTrack = cameraTrackRef.current;

        if (!cameraTrack) return;

        viewerCallsRef.current.forEach((call) => {
          const sender = call.peerConnection
            ?.getSenders()
            .find((s) => s.track?.kind === "video");

          sender?.replaceTrack(cameraTrack);
        });

        setSharingWindow(false);
        streamRef.current?.removeTrack(newTrack);
        streamRef.current?.addTrack(cameraTrack);
      };
    } catch (error) {
      console.error("No se pudo compartir la pantalla", error);
    }
  }, [sharingWindow]);

  function endStream() {
    cleanup();
    setStatus("ended");
  }

  const watchUrl =
    roomCode && typeof window !== "undefined"
      ? `${window.location.origin}/watch/${roomCode}`
      : "";

  return (
    <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 z-50">
      <Link
        href="/"
        className="font-display text-sm font-medium flex gap-2 items-center"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center z-50">
        {status === "error" ? (
          <>
            <StatusDot label="error" tone="muted" />
            <p className="mt-4 max-w-sm text-sm text-muted">{errorMsg}</p>
          </>
        ) : status === "ended" ? (
          <>
            <PulseSignature variant="muted" bars={5} height={36} />
            <h1 className="font-display mt-5 text-2xl font-medium">
              Transmisión finalizada
            </h1>
            <p className="mt-2 text-sm text-muted">
              El link ya no funciona. Inicia una nueva transmisión cuando
              quieras.
            </p>
            <Link
              href="/stream"
              className="mt-6 bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background relative"
            >
              Transmitir de nuevo
            </Link>
          </>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-4">
              {status === "live" ? (
                <StatusDot label="en vivo" tone="signal" blink />
              ) : (
                <StatusDot
                  label={
                    status === "requesting-camera"
                      ? "pidiendo permiso de cámara"
                      : "conectando"
                  }
                  tone="muted"
                />
              )}
              {status === "live" && (
                <StatusDot label={`${viewerCount} viendo`} tone="data" />
              )}
            </div>

            <div className="relative aspect-video w-full overflow-hidden border border-border bg-surface">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls
                className="h-full w-full object-cover"
              />

              {/* --- botón de cambio de cámara --- */}
              {hasMultipleCameras &&
                device !== "desktop" &&
                (status === "live" || status === "connecting") && (
                  <button
                    onClick={switchCamera}
                    disabled={switchingCamera}
                    className="absolute bottom-3 right-3 flex gap-2 items-center border border-border bg-background/80 px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted backdrop-blur transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
                  >
                    <SwitchCamera size={16} />
                    {switchingCamera ? "cambiando…" : "cambiar cámara"}
                  </button>
                )}
            </div>

            {status === "live" && watchUrl && (
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-left font-mono text-xs uppercase tracking-widest text-muted">
                    comparte este link para que te vean
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={async () => await share(watchUrl)}
                      title="Comparte este link"
                      className="flex gap-2 items-center border group border-border bg-background/80 w-10 justify-center py-2 font-mono text-xs uppercase tracking-widest text-muted backdrop-blur transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
                    >
                      <Share2
                        size={16}
                        className="text-muted group-hover:text-signal"
                      />
                    </button>
                    {/* --- botón para transmitir pantalla --- */}
                    {!sharingWindow && (
                      <button
                        onClick={switchShareWindowsMedia}
                        disabled={sharingWindow}
                        title="Compartir pantalla"
                        className="flex gap-2 items-center border border-border bg-background/80 w-10 justify-center py-2 font-mono text-xs uppercase tracking-widest text-muted backdrop-blur transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
                      >
                        <ScreenShare size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <CopyLink value={watchUrl} tone="signal" />
              </div>
            )}

            <button
              onClick={endStream}
              className="mt-8 border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-signal hover:text-signal"
            >
              Finalizar transmisión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
