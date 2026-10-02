"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { CATEGORIES, PRACTICE_CARDS, setupHref } from "@/lib/practice/catalog";

export default function PracticeBrowser() {
  const [cat, setCat] = useState("All");
  const cards = cat === "All" ? PRACTICE_CARDS : PRACTICE_CARDS.filter((c) => c.category === cat);
  return (
    <section aria-labelledby="toolkit">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="toolkit" className="text-lg font-semibold text-slate-100">Build your interview toolkit</h2>
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`rounded-full px-3 py-1 text-xs transition ${cat === c ? "bg-brand text-white" : "text-slate-400 hover:bg-white/5"}`}>{c}</button>
          ))}
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.id}>
            <Link href={setupHref(c.preset)} className="card group flex h-full flex-col justify-between p-5 transition hover:border-brand/50">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand-soft"><Icon name={c.icon} /></span>
                <span className="chip">{c.difficulty}</span>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-slate-100">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{c.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Icon name="clock" size={14} /> {c.minutes} min · {c.category}</span>
                <span className="flex items-center gap-1 text-brand-soft">Start <Icon name="arrow" size={14} /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
