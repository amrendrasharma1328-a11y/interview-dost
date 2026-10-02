import { db } from "./client";

const safe = (j, f) => { try { return JSON.parse(j); } catch { return f; } };

/** Real data only. If the DB isn't ready we say so instead of inventing numbers. */
export async function getOverview() {
  try {
    const rows = await db.interviewSession.findMany({
      where: { status: "complete" },
      orderBy: { completedAt: "desc" },
      take: 100,
      select: { id: true, mode: true, interviewType: true, completedAt: true, reportJson: true, stateJson: true },
    });
    const sessions = rows
      .map((r) => {
        const report = safe(r.reportJson, null);
        const st = safe(r.stateJson, {});
        return {
          id: r.id, mode: r.mode, interviewType: r.interviewType, completedAt: r.completedAt,
          role: st.jobProfile?.role || "Interview", signals: report?.signals || null,
          weakAreas: st.detectedWeakAreas || [], topImprovement: report?.improvements?.[0]?.title || null,
        };
      })
      .filter((s) => s.signals);
    const active = await db.interviewSession.findFirst({
      where: { status: "in_progress" }, orderBy: { createdAt: "desc" },
      select: { id: true, mode: true, interviewType: true, stateJson: true },
    });
    const st = active ? safe(active.stateJson, {}) : null;
    const inProgress = active
      ? { id: active.id, mode: active.mode, type: active.interviewType, role: st.jobProfile?.role || "Interview", q: st.questionNumber, total: st.totalQuestions }
      : null;
    return { sessions, inProgress, dbError: false };
  } catch (e) {
    console.error("[stats]", e);
    return { sessions: [], inProgress: null, dbError: true };
  }
}

const KEYS = ["communication", "technicalUnderstanding", "answerStructure", "specificity", "problemSolving"];
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

export function summarize(sessions) {
  const avg = {};
  for (const k of KEYS) avg[k] = sessions.length ? sessions.reduce((a, s) => a + s.signals[k], 0) / sessions.length : 0;
  const counts = {};
  for (const s of sessions) for (const w of new Set(s.weakAreas)) counts[w] = (counts[w] || 0) + 1;
  const weak = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([area, n]) => ({ area, n }));
  const strongest = sessions.length ? KEYS.reduce((a, b) => (avg[b] > avg[a] ? b : a)) : null;
  const days = new Set(sessions.map((s) => dayKey(s.completedAt)));
  let streak = 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setUTCDate(d.getUTCDate() - 1);
  while (days.has(dayKey(d))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  const overall = (s) => KEYS.reduce((a, k) => a + s.signals[k], 0) / KEYS.length;
  return { avg, weak, strongest, streak, overall, hasDemo: sessions.some((s) => s.mode === "demo") };
}
