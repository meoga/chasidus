# Chasidus site — multi-page build report

Built 2026-11-22 from `~/workspace/chasidus-site/data/*.json` (batch 72
assembly: all four Alfasi volumes, full-text extraction).
Generator: `~/workspace/chasidus-site/build_site.py` (entry point; the
implementation lives in `build.py` in the same directory, which already
built this layout — the entry point was added so the build has one stable,
re-runnable command). Re-run with `python3 build_site.py` from
`~/workspace/chasidus-site`. The build is idempotent: a second run produces
the same 4,470 pages.

## File counts (this build)

| What | Count |
|---|---|
| Rebbe pages `rebbe/<id>.html` | 3,246 |
| Dynasty pages `dynasty/<id>.html` | 126 |
| Town pages `town/<id>.html` | 1,091 |
| List/home/search pages (`index`, `rebbes`, `dynasties`, `towns`, `timeline`, `sources`, `search`) | 7 |
| **Total HTML files** | **4,470** |
| Search index entries (`search.json`) | 4,470 |
| Total site size | ~41 MB |

Data snapshot at build time: 3,246 Rebbes (3,128 with full text, 96.4%),
126 dynasties, 438 towns in `towns.json` + 653 unlocated-town stubs
synthesized by the generator, 988 timeline events, 10 sources. Homepage
counters read 3,246 / 126 / 1,091.

Every Rebbe, dynasty and town now has its own shareable URL, e.g.
`rebbe/besht.html`, `dynasty/karlin.html`, `town/medzhybizh.html` — all
links are relative, so the site works from any folder or host, including
GitHub Pages.

## Link check

A link-check pass over all 4,470 HTML files examined **79,511 internal
links: 0 broken** (verified 2026-11-22 by the coordinator; two apparent
hits in `assets/search.js` and `assets/site.js` are JavaScript string
concatenations that build links at runtime, not real links). Every Rebbe
page links to its teacher, students, town and dynasty pages; dynasty
tree nodes are links to the Rebbe pages; town pages link to their
Rebbes; timeline events link to their Rebbes; the search index covers
all 4,470 pages. Also verified: 0 duplicate Rebbe ids, 0 unresolvable
teacher/student/town/dynasty/timeline references, 0 timeline inversions,
and the full-text section renders on exactly the 3,128 pages that have
full text.

`assets/site.js` and `assets/search.js` pass `node --check`. The map
JavaScript was also exercised in a Node harness with stubbed Leaflet/DOM:
265 town markers placed, 5 era polygons + 5 Hebrew region labels drawn
for the default 1914 view, era switching to 1750 draws its polygons, and
the era description text is set.

## Batch 72 — all entries, full text — 2026-11-22

- **Scope, corrected:** the books' own entry numbering runs 1–4091, but
  entries 2234–2933 do not exist in any volume (vol. 3 ends at 2233,
  vol. 4 starts at 2934). True total: **3,391 numbered entries**
  (vol. 1: 500, vol. 2: 805, vol. 3: 928, vol. 4: 1,158) — not the
  "~1,600" on the title pages. The site now holds 3,246 of them; the
  rest are unrecoverable from the OCR (garbled headings) or have no
  content in any volume. Full detail in
  `data/extraction-batch-3.md`; assembler `data/work/assemble_batch72.py`
  with decision log `data/work/assemble_batch72_log.md`; pre-assembly
  backups in `data/work/backup_batch72/`.
- **Full text:** 3,128 of 3,246 Rebbe pages carry the full original
  Alfasi entry text in a section headed "דער ארטיקל אין תורת
  החסידות", marked as Alfasi's OCR text with an honest note about
  possible reading errors and jumbled line order on two-column pages.
  The 118 without are all pre-existing records whose entry could not be
  matched with confidence — left empty, never stitched from another
  entry.
- **Collisions:** 21 same-id groups across the volume batches were all
  resolved with father/town-qualified ids (42 renames). Two corrections
  to the planned table: vol. 1 `yaakov-yosef-mavarzysatsahvab` became
  `yaakov-yosef-orzystshov` (not `ostroha`, already taken); vol. 4
  `yitzchak` became `yitzchak-ben-yisrael-kalush` (not `kalush`,
  already taken). Vol. 4 `simcha-bobrka` was re-attributed to
  `dov-berish-lvov` — the entry is about Dov Berish; Simcha is only his
  grandson in the last line. No `simcha-bobrka-1770` record was created.
- **Not pushed:** this build is local only; the parent pushes to
  GitHub. The Muse artifact was untouched.

## The map on the multi-page version

The homepage has a working Leaflet map (OpenStreetMap base) with a pin
for each of the 306 located towns; clicking a pin opens the town's page.
On top of that, the four historical eras from the single-page version
**did carry over**: era buttons (1750 ערב החלוקות · 1914 שלוש
האימפריות · 1938 בין המלחמות · היום) draw the region polygons with
thick borders and translucent fills, plus Hebrew region names
(גליציה, ווהלין, פודוליה, תחום המושב…) as labels, and a Hebrew
explanation of what the borders meant for each era. The polygon data was
extracted from the single-page site into `data/eras.json` (18 KB) and is
shipped as `site/assets/eras.json`.

