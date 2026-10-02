import { describe, it, expect } from "vitest";
import { parseResume } from "@/lib/ai/resume-parser";
import { parseJobDescription } from "@/lib/ai/jd-parser";
import { SAMPLE_RESUME, SAMPLE_JD } from "@/lib/demo/sample";

describe("resume extraction", () => {
  const r = parseResume(SAMPLE_RESUME);
  it("finds name, roles and projects", () => {
    expect(r.name).toBe("Alex Morgan");
    expect(r.previousRoles[0]).toMatch(/Nimbus Labs/);
    expect(r.projects.length).toBeGreaterThan(0);
    expect(r.education[0]).toMatch(/Computer Science/);
    expect(r.achievements[0]).toMatch(/hackathon/);
  });
  it("finds technologies without false positives", () => {
    expect(r.technologies).toEqual(expect.arrayContaining(["Node.js", "WebSockets", "Redis", "MongoDB", "React"]));
    expect(r.technologies).not.toContain("Java"); // JavaScript must not match Java
  });
  it("keeps experience bullets for resume-aware questions", () => {
    expect(r.experience.join(" ")).toMatch(/real-time chat application/);
  });
  it("rejects empty resumes", () => {
    expect(() => parseResume("  ")).toThrow(/empty/i);
  });
});

describe("JD extraction", () => {
  const j = parseJobDescription(SAMPLE_JD);
  it("finds role and seniority", () => {
    expect(j.role).toBe("Software Engineer (Full Stack)");
    expect(j.seniority).toBe("Mid");
  });
  it("splits required vs preferred skills", () => {
    expect(j.requiredSkills).toEqual(expect.arrayContaining(["JavaScript", "React", "Node.js", "MongoDB", "AWS"]));
    expect(j.preferredSkills).toEqual(expect.arrayContaining(["Docker", "Kubernetes", "WebSockets"]));
    expect(j.requiredSkills).not.toContain("Docker");
  });
  it("extracts responsibilities and keywords", () => {
    expect(j.responsibilities.length).toBe(3);
    expect(j.keywords).toContain("scalability");
  });
  it("rejects empty JD", () => {
    expect(() => parseJobDescription("")).toThrow(/empty/i);
  });
});
