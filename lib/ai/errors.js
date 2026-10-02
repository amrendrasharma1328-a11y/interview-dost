export class AIError extends Error {
  constructor(code, userMessage, hint) {
    super(userMessage);
    this.name = "AIError";
    this.code = code; // OLLAMA_UNAVAILABLE | MODEL_UNAVAILABLE | INVALID_RESPONSE | TIMEOUT
    this.userMessage = userMessage;
    this.hint = hint;
  }
}

export const Errors = {
  unavailable: () =>
    new AIError("OLLAMA_UNAVAILABLE", "Your AI interviewer isn't connected yet.", "Start Ollama and make sure your selected model is available."),
  modelMissing: (m) =>
    new AIError("MODEL_UNAVAILABLE", `The model "${m}" isn't installed.`, `Run: ollama pull ${m}`),
  invalid: () =>
    new AIError("INVALID_RESPONSE", "The interviewer gave an unusable response.", "Retry. If it keeps happening, try a larger model."),
  timeout: () =>
    new AIError("TIMEOUT", "The interviewer took too long to respond.", "Retry, or use a smaller model."),
};

// Safe shape for API responses: no stack traces, no internals.
export function toPublicError(e) {
  if (e instanceof AIError) return { code: e.code, message: e.userMessage, hint: e.hint };
  return { code: "INTERNAL", message: "Something went wrong.", hint: "Please retry." };
}
