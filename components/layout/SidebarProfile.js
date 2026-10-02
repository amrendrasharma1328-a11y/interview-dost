"use client";
import { useUser } from "@/components/providers/UserProvider";
import { PROFILE } from "@/lib/constants";

export default function SidebarProfile() {
    const { name, ready, clearName } = useUser();
    const shown = ready && name ? name : "Guest";
    return (
        <div className="flex items-center gap-3 border-t border-line px-2 pt-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs uppercase">{shown[0]}</span>
            <div className="min-w-0 text-xs">
                <p className="truncate font-medium text-slate-200">{shown}</p>
                <button type="button" onClick={clearName} className="text-slate-500 hover:text-slate-300">{PROFILE.role} · Change name</button>
            </div>
        </div>
    );
}
