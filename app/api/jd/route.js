import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/utils/api";
import { parseJobDescription } from "@/lib/ai/jd-parser";

export const runtime = "nodejs";

const Body = z.object({ text: z.string().max(20000, "That job description is too long.") });

export const POST = route(async (req) => {
  const { text } = Body.parse(await req.json());
  return NextResponse.json({ profile: parseJobDescription(text) });
});
