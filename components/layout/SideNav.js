"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV } from "@/lib/constants";

const isActive = (path, href) => path.startsWith(href);

export function SideNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive(path, n.href) ? "bg-brand text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
          <Icon name={n.icon} size={16} /> {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}
          className={`flex flex-col items-center gap-1 py-2 text-xs ${isActive(path, n.href) ? "text-brand-soft" : "text-slate-500"}`}>
          <Icon name={n.icon} size={18} /> {n.label}
        </Link>
      ))}
    </nav>
  );
}
