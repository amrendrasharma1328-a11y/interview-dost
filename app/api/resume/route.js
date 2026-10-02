import { NextResponse } from "next/server";
import { route } from "@/lib/utils/api";
import { AppError } from "@/lib/utils/validation";
import { readPdfUpload, extractPdfText, parseResume } from "@/lib/ai/resume-parser";

export const runtime = "nodejs";

// POST multipart: `file` (PDF) or `text`. Returns an editable profile for the user to confirm.
export const POST = route(async (req) => {
  const form = await req.formData();
  const file = form.get("file");
  const pasted = form.get("text");

  let text;
  if (file && typeof file !== "string") {
    text = await extractPdfText(await readPdfUpload(file));
  } else if (typeof pasted === "string" && pasted.trim()) {
    text = pasted;
  } else {
    throw new AppError("EMPTY_RESUME", "Upload a PDF or paste your resume text.", "");
  }
  return NextResponse.json({ profile: parseResume(text) });
});
