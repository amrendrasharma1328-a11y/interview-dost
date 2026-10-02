import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/utils/api";
import { AppError } from "@/lib/utils/validation";
import { getProvider } from "@/lib/ai/provider";
import { submitAnswer } from "@/lib/ai/interviewer";
import { loadState, persistTurn } from "@/lib/db/sessions";
import { toPublicState, toPublicEvaluation } from "@/lib/interview/state";

export const runtime = "nodejs";

const Body = z.object({ sessionId: z.string().min(1), answer: z.string() });

// POST: submit an answer. Returns concise feedback, the adaptation decision and the next question.
export const POST = route(async (req) => {
  const { sessionId, answer } = Body.parse(await req.json());
  const prev = await loadState(sessionId);
  if (!prev) throw new AppError("NOT_FOUND", "We couldn't find that interview.", "Start a new one from Practice.", 404);

  const provider = await getProvider({ demo: prev.mode === "demo" });
  const result = await submitAnswer(provider, prev, answer);
  await persistTurn(prev, result);

  const done = result.state.status === "complete";
  return NextResponse.json({
    evaluation: toPublicEvaluation(result.evaluation),
    adaptation: result.adaptation,
    state: toPublicState(result.state),
    done,
    resultsUrl: done ? `/results/${prev.sessionId}` : null,
  });
});
