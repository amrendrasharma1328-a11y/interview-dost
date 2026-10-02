const MAX_CHARS = 20000;

/** Normalise untrusted text (PDF/paste) before it reaches parsers or prompts. */
export function sanitizeText(input, max = MAX_CHARS) {
  return String(input ?? "")
    .replace(/\0/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function cleanItem(s, max = 300) {
  return sanitizeText(s, max).replace(/^[-•*▪●–]\s*/, "").trim();
}

export function uniq(arr) {
  const seen = new Set();
  return arr.filter((x) => {
    const k = x.toLowerCase();
    if (!x || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
