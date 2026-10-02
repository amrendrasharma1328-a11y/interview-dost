import { describe, it, expect } from "vitest";
import { DemoProvider } from "@/lib/ai/demo";
import { startInterview, submitAnswer } from "@/lib/ai/interviewer";
import { parseResume } from "@/lib/ai/resume-parser";
import { parseJobDescription } from "@/lib/ai/jd-parser";
import { SAMPLE_RESUME, SAMPLE_JD } from "@/lib/demo/sample";
import { applyEvaluation, shiftDifficulty, toPublicState } from "@/lib/interview/state";

const provider = new DemoProvider();
const config = { interviewType: "Technical", experience: "Intermediate", style: "Realistic", lengthMinutes: 5 };
const WEAK = "I used WebSockets because they are fast.";
const STRONG =
  "I designed the chat service and chose WebSockets instead of polling because polling added 800ms latency at 5000 users. The trade-off was sticky sessions, so I added Redis pub/sub to scale horizontally, which cut p95 latency to 120ms and kept memory per connection low across nodes.";

const begin = () =>
  startInterview(provider, { candidate: parseResume(SAMPLE_RESUME), job: parseJobDescription(SAMPLE_JD), config });

describe("interview state transitions", () => {
  it("starts from resume + JD with a resume-aware opening question", async () => {
    const s = await begin();
    expect(s.status).toBe("in_progress");
    expect(s.questionNumber).toBe(1);
    expect(s.totalQuestions).toBe(4);
    expect(s.difficulty).toBe("medium");
    expect(s.currentQuestion.text).toMatch(/CampusCart|resume/i);
  });

  it("shifts difficulty with clamping", () => {
    expect(shiftDifficulty("hard", 1)).toBe("hard");
    expect(shiftDifficulty("easy", -1)).toBe("easy");
    expect(shiftDifficulty("medium", 1)).toBe("hard");
  });

  it("never exposes plan or profile publicly", async () => {
    const pub = toPublicState(await begin());
    expect(pub).not.toHaveProperty("plan");
    expect(pub).not.toHaveProperty("candidateProfile");
  });
});

describe("adaptive behaviour (demo provider)", () => {
  it("weak answer -> targeted follow-up, then strong answer -> harder question", async () => {
    let s = await begin();
    let r = await submitAnswer(provider, s, WEAK);
    expect(r.adaptation.action).toBe("follow_up");
    expect(r.nextQuestion.isFollowUp).toBe(true);
    expect(r.nextQuestion.text).not.toMatch(/tell me more/i);
    expect(r.state.detectedWeakAreas).toContain("trade-off reasoning");

    r = await submitAnswer(provider, r.state, STRONG);
    expect(r.adaptation.changed).toBe("up");
    expect(r.state.difficulty).toBe("hard");
    expect(r.nextQuestion.difficulty).toBe("hard");
  });

  it("allows only one follow-up in a row", async () => {
    let s = await begin();
    let r = await submitAnswer(provider, s, WEAK);
    r = await submitAnswer(provider, r.state, WEAK);
    expect(r.adaptation.action).toBe("next_topic");
    expect(r.nextQuestion.isFollowUp).toBe(false);
  });

  it("runs to completion and returns a report with drills tied to weak areas", async () => {
    let s = await begin();
    let r;
    for (let i = 0; i < s.totalQuestions; i++) {
      r = await submitAnswer(provider, s, i % 2 ? STRONG : WEAK);
      s = r.state;
    }
    expect(s.status).toBe("complete");
    expect(r.report.drills.length).toBeGreaterThan(0);
    expect(r.report.drills.length).toBeLessThanOrEqual(3);
    expect(r.report.disclaimer).toMatch(/not scientific/);
    expect(r.nextQuestion).toBeNull();
    await expect(submitAnswer(provider, s, "x")).rejects.toThrow(/already finished/);
  });

  it("rejects empty answers", async () => {
    await expect(submitAnswer(provider, await begin(), "   ")).rejects.toThrow();
  });

  it("applyEvaluation refuses non-active interviews", async () => {
    const s = { ...(await begin()), status: "complete" };
    expect(() => applyEvaluation(s, "a", { technicalAccuracy: 5, clarity: 5, specificity: 5, completeness: 5, weakAreas: [], strengths: [], feedback: "x", nextAction: "next_topic" })).toThrow();
  });
});
