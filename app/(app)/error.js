"use client";
import Notice from "@/components/ui/Notice";

export default function Error({ reset }) {
  return (
    <Notice title="Something went wrong." hint="Please retry. If it keeps happening, restart the dev server.">
      <button onClick={reset} className="btn-ghost">Retry</button>
    </Notice>
  );
}
