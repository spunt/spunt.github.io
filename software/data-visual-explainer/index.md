---
layout: single
title: data-visual-explainer
author_profile: true
toc: true
toc_label: "On this page"
toc_icon: "chart-bar"
---

**Explain one number so non-specialists read it correctly and specialists can reproduce it.** Point your AI agent at an analysis — a readout, the SQL or notebook behind it, a results table — and it traces the headline number to the code that produced it, records every place where the write-up and the code disagree, and hands back a **Metric Card**: one source file rendered as an interactive explainer, a one-page label, and a methods section.

## Try it live

The frame below is a real card the skill wrote, unedited, during a blind evaluation: a synthetic A/B test whose readout claimed a causal effect "for all new users." Step through the depth tabs, hover or tab to the underlined terms, and try the questions under **Check yourself**. Prefer it full-screen? [Open the card in its own tab](https://www.bobspunt.com/data-visual-explainer/site/home-v2-active-days.html), or [browse all four example cards](https://www.bobspunt.com/data-visual-explainer/site/).

<iframe
  src="https://www.bobspunt.com/data-visual-explainer/site/home-v2-active-days.html"
  title="data-visual-explainer — a live Metric Card for an A/B test"
  loading="lazy"
  style="width:100%; height:720px; border:1px solid #d0d7de; border-radius:10px; margin:0.5em 0;">
  Your browser can't show the embedded card —
  <a href="https://www.bobspunt.com/data-visual-explainer/site/home-v2-active-days.html">open it in a new tab</a>.
</iframe>

## Quick links

- [Browse the four example cards](https://www.bobspunt.com/data-visual-explainer/site/) — each one HTML file that works offline
- [View the source on GitHub](https://github.com/spunt/data-visual-explainer)
- Install for GitHub Copilot CLI: `git clone https://github.com/spunt/data-visual-explainer ~/.copilot/skills/data-visual-explainer` (use `~/.claude/skills/` for Claude Code or `~/.codex/skills/` for Codex), then `python3 -m pip install pyyaml jinja2 jsonschema`
- Install as a Claude Code plugin: `/plugin marketplace add spunt/data-visual-explainer` then `/plugin install data-visual-explainer@data-visual-explainer`

## The problem it solves

A number leaves an analysis as a sentence, and the sentence is what people repeat. "Home v2 causes users to be active 0.21 more days a month, for all new users" sounds like a finding. But the code behind it kept only users who saw the new screen and had at least one active day, dropped a country, and counted days in UTC rather than local time. None of that was in the write-up, and none of it survives a slide.

Data dictionaries and model cards describe a metric as documented. A Metric Card describes it as implemented: the agent reads the code, records each place where the description and the code disagree, and writes the plain-language layer last, so the friendly words cannot drift from the real rule.

## What you get

Each card explains one number at four depths, and a reader stops when they have what they need:

- **The gist** — what it means, how big, how sure, and the one caveat — for everyone, in about a minute
- **How it's built** — one worked example, then each rule with a live figure
- **Keep in mind** — caveats with the direction of their bias, likely misreadings ("say this, not that"), and judgment calls
- **Reproduce it** — the exact rules, the code, the documentation-vs-code gaps, and receipts that recompute the headline

From one YAML source, the bundled `mcard` tool renders an interactive explainer (one HTML file, works offline, keyboard accessible), a printable one-page "Metric Facts" label, and a Markdown methods section to paste into a report or wiki. A linter checks the arithmetic, the references, the reading level, and unexplained jargon before anything is rendered.

## How it works

It's an agent skill first — `SKILL.md` is plain Markdown, so GitHub Copilot CLI, Claude Code, Codex, or anything else that reads a skills directory can pick it up. You ask in plain words ("what does the 4.1% click rate in ./analysis actually measure?") and the agent does the rest: it pins the number, traces it to code, hunts for mismatches in both directions, writes the fine print, then the plain layers, then lints and renders. You never fill in YAML.

It also works without an agent:

```bash
bin/mcard new my-metric --dir cards   # start from the template
bin/mcard lint cards/my-metric.yaml   # fails until every TODO is replaced
bin/mcard build cards -o site         # explorer, label, methods, index
```

## How well it works

The evidence is small, and the repository says exactly how small. In a blind evaluation on two synthetic analyses with planted documentation-vs-code gaps, the current version invented no numbers, got every headline right, and found every planted gap; a strong model without the skill found nearly as many. The difference showed up in what a skimming reader takes away: simulated readers (AI personas, not people) who read only the first layer answered 6 of 6 key questions correctly, against 3.5 of 6 without the skill. Tests with real readers come next; the protocol ships with the repository.

## License & source

[Apache 2.0](https://github.com/spunt/data-visual-explainer/blob/main/LICENSE) · the skill, the `mcard` tool, four example cards, the frozen evaluation, and the test suite live in the [GitHub repository](https://github.com/spunt/data-visual-explainer).
