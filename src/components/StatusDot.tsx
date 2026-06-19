type Tone = "signal" | "data" | "success" | "muted";

const DOT_COLOR: Record<Tone, string> = {
  signal: "bg-signal",
  data: "bg-data",
  success: "bg-success",
  muted: "bg-muted",
};

export function StatusDot({
  label,
  tone = "muted",
  blink = false,
}: {
  label: string;
  tone?: Tone;
  blink?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
      <span
        className={`h-2 w-2 rounded-full ${DOT_COLOR[tone]} ${
          blink ? "blink-dot" : ""
        }`}
      />
      {label}
    </span>
  );
}
