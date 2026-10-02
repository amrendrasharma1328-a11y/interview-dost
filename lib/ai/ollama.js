import { config } from "@/lib/config";
import { AIProvider } from "./provider";
import { Errors } from "./errors";
import {
  InterviewPlanSchema, EvaluationSchema, NextQuestionSchema, ReportSchema, parseModelJson,
} from "./schemas";
import { planPrompt, evaluationPrompt, nextQuestionPrompt, reportPrompt } from "./prompts";

export class OllamaProvider extends AIProvider {
  constructor({ baseUrl = config.ollamaBaseUrl, model = config.ollamaModel } = {}) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  get name() { return `ollama:${this.model}`; }

  /** Checks Ollama is up AND the configured model is pulled. */
  async health() {
    let res;
    try {
      res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(4000) });
    } catch {
      throw Errors.unavailable();
    }
    if (!res.ok) throw Errors.unavailable();
    const { models = [] } = await res.json();
    const wanted = this.model.includes(":") ? this.model : `${this.model}:latest`;
    if (!models.some((m) => m.name === wanted || m.name === this.model)) throw Errors.modelMissing(this.model);
    return { ok: true, model: this.model };
  }

  async #chat(prompt, temperature = 0.4) {
    let res;
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(config.requestTimeoutMs),
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: "json",
          options: { temperature },
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (e) {
      throw e?.name === "TimeoutError" ? Errors.timeout() : Errors.unavailable();
    }
    if (res.status === 404) throw Errors.modelMissing(this.model);
    if (!res.ok) throw Errors.unavailable();
    const data = await res.json();
    return data?.message?.content ?? "";
  }

  /** Call model, validate with Zod, retry once with a stricter nudge on bad output. */
  async #structured(prompt, schema) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await this.#chat(
        attempt === 0 ? prompt : `${prompt}\n\nYour previous reply was not valid. Return ONLY the JSON object matching the schema.`,
        attempt === 0 ? 0.4 : 0.1,
      );
      try {
        return parseModelJson(raw, schema);
      } catch {
        /* retry */
      }
    }
    throw Errors.invalid();
  }

  generateInterviewPlan(input) { return this.#structured(planPrompt(input), InterviewPlanSchema); }
  evaluateAnswer(input) { return this.#structured(evaluationPrompt(input), EvaluationSchema); }
  generateNextQuestion(input) { return this.#structured(nextQuestionPrompt(input), NextQuestionSchema); }
  generateReport(input) { return this.#structured(reportPrompt(input), ReportSchema); }
}
