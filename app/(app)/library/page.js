import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { LIBRARY, setupHref } from "@/lib/practice/catalog";

export const metadata = { title: "Library · Interview Dost" };

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">Library</h1>
        <p className="mt-1 text-slate-400">Pick a classic question and let your interviewer take it from there.</p>
      </header>
      {LIBRARY.map((g) => (
        <section key={g.category} aria-labelledby={g.category}>
          <h2 id={g.category} className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{g.category}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {g.items.map((it) => (
              <li key={it.title}>
                <Link href={setupHref({ ...it.preset, focus: it.text })} className="card flex h-full items-start justify-between gap-4 p-4 transition hover:border-brand/50">
                  <span><span className="font-medium text-slate-100">{it.title}</span><br /><span className="text-sm text-slate-500">{it.text}</span></span>
                  <span className="mt-1 flex shrink-0 items-center gap-1 text-sm text-brand-soft">Practice <Icon name="arrow" size={14} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
