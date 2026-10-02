"use client";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const TITLES = { "": "Home", home: "Home", practice: "Practice", setup: "Custom session", interview: "Interview", results: "Results", progress: "Progress", library: "Library" };

function Popover({ icon, label, children }) {
  return (
    <details className="relative">
      <summary aria-label={label} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200">
        <Icon name={icon} size={16} />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-line bg-surface p-4 text-sm text-slate-300 shadow-xl">{children}</div>
    </details>
  );
}

export default function Topbar() {
  const segs = usePathname().split("/").filter(Boolean);
  const last = segs.length ? (segs[0] === "practice" && segs[1] === "setup" ? "setup" : segs[0]) : "";
  return (
    <header className="flex h-14 items-center justify-between border-b border-line px-4 md:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <span>Interview Dost</span><span aria-hidden="true">›</span>
        <span className="font-medium text-slate-200" aria-current="page">{TITLES[last] || "Home"}</span>
      </nav>
      <div className="flex items-center gap-1">
        <Popover icon="bell" label="Notifications">
          <p className="font-medium text-slate-200">No notifications</p>
          <p className="mt-1 text-slate-500">Nothing new. Finished sessions show up in Progress.</p>
        </Popover>
        <Popover icon="help" label="Help">
          <p className="font-medium text-slate-200">How it works</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-400">
            <li>Add your resume and a job description.</li>
            <li>Answer one question at a time.</li>
            <li>Your answers decide the follow-ups.</li>
            <li>Get a report and 3 drills for your weak spots.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-500">No Ollama? Turn on Demo Mode in the session setup.</p>
        </Popover>
      </div>
    </header>
  );
}
