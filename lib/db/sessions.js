import { db } from "./client";
import { InterviewStateSchema } from "@/lib/interview/state";

const LOCAL_USER = "local";

async function ensureUser(tx = db) {
  return tx.user.upsert({ where: { id: LOCAL_USER }, update: {}, create: { id: LOCAL_USER, name: "Candidate" } });
}

export async function createSession(state) {
  await ensureUser();
  const q = state.currentQuestion;
  await db.interviewSession.create({
    data: {
      id: state.sessionId,
      userId: LOCAL_USER,
      mode: state.mode,
      interviewType: state.interviewType,
      experience: state.experience,
      style: state.style,
      difficulty: state.difficulty,
      totalQuestions: state.totalQuestions,
      candidateJson: JSON.stringify(state.candidateProfile),
      jobJson: JSON.stringify(state.jobProfile),
      planJson: JSON.stringify(state.plan),
      stateJson: JSON.stringify(state),
      questions: { create: { index: 1, text: q.text, type: q.type, difficulty: q.difficulty, isFollowUp: q.isFollowUp } },
    },
  });
}

/** Returns validated state, or null if the session doesn't exist. */
export async function loadState(sessionId) {
  const row = await db.interviewSession.findUnique({ where: { id: sessionId }, select: { stateJson: true } });
  if (!row) return null;
  return InterviewStateSchema.parse(JSON.parse(row.stateJson));
}

export async function loadReport(sessionId) {
  const row = await db.interviewSession.findUnique({ where: { id: sessionId }, select: { reportJson: true } });
  return row?.reportJson ? JSON.parse(row.reportJson) : null;
}

/** Atomically saves one turn (answer, evaluation, next question, and report/drills if finished). */
export async function persistTurn(prev, result) {
  const { state, evaluation, report } = result;
  await db.$transaction(async (tx) => {
    const qRow = await tx.interviewQuestion.findFirst({ where: { sessionId: prev.sessionId, index: prev.questionNumber } });
    if (qRow) {
      const answer = state.conversationHistory.at(-1).answer;
      await tx.interviewQuestion.update({ where: { id: qRow.id }, data: { answer } });
      await tx.answerEvaluation.create({
        data: {
          questionId: qRow.id,
          technicalAccuracy: Math.round(evaluation.technicalAccuracy),
          clarity: Math.round(evaluation.clarity),
          specificity: Math.round(evaluation.specificity),
          completeness: Math.round(evaluation.completeness),
          weakAreas: JSON.stringify(evaluation.weakAreas),
          feedback: evaluation.feedback,
          nextAction: evaluation.nextAction,
        },
      });
    }
    if (result.nextQuestion) {
      const n = result.nextQuestion;
      await tx.interviewQuestion.create({
        data: { sessionId: prev.sessionId, index: state.questionNumber, text: n.text, type: n.type, difficulty: n.difficulty, isFollowUp: n.isFollowUp },
      });
    }
    await tx.interviewSession.update({
      where: { id: prev.sessionId },
      data: {
        stateJson: JSON.stringify(state),
        difficulty: state.difficulty,
        ...(report ? { status: "complete", completedAt: new Date(), reportJson: JSON.stringify(report) } : {}),
      },
    });
    if (report) {
      for (const d of report.drills) {
        await tx.practiceDrill.create({ data: { sessionId: prev.sessionId, title: d.title, weakArea: d.weakArea, minutes: d.minutes, prompt: d.prompt } });
      }
    }
  });
}

/** Everything the results page needs. Returns null if the session doesn't exist. */
export async function loadResults(sessionId) {
  const row = await db.interviewSession.findUnique({ where: { id: sessionId }, select: { stateJson: true, reportJson: true, status: true } });
  if (!row) return null;
  return {
    status: row.status,
    state: InterviewStateSchema.parse(JSON.parse(row.stateJson)),
    report: row.reportJson ? JSON.parse(row.reportJson) : null,
  };
}
