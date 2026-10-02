export const LENGTHS = [5, 10, 20];
export const nearestLength = (m) => LENGTHS.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));

export function setupHref(p = {}) {
  const q = new URLSearchParams();
  if (p.interviewType) q.set("type", p.interviewType);
  if (p.experience) q.set("exp", p.experience);
  if (p.style) q.set("style", p.style);
  if (p.lengthMinutes) q.set("len", String(p.lengthMinutes));
  if (p.focus) q.set("focus", p.focus);
  const s = q.toString();
  return `/practice/setup${s ? `?${s}` : ""}`;
}

export const WARMUP = {
  title: "The confidence warm-up",
  description: "A focused session to turn nervous energy into clear, steady answers.",
  difficulty: "Beginner",
  minutes: 5,
  preset: { interviewType: "hr", experience: "beginner", style: "supportive", lengthMinutes: 5, focus: "Tell me about yourself and what brought you to this role." },
};

export const CATEGORIES = ["Communication", "Behavioral", "Technical", "Role-specific"];

export const PRACTICE_CARDS = [
  { id: "story", title: "Tell your story", description: "Structure a memorable answer about your background.", difficulty: "Beginner", minutes: 10, category: "Communication", icon: "chat",
    preset: { interviewType: "hr", experience: "beginner", style: "supportive", lengthMinutes: 10, focus: "Walk me through your background in two minutes." } },
  { id: "clarity", title: "Speak with clarity", description: "Lead with the point and keep answers tight.", difficulty: "Beginner", minutes: 5, category: "Communication", icon: "mic",
    preset: { interviewType: "hr", experience: "beginner", style: "supportive", lengthMinutes: 5, focus: "Explain what you do to someone outside your field." } },
  { id: "behavioral", title: "Behavioral basics", description: "Use the STAR method naturally.", difficulty: "Intermediate", minutes: 10, category: "Behavioral", icon: "briefcase",
    preset: { interviewType: "behavioral", experience: "intermediate", style: "realistic", lengthMinutes: 10, focus: "Tell me about a time you disagreed with a teammate. What happened?" } },
  { id: "feet", title: "Think on your feet", description: "Practise unexpected, open-ended questions.", difficulty: "Intermediate", minutes: 10, category: "Behavioral", icon: "bulb",
    preset: { interviewType: "mixed", experience: "intermediate", style: "challenging", lengthMinutes: 10, focus: "Your deadline just moved up by a week. What do you do first?" } },
  { id: "technical", title: "Technical deep dive", description: "Defend decisions from your own projects, with trade-offs.", difficulty: "Advanced", minutes: 20, category: "Technical", icon: "code",
    preset: { interviewType: "technical", experience: "advanced", style: "challenging", lengthMinutes: 20 } },
  { id: "presence", title: "Executive presence", description: "Sound confident without sounding rehearsed.", difficulty: "Advanced", minutes: 10, category: "Role-specific", icon: "briefcase",
    preset: { interviewType: "hr", experience: "advanced", style: "challenging", lengthMinutes: 10, focus: "Why should we hire you over other candidates?" } },
  { id: "questions", title: "Ask better questions", description: "Close the interview with impact.", difficulty: "Beginner", minutes: 5, category: "Role-specific", icon: "help",
    preset: { interviewType: "hr", experience: "beginner", style: "supportive", lengthMinutes: 5, focus: "What questions would you ask us at the end of this interview, and why?" } },
];

const L = (interviewType, experience, lengthMinutes = 5) => ({ interviewType, experience, style: "realistic", lengthMinutes });

export const LIBRARY = [
  { category: "Communication", items: [
    { title: "Tell me about yourself", text: "Tell me about yourself.", preset: L("hr", "beginner") },
    { title: "Why should we hire you?", text: "Why should we hire you?", preset: L("hr", "intermediate") },
  ] },
  { category: "Behavioral", items: [
    { title: "Conflict at work", text: "Tell me about a conflict at work and how you handled it.", preset: L("behavioral", "intermediate") },
    { title: "Leadership", text: "Describe a time you led others without formal authority.", preset: L("behavioral", "intermediate") },
    { title: "Problem solving", text: "Walk me through a hard problem you solved and how you approached it.", preset: L("behavioral", "intermediate") },
  ] },
  { category: "Technical", items: [
    { title: "Explain a project", text: "Pick a project from your resume and explain how it works end to end.", preset: L("technical", "beginner", 10) },
    { title: "Technical trade-offs", text: "Describe a technical decision where you had to choose between two options. What did you give up?", preset: L("technical", "intermediate", 10) },
    { title: "System design fundamentals", text: "How would you design a simple service that must handle 10x more traffic next month?", preset: L("technical", "advanced", 10) },
  ] },
  { category: "Role-specific", items: [
    { title: "Why this role?", text: "Why do you want this role, and what would you do in your first 90 days?", preset: L("hr", "intermediate") },
  ] },
];
