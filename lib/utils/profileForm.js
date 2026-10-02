// Editable text <-> structured arrays. Keeps raw text while typing so newlines/commas aren't eaten.
export const CANDIDATE_FIELDS = [
  { key: "name", label: "Name", single: true },
  { key: "skills", label: "Skills", sep: "," },
  { key: "technologies", label: "Technologies", sep: "," },
  { key: "previousRoles", label: "Previous roles", sep: "\n", wide: true },
  { key: "experience", label: "Experience", sep: "\n", wide: true, rows: 5 },
  { key: "projects", label: "Projects", sep: "\n", wide: true },
  { key: "education", label: "Education", sep: "\n", wide: true },
  { key: "achievements", label: "Achievements", sep: "\n", wide: true },
];

export const JOB_FIELDS = [
  { key: "role", label: "Role", single: true },
  { key: "seniority", label: "Seniority", single: true },
  { key: "requiredSkills", label: "Required skills", sep: "," },
  { key: "preferredSkills", label: "Preferred skills", sep: "," },
  { key: "technologies", label: "Technologies", sep: "," },
  { key: "keywords", label: "Important keywords", sep: "," },
  { key: "responsibilities", label: "Responsibilities", sep: "\n", wide: true, rows: 4 },
];

export function toForm(profile, fields) {
  const out = {};
  for (const f of fields) out[f.key] = f.single ? profile[f.key] || "" : (profile[f.key] || []).join(f.sep === "," ? ", " : "\n");
  return out;
}

export function fromForm(form, fields) {
  const out = {};
  for (const f of fields) {
    const v = form[f.key] || "";
    out[f.key] = f.single ? v.trim() : v.split(f.sep === "," ? /[,\n]/ : "\n").map((x) => x.trim()).filter(Boolean);
  }
  return out;
}
