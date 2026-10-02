"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TubesBackground from "@/components/ui/TubesBackground";

const STEPS = [
  { n: "01", title: "Bring your resume and the job", body: "Upload a PDF or paste text, then paste the job description. You review what was extracted before anything starts." },
  { n: "02", title: "Meet your interviewer", body: "One question at a time, built from your own projects and the skills the role asks for. No generic question bank." },
  { n: "03", title: "Your answers steer it", body: "Shallow answer? A specific follow-up. Strong answer? A harder question. It listens before it moves on." },
  { n: "04", title: "Leave with a plan", body: "A report of what your interviewer noticed, plus 3 drills built from the weak spots in your actual session." },
];

const FEATURES = [
  { icon: "briefcase", title: "Resume-aware", body: "Questions reference your real experience. It never invents projects you didn't list." },
  { icon: "code", title: "Job-aware", body: "The interview plan prioritises the skills the job description emphasises." },
  { icon: "bulb", title: "Targeted follow-ups", body: "It names the missing detail or trade-off instead of asking \"tell me more\"." },
  { icon: "progress", title: "Adaptive difficulty", body: "Difficulty moves up or down based on how you actually answer." },
  { icon: "check", title: "Honest reports", body: "Practice signals from your session, clearly not scientific measurements." },
  { icon: "pulse", title: "Next 3 drills", body: "Each drill targets a weakness found in your session, and launches a real practice round." },
];

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-16" aria-labelledby={`${id}-h`}>
      <p className="label text-accent">{eyebrow}</p>
      <h2 id={`${id}-h`} className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-slate-50 md:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Bubble({ who, tone = "plain", children }) {
  const styles = {
    plain: "border-line bg-bg",
    candidate: "border-line bg-white/5",
    notice: "border-amber-500/30 bg-amber-500/5",
    follow: "border-accent/40 bg-accent/5",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <p className="label">{who}</p>
      <div className="mt-1.5 text-sm text-slate-200">{children}</div>
    </div>
  );
}

