"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ListEditor from "./ListEditor";
import { CANDIDATE_FIELDS, JOB_FIELDS, toForm, fromForm } from "@/lib/utils/profileForm";
import { SAMPLE_RESUME, SAMPLE_JD } from "@/lib/demo/sample";

const STEPS = ["Resume", "Job description", "Interview type", "Experience", "Length", "Style"];
const OPTIONS = {
  interviewType: [["hr", "HR", "Background, motivation and fit"], ["behavioral", "Behavioral", "Stories about how you work"], ["technical", "Technical", "Depth in your skills and decisions"], ["mixed", "Mixed", "A realistic blend of all three"]],
  experience: [["beginner", "Beginner", "Fundamentals and clear explanations"], ["intermediate", "Intermediate", "Trade-offs and real project depth"], ["advanced", "Advanced", "Scale, design and edge cases"]],
  lengthMinutes: [[5, "5 minutes", "About 4 questions"], [10, "10 minutes", "About 6 questions"], [20, "20 minutes", "About 10 questions"]],
  style: [["supportive", "Supportive", "Encouraging, still specific"], ["realistic", "Realistic", "Like a typical company interview"], ["challenging", "Challenging", "Probing, pushes on trade-offs"]],
};
const STEP_KEYS = { 2: "interviewType", 3: "experience", 4: "lengthMinutes", 5: "style" };
const SAVE_KEY = "interviewdost.last";

function pick(v, allowed, fallback) {
  return allowed.some((o) => String(o[0]) === String(v)) ? v : fallback;
}

