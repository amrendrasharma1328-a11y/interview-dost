import { AppError } from "@/lib/utils/validation";
import { sanitizeText, cleanItem, uniq } from "@/lib/utils/sanitize";
import { extractTechnologies } from "@/lib/utils/tech";
import { CandidateProfileSchema } from "./schemas";

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

/** Validate type/size/magic bytes of an uploaded File-like object. Returns a Buffer. */
export async function readPdfUpload(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new AppError("NO_FILE", "No file was uploaded.", "Choose a PDF or paste your resume text.");
  }
  const looksPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!looksPdf) throw new AppError("BAD_TYPE", "Only PDF files are supported.", "Export your resume as PDF or paste the text.");
  if (file.size > MAX_PDF_BYTES) throw new AppError("TOO_LARGE", "That PDF is larger than 5 MB.", "Try a smaller file.", 413);
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== "%PDF") {
    throw new AppError("BAD_TYPE", "That file doesn't look like a valid PDF.", "Try exporting it again.");
  }
  return buf;
}

export async function extractPdfText(buffer) {
  let text = "";
  try {
    const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
    text = (await pdf(buffer)).text || "";
  } catch {
    throw new AppError("PDF_PARSE", "We couldn't read that PDF.", "Try another file, or paste your resume text instead.", 422);
  }
  text = sanitizeText(text);
  if (text.length < 50) {
    throw new AppError("EMPTY_RESUME", "We couldn't find text in this PDF.", "It may be a scanned image. Paste your resume text instead.", 422);
  }
  return text;
}

const SECTION_MAP = [
  ["skills", /^(technical\s+)?skills?$/i],
  ["experience", /^((work|professional)\s+)?experience$|^employment(\s+history)?$/i],
  ["projects", /^((personal|academic)\s+)?projects?$/i],
  ["education", /^education$/i],
  ["achievements", /^(achievements?|awards?|honou?rs|accomplishments?)$/i],
];

function sectionOf(line) {
  const t = line.replace(/[:\-–_]+$/, "").trim();
  if (t.length > 30) return null;
  for (const [key, re] of SECTION_MAP) if (re.test(t)) return key;
  return null;
}

const isBullet = (l) => /^[-•*▪●–]\s*/.test(l);
const cap = (arr, n = 30) => uniq(arr).slice(0, n);

/**
 * Heuristic resume extraction. Deterministic and offline, so it also works in Demo Mode.
 * The user confirms/edits the result in the setup flow before it is used.
 */
export function parseResume(rawText) {
  const text = sanitizeText(rawText);
  if (text.length < 30) throw new AppError("EMPTY_RESUME", "The resume looks empty.", "Paste more of your resume or upload a PDF.", 422);

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const header = [];
  const sec = { skills: [], experience: [], projects: [], education: [], achievements: [] };
  let current = null;
  for (const line of lines) {
    const s = sectionOf(line);
    if (s) { current = s; continue; }
    if (current) sec[current].push(line);
    else header.push(line);
  }

  const nameLine = header.find((l) => /^[A-Za-z][A-Za-z .'-]{1,40}$/.test(l) && l.split(/\s+/).length <= 4);
  const technologies = extractTechnologies(text);

  let skills = sec.skills
    .flatMap((l) => l.replace(/^[^:]{1,30}:/, "").split(/[,|•;]/))
    .map((s) => cleanItem(s, 40));
  skills = cap(skills.filter((s) => s.length > 0));
  if (!skills.length) skills = technologies.slice();

  const roleHeaders = sec.experience.filter((l) => !isBullet(l)).map((l) => cleanItem(l));
  const expBullets = sec.experience.filter(isBullet).map((l) => cleanItem(l));

  return CandidateProfileSchema.parse({
    name: nameLine || "",
    skills,
    technologies: cap(technologies),
    experience: cap(expBullets.length ? expBullets : roleHeaders),
    projects: cap(sec.projects.map((l) => cleanItem(l))),
    education: cap(sec.education.map((l) => cleanItem(l))),
    achievements: cap(sec.achievements.map((l) => cleanItem(l))),
    previousRoles: cap(roleHeaders),
  });
}
