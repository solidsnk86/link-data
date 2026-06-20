import Link from "next/link";
import { PulseSignature } from "@/components/PulseSignature";

export default function Home() {
  return (
    <div className="grain flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10 z-50">
        <span className="font-display text-lg font-medium tracking-tight">
          LinkData
        </span>
        <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-muted">
          sin cuentas · sin registros
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <article className="flex flex-col justify-center z-50">
        <div className="grid grid-cols-5">
          {["", "l", "i", "n", "k", "d", "a", "t", "a"].map((letter, i) => (
            <div
              key={letter + i}
              className="flex justify-center bg-black first:bg-transparent p-6"
            >
              <h1 className="text-3xl md:text-7xl uppercase">{letter}</h1>
            </div>
          ))}
          <div className="flex justify-center bg-pink-200 first:bg-transparent">
            <div className="w-full h-full grid content-center justify-center bg-black md:translate-x-4 md:-translate-y-4 translate-x-2.5 -translate-y-2.5">
              <PulseSignature variant="white" bars={6} />
            </div>
          </div>
        </div>
        <div className="bg-red-500 px-16 w-full">
          <p className="md:text-lg text-base uppercase font-light italic text-black tracking-[0.2em]">
            Manda lo que sea a quien sea
          </p>
        </div>
      </article> 

        <p className="mt-5 max-w-3xl text-sm text-muted sm:text-base z-50">
          Transmite tu cámara en vivo o comparte un archivo con un link. Todo
          corre directo entre navegadores — nada se queda guardado en un
          servidor intermedio.
        </p>

        <div className="mt-14 grid w-full max-w-3xl gap-5 sm:grid-cols-2 z-50">
          <ChannelCard
            channel="CH.01"
            tone="signal"
            title="Transmitir en vivo"
            description="Comparte tu cámara en tiempo real con un link. Tus invitados se conectan al instante, sin instalar nada."
            href="/stream"
            cta="Iniciar transmisión"
          />
          <ChannelCard
            channel="CH.02"
            tone="data"
            title="Compartir archivo"
            description="Sube un archivo y obtén un link de descarga al momento. Como mandar un paquete con una guía de rastreo."
            href="/transfer"
            cta="Subir archivo"
          />
        </div>
      </main>

      <footer className="px-6 py-8 text-center font-mono text-xs text-muted sm:px-10 z-50">
        Construido con 🧡 por{" "}
        <Link
          href={"https://github.com/solidsnk86/"}
          target="_blank"
          className="hover:underline hover:text-signal"
        >
          @solidSnk86
        </Link>{" "}
        y WebRTC — el video nunca pasa por un servidor
      </footer>
    </div>
  );
}

function ChannelCard({
  channel,
  tone,
  title,
  description,
  href,
  cta,
}: {
  channel: string;
  tone: "signal" | "data";
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  const accent = tone === "signal" ? "text-signal" : "text-data";
  const accentBg = tone === "signal" ? "bg-signal" : "bg-data";

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-start border border-border bg-surface p-7 text-left transition-colors hover:border-foreground/20"
    >
      <span className={`font-mono text-xs uppercase tracking-widest ${accent}`}>
        {channel}
      </span>
      <h2 className="font-display mt-3 text-2xl font-medium tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      <span
        className={`mt-6 inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest text-background ${accentBg} transition-transform`}
      >
        {cta} →
      </span>
    </Link>
  );
}
