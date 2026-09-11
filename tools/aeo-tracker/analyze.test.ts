// Smallest check that fails if the scoring logic breaks. Run: deno test tools/aeo-tracker/
import { analyze } from "./main.ts";

Deno.test("scores retrieved, cited and mentioned independently", () => {
  const r = analyze({
    text: "Eagle Ridge Advisory does readiness. Eagle Ridge Golf Club does not.",
    retrieved: ["https://www.eagleridge.io/cmmc-readiness-checklist", "https://cyberab.org/"],
    cited: ["https://cyberab.org/"],
  });
  if (!r.retrieved || r.cited || !r.mentioned) throw new Error(JSON.stringify(r));
  if (!r.retrieved_domains.includes("eagleridge.io")) throw new Error(JSON.stringify(r));

  const golf = analyze({ text: "Try Eagle Ridge golf course.", retrieved: [], cited: [] });
  if (golf.mentioned) throw new Error("golf course counted as a brand mention");
});
