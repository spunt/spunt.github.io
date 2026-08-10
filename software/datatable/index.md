---
layout: single
title: datatable
author_profile: true
toc: true
toc_label: "On this page"
toc_icon: "table"
---

**Turn a DataFrame, query result, or data file into an interactive HTML table — sort it, filter it, label it row by row, and export just the rows you labeled.** Ask your agent to "datatable this" and it opens in your browser. One command, no server, no build step.

## Try it live

The frame below is a real table produced by the skill — a small bug-triage dataset. Sort a column, type in the filter boxes under the headers, tick **Show Notes** to reveal the labeling column, and right-click a header or a cell for the hidden menus. Prefer it full-screen? [Open the demo in its own tab](https://www.bobspunt.com/datatable-skill/demo.html).

<iframe
  src="https://www.bobspunt.com/datatable-skill/demo.html"
  title="datatable — live, interactive demo"
  loading="lazy"
  style="width:100%; height:680px; border:1px solid #d0d7de; border-radius:10px; margin:0.5em 0;">
  Your browser can't show the embedded demo —
  <a href="https://www.bobspunt.com/datatable-skill/demo.html">open it in a new tab</a>.
</iframe>

## Quick links

- [Open the live demo in a new tab](https://www.bobspunt.com/datatable-skill/demo.html) — one HTML file, opens in any browser
- [View the source on GitHub](https://github.com/spunt/datatable-skill)
- Install as a Claude Code plugin: `/plugin marketplace add spunt/datatable-skill` then `/plugin install datatable@datatable`

## The problem it solves

Printing a DataFrame to a terminal gives you a wall of truncated text. Opening it in a spreadsheet means an export, an app switch, and a file you'll forget to delete. Neither lets you do the thing you usually actually want, which is to go through the rows and mark them up.

That last part is the reason this exists. Most of my "let me look at this data" moments are really labeling passes — which of these events is instrumented wrong, which of these bugs is a duplicate, which of these rows belongs in the eval set. So the table carries a per-row **Notes** column, and a second export button that gives you back only the rows you annotated.

## What you get

- **Sort, search, paginate** — numeric columns sort numerically, not lexicographically, and missing values don't corrupt the order
- **Per-column filters** — a plain-text box under each column title; they combine with AND, and with the global search
- **A per-row Notes column** — hidden until you tick "Show Notes", multi-line, resizable, saved to `localStorage` and keyed by the table's title so your labels survive a refresh
- **Two exports** — "Download CSV" respects your current filter; "Download Labeled Only" appears once you've annotated anything and exports exactly those rows
- **Hide columns and filter-by-value** — right-click a header or a cell
- **Layout that persists** — column order, widths, sort, and filters survive a reload; "Reset View" clears them without touching your notes

## How it works

The script reads your file (CSV, TSV, Excel, JSON, Parquet) or takes a DataFrame directly, renders it with `DataFrame.to_html()`, and wraps it in a page wired up to [DataTables](https://datatables.net/) with the annotation column, filters, right-click menus, and export buttons attached. The output is a single HTML file.

It's an agent skill first — `SKILL.md` is plain Markdown, so Claude Code, Codex, or anything else that reads a skills directory can pick it up and you just ask for a table. But it's also a standalone script that needs nothing but Python and pandas:

```bash
python3 scripts/df2datatable.py data.csv -t "My Data"
python3 scripts/df2datatable.py results.parquet --groupby region -o /tmp/
```

Nothing is uploaded anywhere; the page never phones home with your data. It does load DataTables from a CDN, so it's portable but not offline-capable — without a connection you get a plain unstyled table. And because every row is embedded in the file, it's comfortable to about 10,000 rows and slow well past that; aggregate first above that.

## License & source

[MIT](https://github.com/spunt/datatable-skill/blob/main/LICENSE) · full docs, the script, and the test suite live in the [GitHub repository](https://github.com/spunt/datatable-skill).
