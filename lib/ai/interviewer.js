import { z } from "zod";
import { AppError } from "@/lib/utils/validation";
import { NextQuestionSchema } from "./schemas";
import { InterviewConfigSchema, assertUsableInputs, createPlan } from "./planner";
import { evaluateAnswer } from "./evaluator";
import { buildReport } from "./report";
import { createInitialState, applyEvaluation, applyNextQuestion, markComplete, DIFFICULTY_ORDER } from "@/lib/interview/state";

export const AnswerSchema = z.string().trim().min(1, "Write an answer first.").max(4000, "Please keep answers under 4000 characters.");

export async function startInterview(provider, { candidate, job, config }) {
  const cfg = InterviewConfigSchema.parse(config);
  assertUsableInputs(candidate, job);
  const plan = await createPlan(provider, { candidate, job, config: cfg });
  return createInitialState({
    mode: provider.isDemo ? "demo" : "live",
    candidateProfile: candidate,
    jobProfile: job,
    config: cfg,
    plan,
  });
}

/**
 * One interview turn: evaluate -> decide -> (next question | report).
 * Nothing is persisted here; if the model fails midway, the caller keeps the old state and can retry.
 */
export async function submitAnswer(provider, state, rawAnswer) {
  if (state.status !== "in_progress") {
    throw new AppError("INTERVIEW_COMPLETE", "This interview is already finished.", "Open the results page.", 409);
  }
  const answer = AnswerSchema.parse(rawAnswer);
  const evaluation = await evaluateAnswer(provider, { state, answer });
  const afterEval = applyEvaluation(state, answer, evaluation);
  const turnEval = afterEval.conversationHistory.at(-1).evaluation;

  const adaptation = {
    action: turnEval.nextAction,
    difficultyBefore: state.difficulty,
    difficultyAfter: afterEval.difficulty,
    changed: afterEval.difficulty === state.difficulty ? null : DIFFICULTY_ORDER.indexOf(afterEval.difficulty) > DIFFICULTY_ORDER.indexOf(state.difficulty) ? "up" : "down",
  };

  if (afterEval.status === "finishing") {
    const report = await buildReport(provider, afterEval);
    return { state: markComplete(afterEval), evaluation: turnEval, adaptation, report, nextQuestion: null };
  }

  const nq = NextQuestionSchema.parse(
    await provider.generateNextQuestion({
      state: afterEval, evaluation: turnEval, lastQuestion: state.currentQuestion.text, lastAnswer: answer,
    }),
  );
  const next = applyNextQuestion(afterEval, nq);
  return { state: next, evaluation: turnEval, adaptation: { ...adaptation, isFollowUp: next.currentQuestion.isFollowUp }, report: null, nextQuestion: next.currentQuestion };
}
