import Link from "next/link";
import PracticeBrowser from "@/components/practice/PracticeBrowser";
import Icon from "@/components/ui/Icon";
import { WARMUP, setupHref } from "@/lib/practice/catalog";

export const metadata = { title: "Practice Studio · Interview Dost" };

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">Practice Studio</h1>
          <p className="mt-1 text-slate-400">Choose how you want your AI interviewer to challenge you.</p>
        </div>
        <Link href="/practice/setup" className="btn-coral">+ Custom Session</Link>
      </header>

      <section className="card relative overflow-hidden p-6 md:p-8" aria-labelledby="warm">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        <span className="chip border-brand/40 text-brand-soft">Recommended for you</span>
        <h2 id="warm" className="mt-3 text-2xl font-semibold text-slate-50">{WARMUP.title}</h2>
        <p className="mt-2 max-w-lg text-slate-400">{WARMUP.description}</p>
        <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><Icon name="clock" size={14} /> {WARMUP.minutes} min · {WARMUP.difficulty}</p>
        <Link href={setupHref(WARMUP.preset)} className="btn-primary mt-5">Start <Icon name="arrow" size={16} /></Link>
      </section>

      <PracticeBrowser />
    </div>
  );
}
