# Website update plan — bobspunt.com (spunt.github.io)

Written 2026-10-29. Owner: Bob. Status: proposed; nothing has been changed.

## The ask (decide in one reply)

Approve **Phase 0** (about 1 hour, before the Gates application goes in), and say yes or no to Phases 1–3.
Reply `phase 0 go` to have an agent make the Phase 0 edits on a branch for your review. Nothing is pushed without your word.
Undo for any phase: `git revert` that phase's commit. For DNS, restore the single A record listed below.

## Why now (Explanation)

Recruiters check the site at screening, so it has to agree with the resume. Today it disagrees in places a reader can see, and the bare domain does not load at all.

| Mismatch (measured 2026-10-29) | Where | Effect on a reader |
|---|---|---|
| Lists "Senior Data Scientist, 2022 – Present" | `professional/index.md` | The resume's "Principal (2026–)" looks inflated |
| 2023 *Nature Communications* paper missing from the list, although its PDF is in `papers/pdf/` | `papers/index.md` | The resume cites a paper the site does not show |
| `bobspunt.com` (no `www`) does not load, because its A record is `192.30.252.153`, a retired GitHub IP | DNS at the registrar | Anyone who types the bare domain gets an error |
| Home page ends the story at "exploring the world outside academia"; CV PDF dated Feb 2025 | `index.md`, `professional/` | The site describes you as you were in 2018 |

## Phase 0 — make the site agree with the resume (How-to, about 1 hour, before applying)

1. In `professional/index.md`, replace the Adobe row with two rows: `2026 - Present | Adobe — Principal Data Scientist` and `2022 - 2026 | Adobe — Senior Data Scientist`.
2. In `papers/index.md`, add the Tusche, Spunt et al. (2023) *Nature Communications* entry, linked to `pdf/Tusche_Spunt_etal_2023_NatureComm.pdf`. Also check whether `Yan_Spunt_etal_fMRI_Methods_Paper.pdf` needs a listed entry.
3. At the DNS registrar, replace the apex A record `192.30.252.153` with the four GitHub Pages records `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Keep the `www` CNAME pointing to `spunt.github.io`. Confirm with `dig +short bobspunt.com` and `curl -sI https://bobspunt.com`.
4. Keep `professional/RESUME_BobSpunt.pdf` general, not Gates-tailored, because the site serves every reader. Replace it only when a general Oct 2026 version exists. *(Assumed: you don't want a role-specific resume public.)*
5. Build locally (`bundle exec jekyll serve`) and check the four pages before pushing.

## Phase 1 — tell the current story (about half a day)

1. **Home page (`index.md`).** Keep the academic paragraphs. Add one closing paragraph covering 2017 to the present: measurement at Snap, Oracle and Adobe, and the current focus on evaluating AI systems and making measurement auditable. Link it to the Evaluation page from Phase 2.
2. **Author bio (`_config.yml`, `author.bio`).** The current line ("I use science and technology to understand people like you and me") is warm but says nothing about the current work. Draft: "Research psychologist and data scientist. I measure what interventions and AI tools actually do."
3. **Professional page.** Add a short "Current work" section above the tables (3–4 bullets taken from the resume, with no internal names), and regenerate `CV_BobSpunt.pdf`.

## Phase 2 — show the evaluation work (1–2 days; also closes the "publish something on evals" item in `gaps.md`)

1. Create `/evaluation/`, a page on the pre-specified markup-mode evaluation and the adversarial review of your own design: the protocol, the amendment, and what you would do differently. This is the highest-value addition, because it turns the resume's most unusual claim into something a reader can check.
2. Link it from the nav (`_data/navigation.yml`), the home page and the Software page.
3. Run it past `outward-writing-reviewer` before publishing, because it describes your own findings.

## Phase 3 — keep it current with less effort (ongoing)

1. **New skills are already covered.** The "After publishing" step in your `publishing-skills` skill adds a page and an index entry to this site (`references/publish-to-github.md`). Keep using it. `publishing-skills` itself stays off the site (Bob's decision, 2026-10-29).
2. **Run a quarterly health check** with the installed `audit-website` skill (squirrelscan CLI) for broken links and metadata. *(Not yet run on this site.)*
3. **Render the resume and the site's CV from one source.** The resume now renders with RenderCV (`~/Projects/job-search-2026/gates_foundation/sr-ds-impact-modeling-B021829/render/`). Rendering the site's CV PDF from the same YAML would stop the two from drifting. *(Assumed worthwhile; not yet scoped.)*

## Not in this plan

A redesign or theme change, analytics, and a blog. Each is a separate decision with its own cost.
