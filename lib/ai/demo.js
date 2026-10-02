import { AIProvider } from "./provider";

/**
 * Deterministic Demo provider. NOT live AI; the UI must label it "Demo Mode".
 * Uses simple, transparent heuristics so the adaptive flow is visible:
 *   shallow answer -> targeted follow-up; strong answer -> harder question.
 */

const has = (s, re) => re.test(s.toLowerCase());

export function scoreAnswer(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasNumber = /\d/.test(answer);
  const tradeoff = has(answer, /trade-?off|instead of|compared|alternative|downside|latency|scal/);
  const ownership = has(answer, /\bi (built|designed|chose|implemented|decided|led)\b/);

  let specificity = 3 + (hasNumber ? 2 : 0) + (ownership ? 1 : 0) + (words > 60 ? 1 : 0);
  let technicalAccuracy = 3 + (tradeoff ? 3 : 0) + (words > 40 ? 1 : 0);
  let completeness = Math.min(10, 2 + Math.floor(words / 10));
  let clarity = words < 15 ? 4 : 6 + (ownership ? 1 : 0);
  const clamp = (n) => Math.max(0, Math.min(10, n));
  return {
    technicalAccuracy: clamp(technicalAccuracy),
    clarity: clamp(clarity),
    specificity: clamp(specificity),
    completeness: clamp(completeness),
    words, tradeoff, hasNumber,
  };
}

export class DemoProvider extends AIProvider {
  get name() { return "demo"; }
  get isDemo() { return true; }
  async health() { return { ok: true, model: "demo" }; }

  async generateInterviewPlan({ candidate, job, focus }) {
    const project = candidate.projects?.[0] || "a project from your resume";
    const tech = job.technologies?.[0] || candidate.technologies?.[0] || "your main technology";
    return {
      technicalTopics: [tech, "API design", "scaling"],
      behavioralTopics: ["ownership", "conflict"],
      roleSpecificTopics: job.requiredSkills?.slice(0, 2) || [],
      openingQuestion: {
        text: focus || `Your resume mentions ${project}. Why did you pick ${tech} for it instead of a simpler alternative?`,
        type: "technical",
        difficulty: "medium",
      },
    };
  }

  async evaluateAnswer({ answer }) {
    const s = scoreAnswer(answer);
    const weakAreas = [];
    if (s.specificity < 5) weakAreas.push("specific examples");
    if (!s.tradeoff) weakAreas.push("trade-off reasoning");
    if (s.words < 25) weakAreas.push("answer depth");
    const avg = (s.technicalAccuracy + s.clarity + s.specificity + s.completeness) / 4;
    const nextAction = avg < 5.5 ? "follow_up" : avg >= 6.5 ? "increase_difficulty" : "next_topic";
    const feedback =
      nextAction === "follow_up"
        ? "Your answer stayed general. A concrete decision and its trade-off was missing."
        : nextAction === "increase_difficulty"
          ? "Clear, specific and reasoned. Let's raise the bar."
          : "Solid answer. Let's cover another area.";
    return {
      technicalAccuracy: s.technicalAccuracy, clarity: s.clarity,
      specificity: s.specificity, completeness: s.completeness,
      weakAreas: weakAreas.slice(0, 4),
      strengths: s.tradeoff ? ["explained reasoning"] : [],
      feedback, nextAction,
    };
  }

  async generateNextQuestion({ state, evaluation, lastQuestion }) {
    const topic = state.plan.technicalTopics[state.questionNumber % state.plan.technicalTopics.length];
    if (evaluation.nextAction === "follow_up") {
      return {
        nextQuestion: `You didn't say what trade-off you weighed. What alternative did you reject, and what would break first at 100,000 concurrent users?`,
        questionType: "follow_up", difficulty: state.difficulty, topic,
      };
    }
    if (evaluation.nextAction === "increase_difficulty") {
      return {
        nextQuestion: `Good. Now suppose the ${topic} component must survive a regional outage. How would you redesign it, and what would you give up?`,
        questionType: "technical", difficulty: "hard", topic,
      };
    }
    return {
      nextQuestion: `Tell me about a time a technical decision on ${topic} was challenged by a teammate. What did you do?`,
      questionType: "behavioral", difficulty: state.difficulty, topic,
    };
  }

  async generateReport({ state }) {
    const h = state.conversationHistory;
    const avg = (k) => {
      const v = h.map((t) => t.evaluation?.[k] ?? 0);
      return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : 0;
    };
    const weak = [...new Set(state.detectedWeakAreas)].slice(0, 3);
    const drillBank = {
      "trade-off reasoning": { title: "Explain a technical trade-off", minutes: 5, prompt: "Pick one decision from your project. State the option you rejected and why." },
      "specific examples": { title: "Tell a STAR story with numbers", minutes: 7, prompt: "Describe one situation, your action, and a measurable result." },
      "answer depth": { title: "Defend a design decision", minutes: 10, prompt: "Defend one design choice for 2 minutes, covering scale and failure." },
    };
    const drills = weak.map((w) => ({ weakArea: w, ...(drillBank[w] || { title: `Practice: ${w}`, minutes: 5, prompt: `Give a focused answer that improves ${w}.` }) }));
    if (!drills.length) drills.push({ weakArea: "consistency", title: "Stretch round", minutes: 10, prompt: "Take a harder system design question." });
    return {
      signals: {
        communication: avg("clarity"), technicalUnderstanding: avg("technicalAccuracy"),
        answerStructure: avg("completeness"), specificity: avg("specificity"),
        problemSolving: Math.round(((avg("technicalAccuracy") + avg("completeness")) / 2) * 10) / 10,
      },
      improvements: weak.map((w) => ({
        title: w,
        whatHappened: `Answers in this session showed gaps in ${w}.`,
        whyItMatters: "Interviewers use this to judge real depth beyond buzzwords.",
        howToImprove: drillBank[w]?.prompt || "Add one concrete example per answer.",
      })),
      strongMoments: h.filter((t) => t.evaluation && t.evaluation.specificity >= 7).map((t) => `Strong, specific answer to: "${t.question.slice(0, 70)}"`).slice(0, 3),
      drills: drills.slice(0, 3),
    };
  }
}
