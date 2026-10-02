import { z } from "zod";

const score = z.number().min(0).max(10);

export const QuestionType = z.enum(["technical", "behavioral", "hr", "role_specific", "follow_up"]);
export const Difficulty = z.enum(["easy", "medium", "hard"]);
export const NextAction = z.enum([
  "follow_up",
  "clarification",
  "deeper_technical",
  "behavioral_probe",
  "next_topic",
  "increase_difficulty",
  "decrease_difficulty",
]);

export const CandidateProfileSchema = z.object({
  name: z.string().default(""),
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  experience: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  previousRoles: z.array(z.string()).default([]),
});

export const JobProfileSchema = z.object({
  role: z.string().default(""),
  seniority: z.string().default(""),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const InterviewPlanSchema = z.object({
  technicalTopics: z.array(z.string()).min(1),
  behavioralTopics: z.array(z.string()).default([]),
  roleSpecificTopics: z.array(z.string()).default([]),
  openingQuestion: z.object({
    text: z.string().min(10),
    type: QuestionType,
    difficulty: Difficulty,
  }),
});

// Evaluation of ONE answer. User-facing feedback only; no reasoning chains.
export const EvaluationSchema = z.object({
  technicalAccuracy: score,
  clarity: score,
  specificity: score,
  completeness: score,
  weakAreas: z.array(z.string()).max(4).default([]),
  strengths: z.array(z.string()).max(3).default([]),
  feedback: z.string().max(300), // one short user-facing line
  nextAction: NextAction,
});

export const NextQuestionSchema = z.object({
  nextQuestion: z.string().min(10),
  questionType: QuestionType,
  difficulty: Difficulty,
  topic: z.string().default(""),
});

export const DrillSchema = z.object({
  title: z.string(),
  weakArea: z.string(),
  minutes: z.number().int().min(1).max(30),
  prompt: z.string(),
});

export const ReportSchema = z.object({
  signals: z.object({
    communication: score,
    technicalUnderstanding: score,
    answerStructure: score,
    specificity: score,
    problemSolving: score,
  }),
  improvements: z
    .array(z.object({ title: z.string(), whatHappened: z.string(), whyItMatters: z.string(), howToImprove: z.string() }))
    .max(4),
  strongMoments: z.array(z.string()).max(4),
  drills: z.array(DrillSchema).min(1).max(3),
});

/** Strip code fences, parse, validate. Throws ZodError / SyntaxError on failure. */
export function parseModelJson(raw, schema) {
  const cleaned = String(raw)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new SyntaxError("No JSON object found");
  return schema.parse(JSON.parse(cleaned.slice(start, end + 1)));
}
