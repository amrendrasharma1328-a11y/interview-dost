// Single place for env config. Never hardcode these elsewhere.
export const config = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "gemma2:9b",
  demoMode: process.env.DEMO_MODE === "true",
  requestTimeoutMs: 120000,
};
