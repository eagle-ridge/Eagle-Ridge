// AEO visibility tracker for eagleridge.io.
//
// Runs daily as a Val.town scheduled val (miqcie/aeo-tracker). For each buyer
// prompt it asks an AI answer engine with web search on, then records three
// independent signals to PostHog as one `ai_search_visibility` event per
// (engine, prompt):
//   retrieved  – eagleridge.io appeared in the engine's search results
//   cited      – the answer text linked eagleridge.io as a source
//   mentioned  – the answer text named the brand (link or not)
// Retrieval moves with indexing and content; mention moves with training data
// and third-party coverage. Tracking them apart tells you which lever to pull.
//
// Env vars (set in the Val.town UI): ANTHROPIC_API_KEY (required),
// OPENAI_API_KEY (optional, adds the ChatGPT engine), POSTHOG_HOST (optional).
// The PostHog project token below is the public phc_ key already shipped in
// the site's HTML, so it is safe in code.
// Source of truth: github.com/eagle-ridge/Eagle-Ridge tools/aeo-tracker/main.ts

const BRAND = {
  domain: "eagleridge.io",
  // ponytail: "eagle ridge" alone matches golf courses and subdivisions;
  // require the full name or the domain.
  names: ["eagle ridge advisory", "eagleridge"],
};

// Three-circle framing (PostHog AEO guide): battleground = ICP wants it, we
// do it, competitors do it; differentiation = ours to win; vulnerability =
// competitors win, track to learn; table_stakes = baseline only.
const QUERIES: { q: string; circle: string }[] = [
  { q: "Who should a small defense subcontractor hire to get ready for CMMC Level 2?", circle: "battleground" },
  { q: "CMMC Level 2 readiness consultant for a 30-person defense contractor", circle: "battleground" },
  { q: "How much does CMMC Level 2 readiness cost for a small contractor?", circle: "battleground" },
  { q: "Best CMMC consultants for small businesses", circle: "battleground" },
  { q: "What is the difference between a CMMC gap assessment and a readiness assessment?", circle: "battleground" },
  { q: "Who can write our CMMC system security plan and policies for a small contractor?", circle: "differentiation" },
  { q: "Do we need a readiness partner before hiring a C3PAO for CMMC?", circle: "differentiation" },
  { q: "How do I get my SPRS score to 88 before a CMMC assessment?", circle: "differentiation" },
  { q: "Best CMMC compliance software for small businesses", circle: "vulnerability" },
  { q: "What is CMMC Level 2?", circle: "table_stakes" },
];

const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST") ?? "https://us.i.posthog.com";
const POSTHOG_KEY = Deno.env.get("POSTHOG_API_KEY") ?? "phc_gKgLr0iMjD1gnLV3yd8lEYWIUWmkIk8BuI6jUG3rTBg";

type Answer = { text: string; retrieved: string[]; cited: string[] };

async function askClaude(q: string): Promise<Answer> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
      messages: [{ role: "user", content: q }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("anthropic refusal");
  const text: string[] = [], retrieved: string[] = [], cited: string[] = [];
  for (const b of data.content) {
    if (b.type === "text") {
      text.push(b.text);
      for (const c of b.citations ?? []) if (c.url) cited.push(c.url);
    }
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const r of b.content) if (r.url) retrieved.push(r.url);
    }
  }
  return { text: text.join(""), retrieved, cited };
}

async function askOpenAI(q: string): Promise<Answer> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-5-mini", tools: [{ type: "web_search" }], input: q }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text: string[] = [], cited: string[] = [];
  for (const o of data.output ?? []) {
    if (o.type !== "message") continue;
    for (const c of o.content ?? []) {
      text.push(c.text ?? "");
      for (const a of c.annotations ?? []) if (a.type === "url_citation") cited.push(a.url);
    }
  }
  // The Responses API does not expose the raw search results, so retrieved = cited here.
  return { text: text.join(""), retrieved: cited, cited };
}

const ENGINES: Record<string, (q: string) => Promise<Answer>> = {
  claude: askClaude,
  ...(Deno.env.get("OPENAI_API_KEY") ? { chatgpt: askOpenAI } : {}),
};

export function analyze(a: Answer) {
  const lower = a.text.toLowerCase();
  const hasDomain = (u: string) => u.toLowerCase().includes(BRAND.domain);
  return {
    retrieved: a.retrieved.some(hasDomain),
    cited: a.cited.some(hasDomain),
    mentioned: BRAND.names.some((n) => lower.includes(n)),
    retrieved_domains: [...new Set(a.retrieved.map((u) => new URL(u).hostname.replace(/^www\./, "")))],
  };
}

export default async function (_interval?: unknown) {
  const runId = crypto.randomUUID();
  const jobs = Object.entries(ENGINES).flatMap(([engine, ask]) =>
    QUERIES.map(async ({ q, circle }) => {
      const props: Record<string, unknown> = { engine, query: q, circle, run_id: runId, $process_person_profile: false };
      try {
        const a = await ask(q);
        Object.assign(props, analyze(a), { raw_response: a.text.slice(0, 8000) });
      } catch (e) {
        // Keep the gap visible in PostHog rather than only in Val.town logs.
        Object.assign(props, { error: String(e), retrieved: null, cited: null, mentioned: null });
        console.error(engine, q, e);
      }
      return { event: "ai_search_visibility", distinct_id: "aeo-tracker", properties: props };
    })
  );
  const batch = await Promise.all(jobs);

  const res = await fetch(`${POSTHOG_HOST}/batch/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ api_key: POSTHOG_KEY, batch }),
  });
  if (!res.ok) throw new Error(`posthog ${res.status}: ${await res.text()}`);

  const ok = batch.filter((b) => !b.properties.error);
  console.log(
    `run ${runId}: ${batch.length} events, ${ok.length} ok;`,
    `retrieved ${ok.filter((b) => b.properties.retrieved).length},`,
    `cited ${ok.filter((b) => b.properties.cited).length},`,
    `mentioned ${ok.filter((b) => b.properties.mentioned).length}`,
  );
}
