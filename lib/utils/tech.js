// [canonical name, aliases]. Matching is case-insensitive with token boundaries.
const DICT = [
  ["JavaScript", ["javascript", "ecmascript"]],
  ["TypeScript", ["typescript"]],
  ["React", ["react", "reactjs", "react.js"]],
  ["Next.js", ["next.js", "nextjs"]],
  ["Node.js", ["node.js", "nodejs", "node"]],
  ["Express", ["express", "express.js", "expressjs"]],
  ["MongoDB", ["mongodb", "mongo"]],
  ["PostgreSQL", ["postgresql", "postgres"]],
  ["MySQL", ["mysql"]],
  ["SQLite", ["sqlite"]],
  ["SQL", ["sql"]],
  ["Redis", ["redis"]],
  ["Docker", ["docker"]],
  ["Kubernetes", ["kubernetes", "k8s"]],
  ["AWS", ["aws", "amazon web services"]],
  ["GCP", ["gcp", "google cloud"]],
  ["Azure", ["azure"]],
  ["REST APIs", ["rest apis", "rest api", "restful apis", "restful api", "restful"]],
  ["GraphQL", ["graphql"]],
  ["WebSockets", ["websockets", "websocket", "socket.io"]],
  ["Python", ["python"]],
  ["Java", ["java"]],
  ["C++", ["c++"]],
  ["Git", ["git"]],
  ["Tailwind CSS", ["tailwind css", "tailwindcss", "tailwind"]],
  ["Prisma", ["prisma"]],
  ["FastAPI", ["fastapi"]],
  ["Django", ["django"]],
  ["Flask", ["flask"]],
  ["CI/CD", ["ci/cd", "ci cd"]],
  ["Microservices", ["microservices", "microservice"]],
  ["Jest", ["jest"]],
  ["Kafka", ["kafka"]],
  ["Firebase", ["firebase"]],
  ["Redux", ["redux"]],
  ["HTML", ["html", "html5"]],
  ["CSS", ["css", "css3"]],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const COMPILED = DICT.map(([name, aliases]) => [
  name,
  new RegExp(`(?<![A-Za-z0-9+#.])(?:${aliases.map(esc).join("|")})(?![A-Za-z0-9+#])`, "i"),
]);

/** Returns canonical technology names ordered by first appearance. */
export function extractTechnologies(text) {
  const hits = [];
  for (const [name, re] of COMPILED) {
    const m = re.exec(text);
    if (m) hits.push([m.index, name]);
  }
  return hits.sort((a, b) => a[0] - b[0]).map((h) => h[1]);
}
