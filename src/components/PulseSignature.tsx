type Variant = "signal" | "data" | "spectrum" | "muted" | "white";

const COLORS: Record<Variant, string[]> = {
  signal: ["var(--signal)"],
  data: ["var(--data)"],
  muted: ["var(--muted)"],
  white: ["#fff"],
   spectrum: [
    "var(--spectrum-1)",
    "var(--spectrum-2)",
    "var(--spectrum-3)",
    "var(--spectrum-4)",
    "var(--spectrum-5)",
    "var(--spectrum-6)",
    "var(--spectrum-7)",
    "var(--spectrum-8)",
    "var(--spectrum-9)",
    "var(--spectrum-10)",
    "var(--spectrum-11)",
    "var(--spectrum-12)",
    "var(--spectrum-13)",
    "var(--spectrum-14)",
    "var(--spectrum-15)",
    "var(--spectrum-16)",
    "var(--spectrum-17)",
    "var(--spectrum-18)",
  ],
};

const HEIGHTS = [0.35, 0.6, 0.9, 0.5, 1, 0.4, 0.75, 1, 0.45, 0.65, 0.3];

export function PulseSignature({
  variant = "spectrum",
  bars = 11,
  height = 56,
  className = "",
}: {
  variant?: Variant;
  bars?: number;
  height?: number;
  className?: string;
}) {
  const colors = COLORS[variant];
  const items = Array.from({ length: bars }, (_, i) => i);

  return (
    <div
      className={`flex items-center justify-center gap-[5px] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {items.map((i) => {
        const h = HEIGHTS[i % HEIGHTS.length];
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="pulse-bar inline-block w-[5px] rounded-full"
            style={{
              height: `${Math.round(h * height)}px`,
              background: color,
              animationDelay: `${(i % 7) * 0.9}s`,
            }}
          />
        );
      })}
    </div>
  );
}
