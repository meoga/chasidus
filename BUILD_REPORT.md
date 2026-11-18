# Chasidus site — multi-page build report

Built 2026-11-18 from `~/workspace/chasidus-site/data/*.json`.
Generator: `~/workspace/chasidus-site/build_site.py` (entry point; the
implementation lives in `build.py` in the same directory, which already
built this layout — the entry point was added so the build has one stable,
re-runnable command). Re-run with `python3 build_site.py` from
`~/workspace/chasidus-site`. The build is idempotent: a second run produces
the same 902 pages.

## File counts (this build)

| What | Count |
|---|---|
| Rebbe pages `rebbe/<id>.html` | 555 |
| Dynasty pages `dynasty/<id>.html` | 65 |
| Town pages `town/<id>.html` | 275 |
| List/home/search pages (`index`, `rebbes`, `dynasties`, `towns`, `timeline`, `sources`, `search`) | 7 |
| **Total HTML files** | **902** |
| Search index entries (`search.json`) | 902 |
| Total HTML size | 6.1 MB |

Data snapshot at build time: 555 Rebbes, 65 dynasties, 265 towns in
`towns.json` + 10 unlocated-town stubs (below), 351 timeline events,
10 sources. Homepage counters read 555 / 65 / 275.

Every Rebbe, dynasty and town now has its own shareable URL, e.g.
`rebbe/besht.html`, `dynasty/karlin.html`, `town/medzhybizh.html` — all
links are relative, so the site works from any folder or host, including
GitHub Pages.

## Link check

A link-check pass over all 902 HTML files examined **16,952 internal
links: 0 broken**. Every Rebbe page links to its teacher, students, town
and dynasty pages; dynasty tree nodes are links to the Rebbe pages;
town pages link to their Rebbes; timeline events link to their Rebbes;
the search index covers all 902 pages.

`assets/site.js` and `assets/search.js` pass `node --check`. The map
JavaScript was also exercised in a Node harness with stubbed Leaflet/DOM:
265 town markers placed, 5 era polygons + 5 Hebrew region labels drawn
for the default 1914 view, era switching to 1750 draws its polygons, and
the era description text is set.

## The map on the multi-page version

The homepage has a working Leaflet map (OpenStreetMap base) with a pin
for each of the 265 located towns; clicking a pin opens the town's page.
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
  all 265 towns: the towns appear as pins with their Hebrew name in the
  popup, and in the town list beside the map. Labelling every town on the
  map would make it unreadable at this zoom.

The historical border lines are generalized/schematic, as the page
itself says, based on Wodziński's Historical Atlas of Hasidism.

## Honest gaps, kept as-is

- **10 towns have a page but no map pin**, because their exact location
  is not verified in the sources: קראסנה, ניישטאט, פלאנטש, ליפטק,
  ניירוב, אלכסנדרובסק, קאראטן, הובגוב, מלובער, and "מקום לא ידוע"
  (7 Rebbes whose place of activity is unknown). Their pages say so
  plainly; no coordinates were invented. The stubs are synthesized by the
  generator at build time (names/notes copied from the single-page
  site's own towns data; "מלובער" is from the Alfasi OCR itself —
  "בשם זקינו רבי משה שמואל מלובער"), not written into `towns.json`, so
  the data pipeline can keep editing that file freely. If a later data
  update supplies real coordinates for one of them, the real entry wins
  automatically.
- **Sassov dynasty**: its founder, R' Moshe Leib of Sassov, still has
  no page, and the dynasty page says so ("אין לו עדיין ערך באתר"); as a
  result that dynasty has no tree diagram, only the member list.
- **Counts vs. the 1,000-page goal**: this build has 895 content pages
  (555 + 65 + 275). The batch-2 extraction is still adding Rebbe
  entries to the same data files; re-running `build_site.py` after it
  lands will pick them up automatically.

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
