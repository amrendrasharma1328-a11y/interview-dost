import { Suspense } from "react";
import SetupWizard from "@/components/practice/SetupWizard";

export const metadata = { title: "Custom session · Interview Dost" };

export default function SetupPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      <SetupWizard />
    </Suspense>
  );
}
