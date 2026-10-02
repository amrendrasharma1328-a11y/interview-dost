import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SignalBar from "@/components/ui/SignalBar";
import Notice from "@/components/ui/Notice";
import AdaptiveTimeline from "@/components/results/AdaptiveTimeline";
import { loadResults } from "@/lib/db/sessions";
import { SIGNAL_LABELS } from "@/lib/constants";
import { setupHref, nearestLength } from "@/lib/practice/catalog";

export const dynamic = "force-dynamic";

export default async function ResultsPage({ params }) {
  let data = null;
  let failed = false;
  try { data = await loadResults(params.id); } catch (e) { console.error(e); failed = true; }

  if (failed) return <Notice title="We couldn't load these results." hint="The database may not be ready. Run `npx prisma migrate dev`, then reload." />;
  if (!data) return <Notice title="We couldn't find that session." hint="Start a new one from Practice."><Link href="/practice" className="btn-ghost">Go to Practice</Link></Notice>;
  if (!data.report) {
    return <Notice title="This interview isn't finished yet." hint="Finish it to see your report."><Link href={`/interview/${params.id}`} className="btn-primary">Continue interview</Link></Notice>;
  }

  const { state, report } = data;
  const base = { interviewType: state.interviewType, experience: state.experience, style: state.style };
  const drillHref = (d) => setupHref({ ...base, lengthMinutes: nearestLength(d.minutes), focus: d.prompt });

  return (
    <div className="space-y-10">
      <header>
        {state.mode === "demo" && <span className="chip mb-3 border-amber-500/30 text-amber-200">Demo Mode · scripted responses, not live AI</span>}
        <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">Interview complete.</h1>
        <p className="mt-1 text-slate-400">Here&apos;s what your interviewer noticed.</p>
      </header>

      <section className="card p-6" aria-labelledby="sig">
        <h2 id="sig" className="font-semibold text-slate-100">Practice signals</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(SIGNAL_LABELS).map(([k, label], i) => <SignalBar key={k} label={label} value={report.signals[k]} tone={i % 2 ? "accent" : "brand"} />)}
        </div>
        <p className="mt-4 text-xs text-slate-500">{report.disclaimer}</p>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="mb-3 text-lg font-semibold text-slate-100">How the interview adapted</h2>
        <AdaptiveTimeline history={state.conversationHistory} />
      </section>

      <section aria-labelledby="imp">
        <h2 id="imp" className="mb-3 text-lg font-semibold text-slate-100">Where you can improve</h2>
        {report.improvements.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {report.improvements.map((m) => (
              <li key={m.title} className="card p-5">
                <h3 className="font-semibold capitalize text-slate-100">{m.title}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="label">What happened</dt><dd className="mt-0.5 text-slate-300">{m.whatHappened}</dd></div>
                  <div><dt className="label">Why it matters</dt><dd className="mt-0.5 text-slate-300">{m.whyItMatters}</dd></div>
                  <div><dt className="label">How to improve</dt><dd className="mt-0.5 text-slate-300">{m.howToImprove}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">No clear weak areas this time. Try a harder session.</p>}
      </section>

      <section aria-labelledby="well">
        <h2 id="well" className="mb-3 text-lg font-semibold text-slate-100">What worked well</h2>
        {report.strongMoments.length ? (
          <ul className="space-y-2">
            {report.strongMoments.map((s) => <li key={s} className="flex gap-2 text-sm text-slate-300"><Icon name="check" className="mt-0.5 shrink-0 text-accent" size={16} />{s}</li>)}
          </ul>
        ) : <p className="text-sm text-slate-500">No standout moments yet. Specific, reasoned answers will show up here.</p>}
      </section>

      <section aria-labelledby="drills">
        <h2 id="drills" className="mb-3 text-lg font-semibold text-slate-100">Your next {report.drills.length} drill{report.drills.length > 1 ? "s" : ""}</h2>
        <ol className="space-y-3">
          {report.drills.map((d, i) => (
            <li key={d.title} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-medium text-slate-100">{i + 1}. {d.title} <span className="ml-2 text-xs font-normal text-slate-500">{d.minutes} min</span></p>
                <p className="mt-1 text-sm text-slate-400">{d.prompt}</p>
                <span className="chip mt-2 border-amber-500/30 capitalize text-amber-200">Targets: {d.weakArea}</span>
              </div>
              <Link href={drillHref(d)} className="btn-ghost">Start drill</Link>
            </li>
          ))}
        </ol>
        <Link href={drillHref(report.drills[0])} className="btn-primary mt-5">Practice these weaknesses <Icon name="arrow" size={16} /></Link>
      </section>
    </div>
  );
}
