"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import SignalBar from "@/components/ui/SignalBar";
import { ACTION_TEXT } from "@/lib/constants";

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function InterviewerRead({ turn }) {
  const { evaluation: ev, adaptation: ad } = turn;
  return (
    <section aria-live="polite" className="card border-accent/30 p-5">
      <p className="label text-accent">What your interviewer noticed</p>
      <p className="mt-2 text-slate-100">{ev.feedback}</p>
      {ev.weakAreas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ev.weakAreas.map((w) => <span key={w} className="chip border-amber-500/30 text-amber-200">Missing: {w}</span>)}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="chip border-brand/40 text-brand-soft">{ACTION_TEXT[ad.action] || "Next question"}</span>
        {ad.changed && (
          <span className="chip border-accent/40 text-accent">
            <Icon name={ad.changed === "up" ? "up" : "down"} size={12} className="mr-1" />
            Difficulty {ad.difficultyBefore} → {ad.difficultyAfter}
          </span>
        )}
      </div>
    </section>
  );
}

export default function InterviewRoom({ initial }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [turn, setTurn] = useState(null);
  const [secs, setSecs] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    setSecs(0);
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    box.current?.focus();
    return () => clearInterval(t);
  }, [state.questionNumber]);

  async function submit() {
    if (!answer.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: state.sessionId, answer }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw data.error || { message: "Something went wrong.", hint: "Please retry." };
      if (data.done) { router.push(data.resultsUrl); return; }
      setTurn({ evaluation: data.evaluation, adaptation: data.adaptation });
      setAnswer("");
      setState(data.state);
    } catch (e) {
      setError(e?.message ? e : { message: "Couldn't reach the interviewer.", hint: "Check that the dev server is running, then retry. Your answer is kept." });
    } finally { setBusy(false); }
  }

  const q = state.currentQuestion;
  const pct = Math.round(((state.questionNumber - 1) / state.totalQuestions) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-200">Question {state.questionNumber} of {state.totalQuestions}</span>
            <span className="flex items-center gap-1 tabular-nums text-slate-400" aria-label="Time on this question"><Icon name="clock" size={14} /> {mmss(secs)}</span>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Interview progress" className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {turn && <InterviewerRead turn={turn} />}

        <section className="card p-6" aria-labelledby="q">
          <div className="mb-3 flex flex-wrap gap-2">
            {q.isFollowUp && <span className="chip border-accent/40 text-accent">Follow-up</span>}
            <span className="chip capitalize">{q.type.replace("_", " ")}</span>
            <span className="chip capitalize">{q.difficulty}</span>
          </div>
          <h1 id="q" className="text-xl font-semibold leading-snug text-slate-50 md:text-2xl">{q.text}</h1>
        </section>

        <div>
          <label htmlFor="answer" className="label">Your answer</label>
          <textarea id="answer" ref={box} rows={8} className="input mt-1" value={answer} disabled={busy}
            placeholder="Answer as you would in the room. Be specific: decisions, trade-offs, results."
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }} maxLength={4000} />
          <div className="mt-1 flex justify-between text-xs text-slate-600"><span>Ctrl/⌘ + Enter to submit</span><span>{answer.length}/4000</span></div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <p className="font-medium">{error.message}</p>
            {error.hint && <p className="mt-1 opacity-80">{error.hint}</p>}
            <button className="btn-ghost mt-3" onClick={submit}>Retry</button>
          </div>
        )}

        <button className="btn-primary w-full sm:w-auto" disabled={busy || !answer.trim()} onClick={submit}>
          {busy ? "Your interviewer is thinking…" : state.questionNumber === state.totalQuestions ? "Submit and finish" : "Submit answer"} <Icon name="arrow" size={16} />
        </button>
      </div>

      <aside className="space-y-4" aria-label="Interview context">
        {state.isDemo ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
            <span className="font-semibold">Demo Mode.</span> Scripted rules, not live AI.
          </div>
        ) : (
          <div className="flex gap-2 rounded-xl border border-line bg-surface p-3 text-xs text-slate-400">
            <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-accent" />
            <p><span className="font-medium text-slate-200">Private practice session.</span> With local AI, your resume and answers can stay on your device. This holds only if your Ollama server runs on your own machine.</p>
          </div>
        )}
        <div className="card p-4">
          <p className="label">Interview context</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="text-right text-slate-200">{state.role}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="capitalize text-slate-200">{state.interviewType}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Difficulty</dt><dd className="capitalize text-slate-200">{state.difficulty}</dd></div>
          </dl>
        </div>
        <div className="card p-4">
          <p className="label">Practice signals</p>
          {state.signals ? (
            <div className="mt-3 space-y-3">
              <SignalBar label="Technical accuracy" value={state.signals.technicalAccuracy} />
              <SignalBar label="Clarity" value={state.signals.clarity} tone="accent" />
              <SignalBar label="Specificity" value={state.signals.specificity} />
              <SignalBar label="Completeness" value={state.signals.completeness} tone="accent" />
              <p className="text-xs text-slate-600">From your last answer. Practice signals, not measurements.</p>
            </div>
          ) : <p className="mt-2 text-sm text-slate-500">Appear after your first answer.</p>}
        </div>
      </aside>
    </div>
  );
}
