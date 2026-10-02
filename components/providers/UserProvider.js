"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const KEY = "interviewDost.userName";
const Ctx = createContext({ name: "", ready: false, setName: () => { }, clearName: () => { } });

export const useUser = () => useContext(Ctx);

function NamePrompt() {
    const { name, ready, setName } = useUser();
    const [value, setValue] = useState("");
    const inputRef = useRef(null);
    const open = ready && !name;

    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
    if (!open) return null;

    const submit = (e) => { e.preventDefault(); setName(value); };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="name-h">
            <form onSubmit={submit} className="card w-full max-w-sm p-6 shadow-2xl shadow-brand/20">
                <p className="label text-accent">Welcome</p>
                <h2 id="name-h" className="mt-2 text-xl font-semibold text-slate-50">What should we call you?</h2>
                <p className="mt-1 text-sm text-slate-400">Your interviewer will use this name. It stays on this device only.</p>
                <label htmlFor="user-name" className="sr-only">Your name</label>
                <input
                    id="user-name" ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
                    maxLength={40} autoComplete="given-name" placeholder="e.g. Rahul" className="input mt-4"
                />
                <button type="submit" disabled={!value.trim()} className="btn-coral mt-4 w-full">Continue</button>
            </form>
        </div>
    );
}

export default function UserProvider({ children }) {
    const [name, setNameState] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try { setNameState(localStorage.getItem(KEY) || ""); } catch { }
        setReady(true);
    }, []);

    const setName = useCallback((v) => {
        const clean = String(v || "").trim().replace(/\s+/g, " ").slice(0, 40);
        if (!clean) return;
        setNameState(clean);
        try { localStorage.setItem(KEY, clean); } catch { }
    }, []);

    const clearName = useCallback(() => {
        setNameState("");
        try { localStorage.removeItem(KEY); } catch { }
    }, []);

    return (
        <Ctx.Provider value={{ name, ready, setName, clearName }}>
            {children}
            <NamePrompt />
        </Ctx.Provider>
    );
}
