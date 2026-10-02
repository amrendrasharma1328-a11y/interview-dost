import { describe, it, expect } from "vitest";
import { parseModelJson, EvaluationSchema } from "@/lib/ai/schemas";
import { DemoProvider, scoreAnswer } from "@/lib/ai/demo";

describe("Zod AI response validation", () => {
  it("parses fenced JSON", () => {
    const raw = '```json\n{"technicalAccuracy":7,"clarity":6,"specificity":4,"completeness":5,"weakAreas":["specific examples"],"feedback":"ok","nextAction":"follow_up"}\n```';
    expect(parseModelJson(raw, EvaluationSchema).nextAction).toBe("follow_up");
  });
  it("rejects out-of-range scores", () => {
    const raw = '{"technicalAccuracy":99,"clarity":6,"specificity":4,"completeness":5,"feedback":"x","nextAction":"follow_up"}';
    expect(() => parseModelJson(raw, EvaluationSchema)).toThrow();
  });
  it("rejects malformed JSON", () => {
    expect(() => parseModelJson("not json", EvaluationSchema)).toThrow();
  });
});

describe("Demo provider adaptivity", () => {
  const p = new DemoProvider();
  it("weak answer -> follow_up", async () => {
    const e = await p.evaluateAnswer({ answer: "I used WebSockets because they are fast." });
    expect(e.nextAction).toBe("follow_up");
  });
  it("strong answer -> increase_difficulty", async () => {
    const a = "I designed the chat service and chose WebSockets instead of polling because polling added 800ms latency at 5000 users. The trade-off was sticky sessions, so I added Redis pub/sub to scale horizontally, which cut p95 latency to 120ms and kept memory per connection low across nodes.";
    expect(scoreAnswer(a).tradeoff).toBe(true);
    const e = await p.evaluateAnswer({ answer: a });
    expect(e.nextAction).toBe("increase_difficulty");
  });
});
