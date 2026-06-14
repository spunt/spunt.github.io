---
layout: single
title: Markup Mode
author_profile: true
toc: true
toc_label: "On this page"
toc_icon: "file-text"
---

**A frontend-only review layer for the reports, pages, and drafts your agents build.** Your agent applies it to its own output in one command. You mark the exact word or element that's off, and your notes compile into a tagged-Markdown handback you pass back. You make the judgment calls; what's automated is applying the layer and compiling the handback. It closes the agent→human→agent loop, no build step required.

## Try it live

The frame below **is** Markup Mode, running live. Arm it, drag-select a sentence or click an element, leave a note, and hit **Compile** to see the Markdown handback it produces. Prefer it full-screen? [Open the demo in its own tab](https://www.bobspunt.com/markup-mode/assets/templates/markup-mode.html).

<iframe
  src="https://www.bobspunt.com/markup-mode/assets/templates/markup-mode.html"
  title="Markup Mode — live, interactive demo"
  loading="lazy"
  style="width:100%; height:680px; border:1px solid #d0d7de; border-radius:10px; margin:0.5em 0;">
  Your browser can't show the embedded demo —
  <a href="https://www.bobspunt.com/markup-mode/assets/templates/markup-mode.html">open it in a new tab</a>.
</iframe>

## Quick links

- [Open the live demo in a new tab](https://www.bobspunt.com/markup-mode/assets/templates/markup-mode.html) — one HTML file, opens in any browser
- [View the source on GitHub](https://github.com/spunt/markup-mode)
- Install as a Claude Code plugin: `/plugin marketplace add spunt/markup-mode` then `/plugin install markup-mode@markup-mode`

## The problem it solves

I review a lot of what my agents build — a generated report, a draft landing page — and the bottleneck was never *spotting* what's off. I could see it instantly ("this number needs a source," "that axis starts at 50, not zero"). The hard part was telling the agent *which* word or *which* element I meant. A screenshot hands it a picture, not text it can locate. "Fix the third chart" makes it guess. So I'd describe a spot in prose while the agent hunted for it — busywork an agent is supposed to spare you.

## How the loop works

1. **The agent applies the layer.** One command (`scripts/apply.sh`) splices a self-contained review layer into a *copy* of the artifact the agent just produced. Your original is never changed.
2. **You review where it renders.** Drag-select a phrase or click an element and type a note. The part that stays human is the judgment — *you* decide what's wrong and why.
3. **It compiles to a handback the agent can act on.** Each note becomes tagged Markdown carrying a readable "Where" trail, the exact quote, and a locator (the quote plus a little surrounding text, matched on the words). You hand that back to the agent, which edits the spots that resolve uniquely and flags anything ambiguous instead of guessing.

No backend, no build step, no dependencies — it's a single block of HTML/CSS/JS. It works on rendered HTML and Markdown artifacts; it declines client-rendered SPA shells, since there's no server-rendered text to anchor to.

## What you hand back

Compile turns every note into a Markdown block built to be acted on — the quote first (so a human or a model can find the spot by its words), with the selector as a positional hint only:

```markdown
# Feedback — Quarterly Report (review)
Source: reports/q2.html · 2 notes · 2026-06-04

## Note 1 · text
Where: Main › §"Results" › p "Conversion rose 18% in Q2…"
Quote: "rose 18%"
Comment:
> Source for this figure? It contradicts the dashboard.

## Note 2 · element
Where: Main › §"Results" › div.chart
Comment:
> Axis starts at 50, not 0, so it overstates the trend.
```

It also works when there's no agent in the loop at all — add the layer by hand and review your own pages the same way. The agent loop is what it's built for, but reviewing your own work is a first-class use too.

## License & source

[MIT](https://github.com/spunt/markup-mode/blob/main/LICENSE) · full docs, the applier, and the test suite live in the [GitHub repository](https://github.com/spunt/markup-mode).
