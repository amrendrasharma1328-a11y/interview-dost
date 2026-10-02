import { z } from "zod";
import {
  CandidateProfileSchema, JobProfileSchema, EvaluationSchema, QuestionType, Difficulty,
} from "@/lib/ai/schemas";
import { LENGTH_TO_QUESTIONS, EXPERIENCE_TO_DIFFICULTY } from "@/lib/ai/planner";

export const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

export function shiftDifficulty(d, dir) {
  const i = DIFFICULTY_ORDER.indexOf(d);
  return DIFFICULTY_ORDER[Math.max(0, Math.min(2, i + dir))];
}

const QuestionSchema = z.object({
  text: z.string(), type: QuestionType, difficulty: Difficulty, topic: z.string().default(""), isFollowUp: z.boolean(),
});

const TurnSchema = QuestionSchema.omit({ text: true }).extend({
  question: z.string(), answer: z.string(), evaluation: EvaluationSchema,
});

export const InterviewStateSchema = z.object({
  sessionId: z.string(),
  mode: z.enum(["live", "demo"]),
  candidateProfile: CandidateProfileSchema,
  jobProfile: JobProfileSchema,
  plan: z.object({
    technicalTopics: z.array(z.string()),
    behavioralTopics: z.array(z.string()),
    roleSpecificTopics: z.array(z.string()),
  }),
  interviewType: z.string(),
  experience: z.string(),
  style: z.string(),
  difficulty: Difficulty,
  currentQuestion: QuestionSchema,
  questionNumber: z.number().int().min(1),
  totalQuestions: z.number().int().min(1),
  conversationHistory: z.array(TurnSchema),
  detectedWeakAreas: z.array(z.string()),
  topicsCovered: z.array(z.string()),
  nextAction: z.string().nullable(),
  status: z.enum(["in_progress", "finishing", "complete"]),
});

export function createInitialState({ mode, candidateProfile, jobProfile, config, plan }) {
  const q = plan.openingQuestion;
  return InterviewStateSchema.parse({
    sessionId: globalThis.crypto.randomUUID(),
    mode,
    candidateProfile,
    jobProfile,
    plan: {
      technicalTopics: plan.technicalTopics,
      behavioralTopics: plan.behavioralTopics,
      roleSpecificTopics: plan.roleSpecificTopics,
    },
    interviewType: config.interviewType,
    experience: config.experience,
    style: config.style,
    difficulty: EXPERIENCE_TO_DIFFICULTY[config.experience],
    currentQuestion: { text: q.text, type: q.type, difficulty: q.difficulty, topic: plan.technicalTopics[0] || "", isFollowUp: false },
    questionNumber: 1,
    totalQuestions: LENGTH_TO_QUESTIONS[config.lengthMinutes],
    conversationHistory: [],
    detectedWeakAreas: [],
    topicsCovered: [],
    nextAction: null,
    status: "in_progress",
  });
}

/**
 * Record the answer + evaluation. Pure: returns a new state.
 * Guard: at most ONE follow-up per question chain, so the interview keeps moving.
 */
export function applyEvaluation(state, answer, evaluation) {
  if (state.status !== "in_progress") throw new Error("Interview is not in progress");
  const q = state.currentQuestion;
  let action = evaluation.nextAction;
  if (q.isFollowUp && (action === "follow_up" || action === "clarification" || action === "deeper_technical")) {
    action = "next_topic";
  }
  const ev = { ...evaluation, nextAction: action };
  const dir = action === "increase_difficulty" ? 1 : action === "decrease_difficulty" ? -1 : 0;

  const topics = q.topic && !state.topicsCovered.includes(q.topic) ? [...state.topicsCovered, q.topic] : state.topicsCovered;
  return {
    ...state,
    difficulty: shiftDifficulty(state.difficulty, dir),
    conversationHistory: [
      ...state.conversationHistory,
      { question: q.text, type: q.type, difficulty: q.difficulty, topic: q.topic, isFollowUp: q.isFollowUp, answer, evaluation: ev },
    ],
    detectedWeakAreas: [...state.detectedWeakAreas, ...ev.weakAreas],
    topicsCovered: topics,
    nextAction: action,
    status: state.questionNumber >= state.totalQuestions ? "finishing" : "in_progress",
  };
}

export function applyNextQuestion(state, nq) {
  if (state.status !== "in_progress") throw new Error("No further question expected");
  return {
    ...state,
    currentQuestion: {
      text: nq.nextQuestion, type: nq.questionType, difficulty: nq.difficulty,
      topic: nq.topic || "", isFollowUp: nq.questionType === "follow_up",
    },
    questionNumber: state.questionNumber + 1,
  };
}

export function markComplete(state) {
  return { ...state, status: "complete", nextAction: "finish" };
}

/** What the browser is allowed to see. No plan, no prompts, no raw model output. */
export function toPublicState(state) {
  const last = state.conversationHistory.at(-1)?.evaluation;
  return {
    sessionId: state.sessionId,
    isDemo: state.mode === "demo",
    role: state.jobProfile.role,
    interviewType: state.interviewType,
    difficulty: state.difficulty,
    status: state.status,
    questionNumber: state.questionNumber,
    totalQuestions: state.totalQuestions,
    currentQuestion: {
      text: state.currentQuestion.text,
      type: state.currentQuestion.type,
      difficulty: state.currentQuestion.difficulty,
      isFollowUp: state.currentQuestion.isFollowUp,
    },
    signals: last
      ? { technicalAccuracy: last.technicalAccuracy, clarity: last.clarity, specificity: last.specificity, completeness: last.completeness }
      : null,
  };
}

export function toPublicEvaluation(ev) {
  return {
    scores: { technicalAccuracy: ev.technicalAccuracy, clarity: ev.clarity, specificity: ev.specificity, completeness: ev.completeness },
    feedback: ev.feedback,
    weakAreas: ev.weakAreas,
    strengths: ev.strengths,
  };
}
