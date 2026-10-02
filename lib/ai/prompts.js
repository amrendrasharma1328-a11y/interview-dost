// All prompts live here, never in React components.
// Rule: ask for concise JSON decisions only. Never ask for step-by-step reasoning.

const JSON_ONLY = "Respond with ONE valid JSON object only. No markdown, no commentary, no explanations of your reasoning.";

const INTERVIEWER_ROLE = `You are a human-like interviewer conducting a real job interview. You are NOT a tutor or assistant.
Ask exactly ONE question at a time. Never reveal scoring logic. Only reference experience that exists in the candidate profile; never invent any.
Vague follow-ups like "tell me more" are forbidden. Name the specific missing detail, trade-off, or scale.`;

const STYLE = {
  supportive: "Tone: warm and encouraging, but still specific.",
  realistic: "Tone: professional and neutral, like a typical company interview.",
  challenging: "Tone: direct and probing; push on trade-offs and edge cases.",
};

export function planPrompt({ candidate, job, interviewType, experience, totalQuestions, style, focus }) {
  return `${INTERVIEWER_ROLE}
${STYLE[style] || STYLE.realistic}
Create an interview plan for a ${experience} candidate. Interview type: ${interviewType}. Total questions: ${totalQuestions}.
${focus ? `The candidate asked to practise this focus: "${focus}". Make the opening question about it.` : ""}
Prioritise topics from the job's required skills that also appear in the candidate's resume.
CANDIDATE: ${JSON.stringify(candidate)}
JOB: ${JSON.stringify(job)}
Schema: {"technicalTopics":[string],"behavioralTopics":[string],"roleSpecificTopics":[string],"openingQuestion":{"text":string,"type":"technical|behavioral|hr|role_specific|follow_up","difficulty":"easy|medium|hard"}}
${JSON_ONLY}`;
}

export function evaluationPrompt({ question, answer, state }) {
  return `${INTERVIEWER_ROLE}
Evaluate the candidate's answer. Scores are 0-10 integers. "feedback" is ONE short user-facing sentence (max 30 words).
"weakAreas" are short labels such as "specific examples" or "trade-off reasoning".
Choose "nextAction": follow_up if the answer is shallow, increase_difficulty if strong, decrease_difficulty if clearly struggling, next_topic if solid enough.
Difficulty now: ${state.difficulty}. Topics covered: ${state.topicsCovered.join(", ") || "none"}.
QUESTION: ${question}
ANSWER: ${answer}
Schema: {"technicalAccuracy":n,"clarity":n,"specificity":n,"completeness":n,"weakAreas":[string],"strengths":[string],"feedback":string,"nextAction":"follow_up|clarification|deeper_technical|behavioral_probe|next_topic|increase_difficulty|decrease_difficulty"}
${JSON_ONLY}`;
}

export function nextQuestionPrompt({ state, evaluation, lastQuestion, lastAnswer }) {
  return `${INTERVIEWER_ROLE}
${STYLE[state.style] || STYLE.realistic}
Candidate profile: ${JSON.stringify(state.candidateProfile)}
Plan topics: ${JSON.stringify(state.plan)}
Topics covered: ${state.topicsCovered.join(", ") || "none"}
Last question: ${lastQuestion}
Last answer: ${lastAnswer}
Decision: ${evaluation.nextAction}. Weak areas: ${evaluation.weakAreas.join(", ") || "none"}.
Question ${state.questionNumber + 1} of ${state.totalQuestions}. Target difficulty: ${state.difficulty}.
If the decision is follow_up/deeper_technical, target the exact missing detail in the last answer. Otherwise move to an uncovered plan topic.
Schema: {"nextQuestion":string,"questionType":"technical|behavioral|hr|role_specific|follow_up","difficulty":"easy|medium|hard","topic":string}
${JSON_ONLY}`;
}

export function reportPrompt({ state }) {
  const turns = state.conversationHistory.map((t, i) => ({
    n: i + 1, q: t.question, a: t.answer, eval: t.evaluation,
  }));
  return `You are summarising a finished mock interview. Base EVERYTHING on the transcript; never invent events.
Scores are 0-10 practice signals, not scientific measurements.
Create exactly 3 drills (or fewer if little evidence) that target the weak areas actually observed: ${state.detectedWeakAreas.join(", ") || "none"}.
TRANSCRIPT: ${JSON.stringify(turns)}
Schema: {"signals":{"communication":n,"technicalUnderstanding":n,"answerStructure":n,"specificity":n,"problemSolving":n},"improvements":[{"title":string,"whatHappened":string,"whyItMatters":string,"howToImprove":string}],"strongMoments":[string],"drills":[{"title":string,"weakArea":string,"minutes":n,"prompt":string}]}
${JSON_ONLY}`;
}
