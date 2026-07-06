// ASCII progress bar: [██████████░░░░░░░░░░] 50%
export function AsciiProgress({
  percent,
  width = 24,
  tone = "green",
}: {
  percent: number;
  width?: number;
  tone?: "green" | "amber" | "cyan";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = Math.round((clamped / 100) * width);
  const toneClass =
    tone === "amber"
      ? "text-amber-term term-glow-amber"
      : tone === "cyan"
        ? "text-cyan-term term-glow-cyan"
        : "text-phosphor-400 term-glow";

  return (
    <span className={`whitespace-nowrap font-bold ${toneClass}`}>
      [{"█".repeat(filled)}
      <span className="opacity-30">{"░".repeat(width - filled)}</span>] {clamped}%
    </span>
  );
}
