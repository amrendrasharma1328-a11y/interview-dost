import Link from "next/link";
import Greeting from "@/components/dashboard/Greeting";
import Icon from "@/components/ui/Icon";
import SignalBar from "@/components/ui/SignalBar";
import Notice, { EmptyState } from "@/components/ui/Notice";
import { getOverview, summarize } from "@/lib/db/stats";
import { SIGNAL_LABELS } from "@/lib/constants";
import { setupHref } from "@/lib/practice/catalog";

export const dynamic = "force-dynamic";

const TIP = {
  title: "Lead with the point, not the backstory.",
  body: "Start with your answer in one sentence, then add the example that proves it.",
  focus: "Explain a decision you made on a project. Start with the outcome, then the reasoning.",
};

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default async function Home() {
  const { sessions, inProgress, dbError } = await getOverview();
  const last = sessions[0];
  const sum = summarize(sessions);
  const weakest = sum.weak[0];

  return (
    <div className="space-y-6">
      <header>
        <Greeting />
        <p className="mt-1 text-slate-400">Practice smarter. Walk into your next interview with clarity.</p>
      </header>

      {dbError && (
        <Notice title="Your database isn't ready yet." hint="Run `npx prisma migrate dev --name init` in the project folder, then reload. Practice and Library still work." />
      )}

      <section className="card relative overflow-hidden p-6 md:p-8" aria-labelledby="hero">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <p className="label">Your next interview</p>
        <h2 id="hero" className="mt-2 text-2xl font-semibold text-slate-50 md:text-3xl">Your next interview starts here.</h2>
        <dl className="mt-5 grid max-w-xl grid-cols-3 gap-4 text-sm">
          <div><dt className="label">Target role</dt><dd className="mt-1 text-slate-200">{inProgress?.role || last?.role || "Not set yet"}</dd></div>
          <div><dt className="label">Interview type</dt><dd className="mt-1 capitalize text-slate-200">{inProgress?.type || last?.interviewType || "—"}</dd></div>
          <div><dt className="label">{inProgress ? "In progress" : "Last session"}</dt>
            <dd className="mt-1 text-slate-200">{inProgress ? `Question ${inProgress.q}/${inProgress.total}` : last ? `${sum.overall(last).toFixed(1)}/10 signal` : "None yet"}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {inProgress && <Link href={`/interview/${inProgress.id}`} className="btn-coral">Resume interview <Icon name="arrow" size={16} /></Link>}
          <Link href="/practice" className={inProgress ? "btn-ghost" : "btn-primary"}>Start Practice <Icon name="arrow" size={16} /></Link>
          <Link href="/practice/setup" className="btn-ghost">Customize Session</Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5" aria-labelledby="tip">
          <p className="label">Today&apos;s coaching note · general tip</p>
          <h3 id="tip" className="mt-2 text-lg font-semibold text-slate-100">{TIP.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{TIP.body}</p>
          <Link href={setupHref({ interviewType: "behavioral", experience: "intermediate", style: "realistic", lengthMinutes: 5, focus: TIP.focus })} className="btn-ghost mt-4">Practice this</Link>
        </section>

        <section className="card p-5" aria-labelledby="ready">
          <h3 id="ready" className="font-semibold text-slate-100">Interview readiness</h3>
          {last ? (
            <div className="mt-4 space-y-3">
              <SignalBar label="Technical understanding" value={last.signals.technicalUnderstanding} />
              <SignalBar label="Communication" value={last.signals.communication} tone="accent" />
              <SignalBar label="Answer structure" value={last.signals.answerStructure} />
              <p className="text-xs text-slate-500">From your latest session{last.mode === "demo" ? " (Demo Mode)" : ""}. Practice signals, not measurements.</p>
            </div>
          ) : (
            <div className="mt-3"><EmptyState title="No signals yet" body="Finish one interview and your readiness shows up here." /></div>
          )}
        </section>

        <section className="card p-5" aria-labelledby="weak">
          <h3 id="weak" className="font-semibold text-slate-100">Weakest area</h3>
          {weakest ? (
            <>
              <p className="mt-2 text-slate-200 capitalize">{weakest.area}</p>
              <p className="text-sm text-slate-500">Came up in {weakest.n} of {sessions.length} session{sessions.length > 1 ? "s" : ""}.</p>
              <Link href={setupHref({ interviewType: "mixed", experience: "intermediate", style: "realistic", lengthMinutes: 5, focus: `Give me a focused answer that shows stronger ${weakest.area}.` })} className="btn-ghost mt-4">Practice weak area</Link>
            </>
          ) : (
            <div className="mt-3"><EmptyState title="Nothing detected yet" body="Your interviewer spots weak areas as you answer." /></div>
          )}
        </section>

        <section className="card p-5" aria-labelledby="recent">
          <h3 id="recent" className="font-semibold text-slate-100">Recent sessions</h3>
          {sessions.length ? (
            <ul className="mt-3 divide-y divide-line">
              {sessions.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <Link href={`/results/${s.id}`} className="flex items-start justify-between gap-3 py-2 text-sm hover:text-brand-soft">
                    <span><span className="text-slate-200">{s.role}</span><br /><span className="text-xs capitalize text-slate-500">{s.interviewType}{s.topImprovement ? ` · work on: ${s.topImprovement}` : ""}</span></span>
                    <span className="shrink-0 text-xs text-slate-500">{fmt(s.completedAt)}{s.mode === "demo" ? " · Demo" : ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><EmptyState title="No sessions yet" body="Your first session will appear here."><Link href="/practice/setup" className="text-sm text-brand-soft">Start your first interview →</Link></EmptyState></div>
          )}
        </section>
      </div>
    </div>
  );
}
