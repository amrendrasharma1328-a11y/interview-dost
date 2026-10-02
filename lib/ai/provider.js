import { config } from "@/lib/config";

/**
 * AI provider contract. UI and API routes only talk to this interface,
 * so the open-weight model can be swapped without touching the app.
 *
 * generateInterviewPlan({ candidate, job, interviewType, experience, totalQuestions, style })
 *   -> InterviewPlan
 * evaluateAnswer({ question, answer, state }) -> Evaluation
 * generateNextQuestion({ state, evaluation, lastQuestion, lastAnswer }) -> NextQuestion
 * generateReport({ state }) -> Report
 */
export class AIProvider {
  get name() { throw new Error("not implemented"); }
  get isDemo() { return false; }
  async health() { throw new Error("not implemented"); }
  async generateInterviewPlan() { throw new Error("not implemented"); }
  async evaluateAnswer() { throw new Error("not implemented"); }
  async generateNextQuestion() { throw new Error("not implemented"); }
  async generateReport() { throw new Error("not implemented"); }
}

let cached;

/** Factory. Pass { demo: true } to force deterministic Demo Mode. */
export async function getProvider({ demo } = {}) {
  const useDemo = demo ?? config.demoMode;
  if (useDemo) {
    const { DemoProvider } = await import("./demo");
    return new DemoProvider();
  }
  if (!cached) {
    const { OllamaProvider } = await import("./ollama");
    cached = new OllamaProvider();
  }
  return cached;
}
