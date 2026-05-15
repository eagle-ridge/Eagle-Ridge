# Spec: market-map.html marketing rewrite

## Context

The live page at https://eagleridge.io/market-map.html opens with an investor-voice lead written for a market-research peer audience. The page is now serving as marketing content for small DIB contractors searching for CMMC help. The current opening language does not fit that audience. This spec rewrites the lead, moves a metaphor, refreshes metadata, and adds two body CTAs.

## File

`market-map.html` in the eagleridge.io repo. Single file edit unless flagged otherwise.

## Acceptance criteria

When the changes are complete:

1. The opening three paragraphs read as marketing content addressed to a small DIB contractor, not as an investor lead.
2. Em dashes (`—` or `&mdash;`) do not appear anywhere in page body content. Use commas, periods, or rewrites instead. Keep en dashes (`–`) used in pricing ranges.
3. The Mendeleev technetium reference appears inside the Eagle Ridge cell detail card, not in the opening prose.
4. The current paragraph 2 (the layout tour) no longer appears in the opening lead. It either moves below the lead as a small "How to read this map" callout or is cut entirely. See open question 2.
5. The meta description and og:description target search-friendly language a DIB owner might actually type.
6. Two body CTAs appear after the methodology section: one points to related content, one invites email contact.
7. The "Corrections welcome at contact@eagleridge.io" line in the methodology section is preserved unchanged.

## Changes (settled)

### Change 1: Replace the opening three paragraphs

Locate the three opening paragraphs that begin with "The defense industrial base needs about 80,000 small contractors..." and replace with:

> About 80,000 small defense contractors need CMMC Level 2 certification. Roughly one percent have it.
>
> The reason is structural. Only 103 firms in the country are authorized to do the assessment, and by rule none of them can also do the readiness work on the same engagement. The firm that can prepare you cannot test you. The firm that tests you cannot prepare you. Most small contractors land between those two firms, paying both, without a clear path through either.
>
> This map is the whole market in one view. Tap any cell for what the firm or tool does, who it serves, and what it costs.

The repetition "*The firm that can prepare you cannot test you. The firm that tests you cannot prepare you*" is deliberate. Do not smooth it.

### Change 2: Move the Mendeleev technetium reference

Currently in opening paragraph 3:

> Eagle Ridge sits at row 5, column 6 — the position of technetium (Tc, 43). In Mendeleev's original 1869 table that cell was empty: he predicted an element there before anyone had isolated it.

Move this into the Eagle Ridge element's detail card. In the JavaScript data structure, this is the `notes` field for element n:39, name "Eagle Ridge". Replace any existing technetium reference inside that notes field with:

> Position on the table is technetium's: row 5, column 6, atomic number 43. Mendeleev left that cell empty in his 1869 periodic table and predicted an element there before anyone had isolated one. The market gap sits in roughly the same shape.

Place this text at the end of the existing notes field, after the practical positioning information (target customer, frameworks, pricing context). See open question 4 for placement variants.

### Change 3: Update meta description and og:description

Current:

```
Eagle Ridge Advisory's read of the CMMC services market — 89 firms and platforms mapped by category, with the 0→1 readiness gap for DIB SMBs called out.
```

Replace with:

```
Compare 89 CMMC providers, assessors, and tools serving the defense industrial base. Find where your firm fits and what it should cost.
```

Apply to both `<meta name="description">` and `<meta property="og:description">`.

### Change 4: Strip em dashes from body content

Search the file for `—` and `&mdash;`. For each instance in body content (prose paragraphs, notes fields, headings, CTAs), replace using whichever fits:

- Two independent clauses joined by `—`: use a period and start a new sentence.
- Parenthetical insertion: use commas or parentheses.
- List separator: rewrite as a clean list or comma series.

Do not replace `–` (en dash) used in pricing ranges like `$30K–$100K`. Those stay.

Do not edit em dashes that appear inside source citation titles in the Sources list, since those are quoted external source titles.

### Change 5: Add body CTAs

After the closing of the methodology section ("Corrections welcome at contact@eagleridge.io.") and before the Sources section, insert:

```html
<div class="cta">
  <p>If you are trying to work out where your firm fits in this market and want a second pair of eyes on it, write to <a href="mailto:contact@eagleridge.io">contact@eagleridge.io</a>.</p>
  <p>For the longer argument behind this map, read <a href="https://eagleridge.io/nobody-built-the-first-mile.html">Nobody Built the First Mile</a>.</p>
</div>
```

Style `.cta` with vertical padding around 18px, a 1px top and bottom border in the existing body border gray, no background color, and the same prose font as the body paragraphs.

If `nobody-built-the-first-mile.html` is not yet published at that path, leave the link in place and flag the dependency in the commit message rather than removing the CTA.

## Open questions (ask in plan mode before implementing)

1. **H1 keyword.** Currently "The GRC market map." Options:
   - Keep as-is.
   - Change to "The CMMC market map."
   - Change to "The CMMC services market map."
   GRC reads as industry-insider; CMMC is what readers actually search for. Default: keep unless the user picks an alternative.

2. **Layout description.** The current paragraph 2 ("The layout is functional. Left columns hold...") has to leave the opening. Options:
   - Cut entirely. The legend and color encoding do the explaining.
   - Move below the lead as a smaller "How to read this map" callout between the new intro and the periodic table.
   Default: cut entirely.

3. **CTA block placement.** Options:
   - Between the methodology section and the Sources section.
   - After the Sources section, before the footer.
   - Both locations.
   Default: between methodology and Sources.

4. **Mendeleev placement inside the Eagle Ridge notes field.** Options:
   - At the top of the notes field as an opening flourish.
   - At the bottom of the notes field as a closing line.
   - As its own paragraph break in the middle.
   Default: at the bottom, so practical positioning information leads.

## Out of scope

Do not touch: the Sources section content, the rest of the methodology section, the 89-element JavaScript data structure other than the Eagle Ridge `notes` field, the JS event handlers, the color palette and CSS variables, the responsive breakpoints, navigation, footer, favicon, or canonical URL.

## Voice and style constraints

- Economical: every word pulls weight. Cut adjectives and qualifiers that do not change meaning.
- No em dashes anywhere in body content.
- No rhythmic three-part closings (the "X; Y; Z" pattern at the end of paragraphs).
- Preserve deliberate register repetition and assonance. The "*The firm that can prepare you cannot test you. The firm that tests you cannot prepare you*" pattern is intentional.
- Numbered footnote references using `<sup><a href="#sN">N</a></sup>` remain in place. Do not remove existing footnotes.

## Verification after changes

1. Open the page in a browser. The lead reads in roughly 30 seconds. By the end of the second paragraph the reader knows whether the page is for them.
2. Run a text search across the file for `—` and `&mdash;`. No hits in body content.
3. Click the Eagle Ridge cell. The technetium reference appears inside the detail card, not in the opening prose.
4. Scroll past the methodology section. The CTA block appears before the Sources list, with two visible links.
5. View page source meta tags. Both description fields read like a service offer rather than a market-research subtitle.
6. The "Corrections welcome at contact@eagleridge.io" line is still present in the methodology section.
