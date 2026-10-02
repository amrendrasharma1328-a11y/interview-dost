import Link from "next/link";
import { redirect } from "next/navigation";
import InterviewRoom from "@/components/interview/InterviewRoom";
import Notice from "@/components/ui/Notice";
import { loadState } from "@/lib/db/sessions";
import { toPublicState } from "@/lib/interview/state";

export const dynamic = "force-dynamic";

export default async function InterviewPage({ params }) {
  let state = null;
  let failed = false;
  try { state = await loadState(params.id); } catch (e) { console.error(e); failed = true; }

  if (failed) {
    return <Notice title="We couldn't load this interview." hint="The database may not be ready. Run `npx prisma migrate dev`, then reload." />;
  }
  if (!state) {
    return <Notice title="We couldn't find that interview." hint="It may have been deleted. Start a new one."><Link href="/practice" className="btn-ghost">Go to Practice</Link></Notice>;
  }
  if (state.status === "complete") redirect(`/results/${params.id}`);
  return <InterviewRoom initial={toPublicState(state)} />;
}
