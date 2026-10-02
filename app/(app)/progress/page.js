import Link from "next/link";
import SignalBar from "@/components/ui/SignalBar";
import Notice, { EmptyState } from "@/components/ui/Notice";
import { getOverview, summarize } from "@/lib/db/stats";
import { SIGNAL_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Progress · Interview Dost" };

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default async function ProgressPage() {
  const { sessions, dbError } = await getOverview();
  const sum = summarize(sessions);
  const chrono = [...sessions].reverse();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">Progress</h1>
        <p className="mt-1 text-slate-400">Only real, completed sessions are counted.</p>
      </header>

      {dbError && <Notice title="Your database isn't ready yet." hint="Run `npx prisma migrate dev --name init`, then reload." />}

      {!sessions.length ? (
        <EmptyState title="No interview sessions yet." body="Your first session will appear here.">
          <Link href="/practice/setup" className="btn-primary">Start your first interview →</Link>
        </EmptyState>
      ) : (
        <>
          {sum.hasDemo && <p className="text-xs text-amber-200/80">Includes Demo Mode sessions (scripted, not live AI).</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5"><p className="label">Sessions</p><p className="mt-2 text-3xl font-semibold text-slate-50">{sessions.length}</p></div>
            <div className="card p-5"><p className="label">Practice streak</p><p className="mt-2 text-3xl font-semibold text-slate-50">{sum.streak} day{sum.streak === 1 ? "" : "s"}</p></div>
            <div className="card p-5"><p className="label">Strongest area</p><p className="mt-2 text-lg font-semibold text-slate-50">{SIGNAL_LABELS[sum.strongest]}</p></div>
          </div>

          <section className="card p-6" aria-labelledby="avg">
            <h2 id="avg" className="font-semibold text-slate-100">Average practice signals</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Object.entries(SIGNAL_LABELS).map(([k, label], i) => <SignalBar key={k} label={label} value={sum.avg[k]} tone={i % 2 ? "accent" : "brand"} />)}
            </div>
            <p className="mt-4 text-xs text-slate-500">Practice signals, not scientific measurements.</p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="card p-6" aria-labelledby="trend">
              <h2 id="trend" className="font-semibold text-slate-100">Improvement trend</h2>
              {chrono.length < 2 ? <p className="mt-3 text-sm text-slate-500">Complete one more session to see a trend.</p> : (
                <ol className="mt-4 flex h-28 items-end gap-2" aria-label="Overall signal per session, oldest to newest">
                  {chrono.slice(-10).map((s) => (
                    <li key={s.id} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full rounded-t bg-brand" style={{ height: `${sum.overall(s) * 10}%` }} title={`${sum.overall(s).toFixed(1)}/10`} />
                      <span className="text-[10px] text-slate-600">{fmt(s.completedAt)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <section className="card p-6" aria-labelledby="rec">
              <h2 id="rec" className="font-semibold text-slate-100">Recurring weak areas</h2>
              {sum.weak.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {sum.weak.slice(0, 5).map((w) => <li key={w.area} className="flex justify-between"><span className="capitalize text-slate-300">{w.area}</span><span className="text-slate-500">{w.n} of {sessions.length}</span></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-500">None detected yet.</p>}
            </section>
          </div>

          <section aria-labelledby="hist">
            <h2 id="hist" className="mb-3 font-semibold text-slate-100">Session history</h2>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={`/results/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-white/5">
                    <span><span className="text-slate-200">{s.role}</span> <span className="text-xs capitalize text-slate-500">· {s.interviewType}{s.mode === "demo" ? " · Demo" : ""}</span></span>
                    <span className="text-xs text-slate-500">{sum.overall(s).toFixed(1)}/10 · {fmt(s.completedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
