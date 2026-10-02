import { z } from "zod";
import { AppError } from "@/lib/utils/validation";

export const LENGTH_TO_QUESTIONS = { 5: 4, 10: 6, 20: 10 };
export const EXPERIENCE_TO_DIFFICULTY = { beginner: "easy", intermediate: "medium", advanced: "hard" };

const lower = (s) => (typeof s === "string" ? s.toLowerCase() : s);

export const InterviewConfigSchema = z.object({
  interviewType: z.preprocess(lower, z.enum(["hr", "behavioral", "technical", "mixed"])),
  experience: z.preprocess(lower, z.enum(["beginner", "intermediate", "advanced"])),
  style: z.preprocess(lower, z.enum(["supportive", "realistic", "challenging"])),
  focus: z.string().trim().max(300).optional(),
  lengthMinutes: z.coerce.number().refine((n) => n in LENGTH_TO_QUESTIONS, "Choose 5, 10 or 20 minutes"),
});

export function assertUsableInputs(candidate, job) {
  const hasCandidate = candidate.skills.length || candidate.technologies.length || candidate.projects.length || candidate.experience.length;
  if (!hasCandidate) throw new AppError("EMPTY_RESUME", "We couldn't find anything to ask about in the resume.", "Add some skills, projects or experience first.", 422);
  if (!job.role && !job.technologies.length) throw new AppError("EMPTY_JD", "The job description needs a role or some skills.", "Paste the job description again.", 422);
}

export async function createPlan(provider, { candidate, job, config }) {
  return provider.generateInterviewPlan({
    candidate,
    job,
    interviewType: config.interviewType,
    experience: config.experience,
    style: config.style,
    focus: config.focus || "",
    totalQuestions: LENGTH_TO_QUESTIONS[config.lengthMinutes],
  });
}