function ScrollFocusShowcase() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1;
      const raw = (windowHeight * 0.82 - rect.top) / (rect.height + windowHeight * 0.2);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const t = Math.min(1, Math.max(0, (progress - 0.12) / 0.78));
  const centralScale = 1 + t * 0.9;
  const ringOpacity = 0.2 + t * 0.8;

  const orbitNodes = [
    { label: "Resume", x: "-34%", y: "18%", delay: 0 },
    { label: "JD", x: "18%", y: "-28%", delay: 0.1 },
    { label: "Signals", x: "34%", y: "26%", delay: 0.15 },
    { label: "Next drill", x: "-22%", y: "-36%", delay: 0.2 },
  ];

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-16" aria-labelledby="scroll-focus-h">
      <div className="mb-8 max-w-2xl">
        <p className="label text-accent">Scroll into focus</p>
        <h2 id="scroll-focus-h" className="mt-2 text-2xl font-semibold tracking-tight text-slate-50 md:text-4xl">A single thread becomes the whole conversation.</h2>
      </div>

      <div className="relative h-[460px] overflow-hidden rounded-[2rem] border border-line bg-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,231,183,0.08),transparent_35%),radial-gradient(circle_at_center,rgba(249,103,251,0.1),transparent_55%)]" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 transition-opacity duration-300" style={{ opacity: 0.4 + t * 0.6 }}>
          Scroll
        </div>

        <div className="absolute inset-0 transition-all duration-300" style={{ opacity: 0.25 + t * 0.75 }}>
          <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20" />
        </div>

        {orbitNodes.map((node) => (
          <div
            key={node.label}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-500"
            style={{
              transform: `translate(${(node.x)}, ${node.y}) scale(${1 - t * 0.72})`,
              opacity: 0.2 + t * 0.8,
              transitionDelay: `${node.delay * 200}ms`,
            }}
          >
            <div className="rounded-full border border-line bg-surface/80 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200 shadow-lg shadow-slate-950/50 backdrop-blur-sm">
              {node.label}
            </div>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ transform: `translate(-50%, -50%) scale(${centralScale})` }}>
          <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full border border-[#f4d973]/60 bg-[radial-gradient(circle_at_center,#f4d973_0%,#f0c65b_36%,#f7e7a0_100%)] shadow-[0_0_60px_rgba(244,217,115,0.35)]">
            <div className="text-center">
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-900/70">Focus</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Interview</div>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f4d973]/30 transition-all duration-500" style={{ opacity: ringOpacity, transform: `translate(-50%, -50%) scale(${1 + t * 0.45})` }} />
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <a href="#top" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand focus:px-3 focus:py-2">Skip to content</a>

      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white"><Icon name="pulse" size={16} /></span>
            Interview Dost
          </Link>
          <nav aria-label="Page sections" className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#how" className="hover:text-slate-100">How it works</a>
            <a href="#adaptive" className="hover:text-slate-100">Adaptive</a>
            <a href="#features" className="hover:text-slate-100">Features</a>
            <a href="#open" className="hover:text-slate-100">Open-weight AI</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/home" className="btn-ghost hidden sm:inline-flex">Open app</Link>
            <Link href="/practice/setup" className="btn-primary">Start practicing</Link>
          </div>
        </div>
      </header>

      <TubesBackground className="min-h-screen">
        <main id="top" className="relative z-10">
          {/* Hero */}
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-12 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-8 md:pb-16 md:pt-20">
            <div>
              <span className="chip pointer-events-auto border-brand/40 bg-bg/60 text-brand-soft">Open-weight AI · runs locally</span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-50 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] md:text-6xl">
                Most interview practice gives you questions.
                <span className="block bg-gradient-to-r from-brand-soft to-accent bg-clip-text text-transparent">Interview Dost gives you an interviewer.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-400">
                Your resume shapes the questions. Your answers shape the follow-ups. Your weak areas shape what you practice next.
              </p>
              <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
                <Link href="/practice/setup" className="btn-coral px-5 py-3">Start practicing <Icon name="arrow" size={16} /></Link>
                <Link href="/practice/setup?demo=1&sample=1" className="btn-ghost bg-bg/50 px-5 py-3 backdrop-blur">Try the 3-minute demo</Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">No account. No paid API. The demo runs without any AI setup and is clearly labelled as scripted.</p>
            </div>

            {/* Illustrative example */}
            <div className="card pointer-events-auto relative bg-surface/80 p-5 shadow-2xl shadow-brand/10 backdrop-blur-md" aria-label="Illustrative example of an adaptive interview">
              <div className="mb-4 flex items-center justify-between">
                <span className="label">Illustrative example</span>
                <span className="chip">Question 2 of 6</span>
              </div>
              <div className="space-y-3">
                <Bubble who="Interviewer · from your resume">Your resume mentions a real-time chat app built with Node.js and WebSockets. Why WebSockets instead of polling?</Bubble>
                <Bubble who="You" tone="candidate">Because they are faster.</Bubble>
                <Bubble who="What your interviewer noticed" tone="notice">
                  <div className="flex flex-wrap gap-2">
                    <span className="chip border-amber-500/30 text-amber-200">Missing: trade-off reasoning</span>
                    <span className="chip border-amber-500/30 text-amber-200">Missing: specific example</span>
                  </div>
                </Bubble>
                <Bubble who="Follow-up" tone="follow">What trade-off did you weigh, and what would break first at 100,000 concurrent users?</Bubble>
              </div>
            </div>
          </div>

          <ScrollFocusShowcase />

          {/* Problem */}
          <Section id="problem" eyebrow="The problem" title="Practice that never listens to you.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-6">
                <p className="label">Typical interview prep</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-400">
                  <li>• A list of questions, the same for everyone</li>
                  <li>• Question 5 ignores how you answered question 4</li>
                  <li>• Generic feedback that doesn&apos;t mention your projects</li>
                  <li>• No link between weak answers and what to practise</li>
                </ul>
              </div>
              <div className="card border-brand/40 bg-brand/5 p-6">
                <p className="label text-brand-soft">Interview Dost</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />Questions built from your resume and the job</li>
                  <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />Follow-ups aimed at the exact detail you skipped</li>
                  <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />Difficulty that moves with your answers</li>
                  <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />Drills created from your actual weak spots</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* How it works */}
          <Section id="how" eyebrow="How it works" title="From resume to a personal practice plan.">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="card p-5">
                  <span className="font-mono text-sm text-accent">{s.n}</span>
                  <h3 className="mt-3 font-semibold text-slate-100">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{s.body}</p>
                </li>
              ))}
            </ol>
          </Section>

          {/* Adaptive loop */}
          <Section id="adaptive" eyebrow="The adaptive loop" title="It notices. It follows up. It adjusts.">
            <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
              <ol className="space-y-3">
                {[
                  ["Answer", "You respond to one question."],
                  ["Evaluate", "Accuracy, clarity, specificity and completeness are checked, and missing evidence is flagged."],
                  ["Decide", "Follow up, go deeper, change topic, or raise or lower difficulty."],
                  ["Ask", "The next question targets the exact gap, or a fresh topic from the plan."],
                  ["Report", "Weak areas from the whole session become 3 drills you can start immediately."],
                ].map(([t, b], i) => (
                  <li key={t} className="card flex gap-4 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs text-brand-soft">{i + 1}</span>
                    <div><p className="font-medium text-slate-100">{t}</p><p className="text-sm text-slate-400">{b}</p></div>
                  </li>
                ))}
              </ol>
              <div className="card flex h-full flex-col p-6">
                <p className="label">After the interview</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-100">Your next 3 drills</h3>
                <ol className="mt-4 flex flex-1 flex-col gap-3 text-sm">
                  {[
                    ["1. Explain a technical trade-off", "5 min", "trade-off reasoning"],
                    ["2. Tell a STAR story with numbers", "10 min", "specific examples"],
                    ["3. Defend a design decision", "10 min", "answer depth"],
                  ].map(([t, m, target]) => (
                    <li key={t} className="flex flex-1 flex-col justify-center rounded-lg border border-line p-3">
                      <p><span className="text-slate-100">{t}</span> <span className="text-slate-500">· {m}</span></p>
                      <p className="mt-1 text-xs text-amber-200">Targets: {target}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-slate-500">Illustrative example. Your drills come from your own session.</p>
              </div>
            </div>
          </Section>

          {/* Features */}
          <Section id="features" eyebrow="Features" title="An interviewer, not a chatbot.">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="card p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand-soft"><Icon name={f.icon} /></span>
                  <h3 className="mt-4 font-semibold text-slate-100">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{f.body}</p>
                </li>
              ))}
            </ul>
          </Section>

          {/* Open-weight */}
          <Section id="open" eyebrow="Open-weight AI" title="Built on an open model you can run yourself.">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="card p-6">
                <Icon name="code" className="text-accent" />
                <h3 className="mt-3 font-semibold text-slate-100">Gemma via Ollama</h3>
                <p className="mt-1 text-sm text-slate-400">The interviewer runs on an open-weight Gemma model. Swap the model with one environment variable.</p>
              </div>
              <div className="card p-6">
                <Icon name="shield" className="text-accent" />
                <h3 className="mt-3 font-semibold text-slate-100">Private by design</h3>
                <p className="mt-1 text-sm text-slate-400">With a local model, your resume and answers can stay on your device. This holds when Ollama runs on your own machine.</p>
              </div>
              <div className="card p-6">
                <Icon name="check" className="text-accent" />
                <h3 className="mt-3 font-semibold text-slate-100">No paid API</h3>
                <p className="mt-1 text-sm text-slate-400">Nothing here calls a cloud AI service. A built-in Demo Mode shows the full flow without any AI, clearly labelled.</p>
              </div>
            </div>
          </Section>

          {/* Final CTA */}
          <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-16" aria-labelledby="cta">
            <div className="card relative overflow-hidden p-8 text-center md:p-14">
              <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
              <h2 id="cta" className="relative text-2xl font-semibold text-slate-50 md:text-4xl">Walk into your next interview with clarity.</h2>
              <p className="relative mx-auto mt-3 max-w-lg text-slate-400">Practice with an interviewer that actually listens to you.</p>
              <div className="relative mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/practice/setup" className="btn-coral px-5 py-3">Start practicing <Icon name="arrow" size={16} /></Link>
                <Link href="/practice/setup?demo=1&sample=1" className="btn-ghost px-5 py-3">Try the demo</Link>
              </div>
            </div>
          </section>
        </main>
      </TubesBackground>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-slate-500 md:px-8">
          <span>Interview Dost · an open-source AI hackathon project</span>
          <span>Practice signals are rough indicators, not scientific measurements.</span>
        </div>
      </footer>
    </div>
  );
}
