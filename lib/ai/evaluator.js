import { EvaluationSchema } from "./schemas";
import { sanitizeText } from "@/lib/utils/sanitize";

const round1 = (n) => Math.round(n * 10) / 10;

/** Ask provider to evaluate, then re-validate and clean (defence in depth). */
export async function evaluateAnswer(provider, { state, answer }) {
  const raw = await provider.evaluateAnswer({ question: state.currentQuestion.text, answer, state });
  const ev = EvaluationSchema.parse(raw);
  return {
    ...ev,
    technicalAccuracy: round1(ev.technicalAccuracy),
    clarity: round1(ev.clarity),
    specificity: round1(ev.specificity),
    completeness: round1(ev.completeness),
    feedback: sanitizeText(ev.feedback, 300),
    weakAreas: ev.weakAreas.map((w) => sanitizeText(w, 60)),
    strengths: ev.strengths.map((s) => sanitizeText(s, 80)),
  };
}
