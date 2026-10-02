export default function SignalBar({ label, value, tone = "brand" }) {
  const v = Math.max(0, Math.min(10, Number(value) || 0));
  const color = tone === "accent" ? "bg-accent" : "bg-brand";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="tabular-nums text-slate-400">{v.toFixed(1)}/10</span>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={10} aria-valuenow={v}
        className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${v * 10}%` }} />
      </div>
    </div>
  );
}
