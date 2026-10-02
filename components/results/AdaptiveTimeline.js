import Icon from "@/components/ui/Icon";
import { ACTION_TEXT } from "@/lib/constants";

// Shows WHY the interview went where it did: this is the "adaptive" proof.
export default function AdaptiveTimeline({ history }) {
  return (
    <ol className="space-y-3">
      {history.map((t, i) => (
        <li key={i} className="card p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Q{i + 1}</span>
            {t.isFollowUp && <span className="chip border-accent/40 text-accent">Follow-up</span>}
            <span className="chip capitalize">{t.difficulty}</span>
          </div>
          <p className="mt-2 text-sm text-slate-100">{t.question}</p>
          <p className="mt-2 text-sm text-slate-400">{t.evaluation.feedback}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {t.evaluation.weakAreas.map((w) => <span key={w} className="chip border-amber-500/30 text-amber-200">{w}</span>)}
            <span className="chip border-brand/40 text-brand-soft"><Icon name="arrow" size={12} className="mr-1" />{ACTION_TEXT[t.evaluation.nextAction] || "Next"}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
