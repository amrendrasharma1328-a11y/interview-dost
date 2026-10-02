import Icon from "./Icon";

export default function Notice({ title, hint, children, tone = "warn" }) {
  const c = tone === "warn" ? "border-amber-500/30 bg-amber-500/5 text-amber-200" : "border-line bg-surface text-slate-300";
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border p-4 ${c}`}>
      <Icon name="alert" className="mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        {hint && <p className="mt-1 opacity-80">{hint}</p>}
        {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title, body, children }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-5 text-sm">
      <p className="font-medium text-slate-200">{title}</p>
      {body && <p className="mt-1 text-slate-500">{body}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
