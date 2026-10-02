import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/utils/api";
import { AppError } from "@/lib/utils/validation";
import { getProvider } from "@/lib/ai/provider";
import { CandidateProfileSchema, JobProfileSchema } from "@/lib/ai/schemas";
import { startInterview } from "@/lib/ai/interviewer";
import { createSession, loadState } from "@/lib/db/sessions";
import { toPublicState } from "@/lib/interview/state";

export const runtime = "nodejs";

const StartBody = z.object({
  candidate: CandidateProfileSchema,
  job: JobProfileSchema,
  config: z.object({}).passthrough(), // validated by InterviewConfigSchema
  demo: z.boolean().optional(),
});

// POST: start a new interview. In live mode we check Ollama + model first for a friendly error.
export const POST = route(async (req) => {
  const body = StartBody.parse(await req.json());
  const provider = await getProvider({ demo: body.demo });
  if (!provider.isDemo) await provider.health();
  const state = await startInterview(provider, body);
  await createSession(state);
  return NextResponse.json({ sessionId: state.sessionId, state: toPublicState(state) });
});

// GET ?id=... : resume an interrupted interview.
export const GET = route(async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new AppError("INVALID_INPUT", "Missing interview id.");
  const state = await loadState(id);
  if (!state) throw new AppError("NOT_FOUND", "We couldn't find that interview.", "Start a new one from Practice.", 404);
  return NextResponse.json({ state: toPublicState(state) });
});