What did **not** carry over:
- The single-page version's modern-borders overlay for the "today" view
  fetched live country geometry from the artifact runtime's map service;
  that service is not available to a plain static site. The "today" view
  therefore shows the OpenStreetMap base (which itself draws today's
  borders) with the town pins and country-name labels, but no extra
  border overlay. The historical eras (1750/1914/1938) are unaffected.
- The static fallback images of the single-page version are gone; the
  Leaflet map is the only map now. It needs network access for the tile
  server and the Leaflet CDN.
- Town-name labels on the map itself still cover the regions only, not
  all 306 towns: the towns appear as pins with their Hebrew name in the
  popup, and in the town list beside the map. Labelling every town on the
  map would make it unreadable at this zoom.

The historical border lines are generalized/schematic, as the page
itself says, based on Wodziński's Historical Atlas of Hasidism.

## Honest gaps, kept as-is

- **653 towns have a page but no map pin**, because their exact location
  is not verified in the sources: the original 22 (קראסנה, ניישטאט,
  פלאנטש, ליפטק, ניירוב, אלכסנדרובסק, קאראטן, הובגוב, מלובער, and
  "מקום לא ידוע", plus 12 from batch 71) plus 631 new unlocated towns
  from batch 72, most of them with town `'unknown'` (543 new records
  have no usable town — no town given in the entry, or a garbled town
  name). Their pages say so plainly; no coordinates were invented. The
  stubs are synthesized by the generator at build time (names/notes
  copied from the single-page site's own towns data; "מלובער" is from
  the Alfasi OCR itself — "בשם זקינו רבי משה שמואל מלובער"), not
  written into `towns.json`, so the data pipeline can keep editing that
  file freely. If a later data update supplies real coordinates for one
  of them, the real entry wins automatically.
- **Sassov dynasty**: its founder, R' Moshe Leib of Sassov, still has
  no page, and the dynasty page says so ("אין לו עדיין ערך באתר"); as a
  result that dynasty has no tree diagram, only the member list.
- **Counts vs. the 1,000-page goal**: this build has **4,463 content
  pages** (3,246 + 126 + 1,091) — the goal is passed many times over.
  Batch 72 covered all four Alfasi volumes; the remaining gap is
  entries unrecoverable from the OCR (see `data/extraction-batch-3.md`).
- **Kaminka split**: the Galician Kaminka line (R. Shalom Rosenfeld,
  Kamionka-Strumiłowa) is a separate dynasty `kaminka-galicia` from
  the Volhynian Kaminka of R. Tzvi Hirsch (`kaminka`); they share only
  the name. Likewise the Romanian Bucecea dynasty `buchach` is
  separate from Galician Buczacz (`butchatch`), and Lviv appears once
  (key `lviv`), not twice — part B's `lvov` was merged into it.

## What was reused, what changed

- Look and structure copied from the single-page version: Hebrew,
  full RTL, David Libre/Heebo fonts, same colours, same page sections
  (facts, biography sections with quotes, teacher, students, "what is
  not known", notes/sources). No redesign.
- The shared stylesheet is `site/assets/style.css` (hand-maintained,
  never overwritten by the build). New classes only: `.era-bar`,
  `.era-label`, `.era-desc`, `.era-note`, `.nopin`, `.tnode a`.
- The generator was already present as `build.py`; this task patched it
  (unlocated-town stubs, null-safe town pages, tree-node links, era map
  layers) and added `build_site.py` as the documented entry point.

## UI modernization — 2026-11-21/22 (presentation only, no content changes)

- `site/assets/style.css` rewritten (277 lines): refined Hebrew type scale
  (David Libre headings / Heebo body, 1.06rem/1.75 body), warmer paper
  background, layered soft shadows, 8–16px radii, card treatment for
  list rows / dynasty cards / town rows / timeline cards, pill search bar,
  segmented era control, sticky blurred header, focus-visible rings,
  44px+ tap targets, mobile nav scrolls horizontally under 640px,
  `overflow-x: clip` safety net. Light/dark (prefers-color-scheme) kept
  and audited — all colours via variables; fixed the too-dark
  `.tnode.root span` in dark mode. No words, slogans or copy added.
- `build.py` (design layer only, 3 small edits): Rebbe pages get a
  `<nav class="relations">` strip (town / dynasty / teacher as labelled
  cards, same links/targets) and the dates line gets class `dates`;
  list pages get a breadcrumbs line. No data logic, entry rendering or
  `render_full_text` touched.
- Rebuilt with `build_site.py`: 1,108 HTML pages (696 Rebbes, 77
  dynasties, 328 towns incl. unlocated stubs). (Superseded by the Batch 72
  build above: 4,470 pages.) Verification: 0 broken
  internal links (all pages scanned); relations nav on 696/696 Rebbe
  pages; 8 sample pages parse clean; CSS braces balanced; site.js /
  search.js pass `node --check`; no fixed widths that could overflow on
  phones. Map and timeline behaviour unchanged, only their chrome
  restyled. No push to GitHub in this pass (parent pushes).
