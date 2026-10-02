import Link from "next/link";
import { SideNav, MobileNav } from "@/components/layout/SideNav";
import Topbar from "@/components/layout/Topbar";
import Icon from "@/components/ui/Icon";
import SidebarProfile from "@/components/layout/SidebarProfile";

export default function AppLayout({ children }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand focus:px-3 focus:py-2">Skip to content</a>
      <div className="min-h-screen md:flex">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col justify-between border-r border-line bg-surface/40 p-4 md:flex">
          <div>
            <Link href="/home" className="mb-6 flex items-center gap-2 px-2 font-semibold text-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white"><Icon name="pulse" size={16} /></span>
              Interview Dost
            </Link>
            <SideNav />
          </div>
          <SidebarProfile />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-10 md:pb-10">{children}</main>
        </div>
        <MobileNav />
      </div>
    </>
  );
}