export default function SetupWizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const focus = sp.get("focus") || "";

  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState(sp.get("demo") === "1");
  const [file, setFile] = useState(null);
  const sample = sp.get("sample") === "1";
  const [resumeText, setResumeText] = useState(sample ? SAMPLE_RESUME : "");
  const [jdText, setJdText] = useState(sample ? SAMPLE_JD : "");
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null);
  const [cfg, setCfg] = useState({
    interviewType: pick(sp.get("type"), OPTIONS.interviewType, "technical"),
    experience: pick(sp.get("exp"), OPTIONS.experience, "intermediate"),
    lengthMinutes: Number(pick(sp.get("len"), OPTIONS.lengthMinutes, 10)),
    style: pick(sp.get("style"), OPTIONS.style, "realistic"),
  });

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); if (s?.candidate && s?.job) setSaved(s); } catch { /* ignore */ }
  }, []);

  async function call(url, init, label) {
    setBusy(label); setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw data.error || { message: "Something went wrong.", hint: "Please retry." };
      return data;
    } catch (e) {
      setError(e?.message ? e : { message: "Couldn't reach the app server.", hint: "Check that `npm run dev` is running, then retry." });
      return null;
    } finally { setBusy(""); }
  }

  async function extractResume() {
    const fd = new FormData();
    if (file) fd.append("file", file); else fd.append("text", resumeText);
    const data = await call("/api/resume", { method: "POST", body: fd }, "resume");
    if (data) setCandidate(toForm(data.profile, CANDIDATE_FIELDS));
  }

  async function extractJd() {
    const data = await call("/api/jd", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: jdText }) }, "jd");
    if (data) setJob(toForm(data.profile, JOB_FIELDS));
  }

  async function start() {
    const body = {
      candidate: fromForm(candidate, CANDIDATE_FIELDS),
      job: fromForm(job, JOB_FIELDS),
      config: { ...cfg, ...(focus ? { focus } : {}) },
      demo,
    };
    const data = await call("/api/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "start");
    if (!data) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ candidate, job })); } catch { /* ignore */ }
    router.push(`/interview/${data.sessionId}`);
  }

  const canNext = step === 0 ? !!candidate : step === 1 ? !!job : true;
  const last = step === STEPS.length - 1;
  const aiDown = error && ["OLLAMA_UNAVAILABLE", "MODEL_UNAVAILABLE"].includes(error.code);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Custom session</h1>
          <p className="mt-1 text-slate-400">Your resume and the job shape every question.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-slate-300">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} className="accent-violet-500" />
          Demo Mode <span className="text-xs text-slate-500">(scripted, no Ollama)</span>
        </label>
      </header>

      {focus && <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-slate-300"><span className="label mr-2">Focus</span>{focus}</p>}

      <ol className="flex flex-wrap gap-2 text-xs" aria-label="Setup progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}
            className={`rounded-full px-3 py-1 ${i === step ? "bg-brand text-white" : i < step ? "bg-brand/15 text-brand-soft" : "bg-white/5 text-slate-500"}`}>{i + 1}. {s}</li>
        ))}
      </ol>

      {saved && step < 2 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
          <span className="text-slate-300">Reuse the resume and job from your last session? <span className="text-xs text-slate-500">(saved only in this browser)</span></span>
          <button className="btn-ghost" onClick={() => { setCandidate(saved.candidate); setJob(saved.job); setStep(2); }}>Reuse and continue</button>
        </div>
      )}

      <section className="card space-y-5 p-6" aria-live="polite">
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold text-slate-100">Add your resume</h2>
            <div>
              <label htmlFor="pdf" className="label">Upload PDF (max 5 MB)</label>
              <input id="pdf" type="file" accept="application/pdf" className="input mt-1" onChange={(e) => { setFile(e.target.files?.[0] || null); setCandidate(null); }} />
            </div>
            <div>
              <label htmlFor="resume" className="label">…or paste resume text</label>
              <textarea id="resume" rows={6} className="input mt-1" value={resumeText} placeholder="Paste your resume here..."
                onChange={(e) => { setResumeText(e.target.value); setCandidate(null); }} disabled={!!file} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" disabled={busy === "resume" || (!file && !resumeText.trim())} onClick={extractResume}>
                {busy === "resume" ? "Reading…" : "Extract details"}
              </button>
              <button className="btn-ghost" onClick={() => { setFile(null); setResumeText(SAMPLE_RESUME); setCandidate(null); }}>Use sample resume (demo data)</button>
            </div>
            {candidate && (
              <>
                <p className="text-sm text-slate-400">Check what we found. Fix anything that looks wrong; your interviewer only uses what's here.</p>
                <ListEditor fields={CANDIDATE_FIELDS} form={candidate} onChange={setCandidate} legend="Resume details" />
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-slate-100">Paste the job description</h2>
            <div>
              <label htmlFor="jd" className="label">Job description</label>
              <textarea id="jd" rows={7} className="input mt-1" value={jdText} placeholder="Paste the job description here..."
                onChange={(e) => { setJdText(e.target.value); setJob(null); }} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" disabled={busy === "jd" || !jdText.trim()} onClick={extractJd}>{busy === "jd" ? "Reading…" : "Analyze"}</button>
              <button className="btn-ghost" onClick={() => { setJdText(SAMPLE_JD); setJob(null); }}>Use sample job (demo data)</button>
            </div>
            {job && <ListEditor fields={JOB_FIELDS} form={job} onChange={setJob} legend="Job details" />}
          </>
        )}

        {STEP_KEYS[step] && (
          <fieldset>
            <legend className="mb-3 text-lg font-semibold text-slate-100">{STEPS[step]}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPTIONS[STEP_KEYS[step]].map(([value, label, desc]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" name={STEP_KEYS[step]} className="peer sr-only" checked={cfg[STEP_KEYS[step]] === value}
                    onChange={() => setCfg({ ...cfg, [STEP_KEYS[step]]: value })} />
                  <div className="rounded-xl border border-line p-4 transition peer-checked:border-brand peer-checked:bg-brand/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand-soft">
                    <p className="font-medium text-slate-100">{label}</p>
                    <p className="mt-1 text-sm text-slate-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {last && (
          <p className="rounded-lg bg-white/5 p-3 text-sm text-slate-400">
            <span className="capitalize">{cfg.interviewType}</span> · <span className="capitalize">{cfg.experience}</span> · {cfg.lengthMinutes} min · <span className="capitalize">{cfg.style}</span>
            {demo ? " · Demo Mode" : " · local AI via Ollama"}
          </p>
        )}
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          <p className="font-medium">{error.message}</p>
          {error.hint && <p className="mt-1 opacity-80">{error.hint}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {last && <button className="btn-ghost" onClick={start}>Retry</button>}
            {aiDown && <button className="btn-ghost" onClick={() => { setDemo(true); setError(null); }}>Switch to Demo Mode</button>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button className="btn-ghost" disabled={step === 0} onClick={() => { setError(null); setStep(step - 1); }}>Back</button>
        {last ? (
          <button className="btn-coral" disabled={busy === "start"} onClick={start}>{busy === "start" ? "Preparing your interviewer…" : "Start Interview"} <Icon name="arrow" size={16} /></button>
        ) : (
          <button className="btn-primary" disabled={!canNext} onClick={() => { setError(null); setStep(step + 1); }}>Next</button>
        )}
      </div>
    </div>
  );
}
