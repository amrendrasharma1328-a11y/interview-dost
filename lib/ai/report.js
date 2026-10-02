import { ReportSchema } from "./schemas";

export const PRACTICE_DISCLAIMER =
  "These are practice signals from this session, not scientific measurements or a prediction of real interview results.";

export async function buildReport(provider, state) {
  const raw = await provider.generateReport({ state });
  return { ...ReportSchema.parse(raw), disclaimer: PRACTICE_DISCLAIMER };
}
