import { AppError } from "@/lib/utils/validation";
import { sanitizeText, cleanItem, uniq } from "@/lib/utils/sanitize";
import { extractTechnologies } from "@/lib/utils/tech";
import { JobProfileSchema } from "./schemas";

const HEADINGS = [
  ["preferred", /^(preferred|nice[- ]to[- ]have|bonus|good to have|a plus|pluses)/i],
  ["required", /^(requirements?|required( skills| qualifications)?|qualifications|must[- ]have|what we('| a)re looking for|what you('ll)? bring)/i],
  ["responsibilities", /^(responsibilit(y|ies)|what you('| wi)ll do|key duties|your impact)/i],
];
const DOMAIN = ["scalability", "performance", "security", "testing", "agile", "code review", "system design", "microservices", "real-time", "authentication", "monitoring"];
const TITLE = /(engineer|developer|designer|analyst|manager|intern|scientist|architect|consultant)/i;

function headingOf(line) {
  const t = line.replace(/[:\-–]+$/, "").trim();
  if (t.length > 45) return null;
  for (const [k, re] of HEADINGS) if (re.test(t)) return k;
  return null;
}

function seniorityOf(role, text) {
  const hay = `${role}`;
  if (/\bintern(ship)?\b/i.test(hay)) return "Intern";
  if (/\b(senior|sr\.?|staff|principal)\b/i.test(hay)) return "Senior";
  if (/\blead\b/i.test(hay)) return "Lead";
  if (/\b(junior|jr\.?|entry|graduate|fresher)\b/i.test(hay + " " + text.slice(0, 400))) return "Junior";
  const y = /(\d+)\s*\+?\s*years?/i.exec(text);
  if (y) {
    const n = Number(y[1]);
    return n <= 1 ? "Junior" : n <= 4 ? "Mid" : "Senior";
  }
  return "";
}

export function parseJobDescription(rawText) {
  const text = sanitizeText(rawText);
  if (text.length < 30) throw new AppError("EMPTY_JD", "The job description looks empty.", "Paste the full job description.", 422);

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sec = { required: [], preferred: [], responsibilities: [] };
  let current = null;
  for (const line of lines) {
    const h = headingOf(line);
    if (h) { current = h; continue; }
    if (current) sec[current].push(line);
  }

  let role = "";
  for (const l of lines) {
    const m = /^(role|position|job title|title)\s*[:\-]\s*(.+)$/i.exec(l);
    if (m) { role = m[2]; break; }
  }
  if (!role) role = lines.find((l) => l.length <= 80 && TITLE.test(l)) || lines[0];
  role = cleanItem(role, 80);

  const technologies = extractTechnologies(text);
  const requiredText = sec.required.join("\n");
  const preferredText = sec.preferred.join("\n");
  const required = requiredText ? extractTechnologies(requiredText) : technologies;
  const preferred = extractTechnologies(preferredText).filter((t) => !required.includes(t));
  const lower = text.toLowerCase();
  const domain = DOMAIN.filter((d) => lower.includes(d));

  return JobProfileSchema.parse({
    role,
    seniority: seniorityOf(role, text),
    responsibilities: uniq(sec.responsibilities.map((l) => cleanItem(l))).slice(0, 15),
    requiredSkills: required,
    preferredSkills: preferred,
    technologies,
    keywords: uniq([...technologies, ...domain]).slice(0, 25),
  });
}
