---
name: study-stats
description: Set up and run a source-grounded study workspace with lessons, question banks, quizzes, SQLite progress, and results-driven follow-up. Use for a new book or subject, or to extend an existing study app; offer local-only or Cloudflare deployment.
---

# Study with saved results

Use this skill as the single entry point for a study project. It combines the teaching workflow from `teach` with the application work previously assigned to `study-builder`. Read [the workspace contract](references/study-workspace.md) and [the app builder guide](references/app-builder.md) when setting up or changing an app. The bundled [local starter](assets/starter/) implements the [reusable Tomi Study pattern](references/tomi-pattern.md) without its content or learner data.

## Start a new study workspace

Resolve the target project and read its `AGENTS.md`, README, and existing learning state first. If the request does not supply the essentials, ask a short, grouped setup interview:

1. What subject or book is this for, and what should the learner be able to do or which exam are they preparing for? When is it needed?
2. Who will study, in which language, and do learners need separate profiles?
3. Which source files or URLs are authoritative? Are there existing questions and an answer key, or should practice questions be written from the material? How should uncertain answers be handled?
4. Should it run only on this computer, or be accessible online? If online, ask whether Cloudflare is the intended host and who may access it. Explain that local SQLite and a Cloudflare database do not synchronize automatically.
5. Which Tomi-style features matter: short lessons, source-linked explanations, topic filters, spaced review, statistics, question ranking, or learner comments? Default to the core quiz and statistics when no preference is given.

Ask only for facts that cannot be inferred from the request or files. If the user wants to start before answering every question, proceed with local single-learner mode and record assumptions in `STUDY.md`. Never invent a source, answer key, learner history, or deployment authorization. A request to create a new study project authorizes local scaffolding and content work; ask before publishing or changing access when that was not already authorized.

Create or update `MISSION.md`, `RESOURCES.md`, `NOTES.md`, `STUDY.md`, `lessons/`, and `reference/` as useful. Use the accompanying format documents for mission, resources, and learning records. Keep unrelated goals and learners separate. Set up one stable bank ID per book or source; do not mix question IDs or grading rules across books.

## Build the app

For a new local project, copy `assets/starter/` into the project, then adapt its title, language, bank data, source links, and `STUDY.md`. The starter contains a Node HTTP server, SQLite attempt and progress storage, a quiz, a statistics page, a read-only report command, and isolated smoke tests. Run it and check the actual study flow before handing it to the learner. Reuse an existing working app when present. Do not copy Tomi's scans, question banks, dates, medical material, or `data/progress.sqlite`.

Read [the bank format](references/question-banks.md) before importing a book. Preserve original files. OCR can draft a transcription, but verify the answer key against the source and mark ambiguity ungradeable. Attach page or URL provenance. Keep source text, verified explanations, and old-book answers distinct. Do not publish a source PDF merely because it is available locally.

For online mode, read [the Cloudflare path](references/cloudflare.md). The local starter cannot be deployed as a static site: its SQLite API must be adapted to a hosted API and durable database, with appropriate learner access. Ask the local-versus-online question during setup even if the user does not mention hosting. Deploy only when requested or already authorized, and check the live result. Document the actual authority for progress in `STUDY.md`.

## Teach from evidence

The mission determines what to teach. Make each lesson a short, self-contained HTML file in `lessons/`, linked to a reliable source and one concrete practice step. Reuse shared styles and components. Keep `reference/` for concise, printable knowledge. Retrieval practice, spacing, and interleaving are useful when they fit the learner and material. Do not alter reproduced book options just to equalize answer lengths.

Before choosing a next lesson, use the project's read-only results command. Compare first attempts with repeats, check sample sizes and changed keys, and read learner comments when collected. Explain which observed errors or feedback motivate the lesson. One correct retry does not prove mastery. Create a learning record only when understanding has been demonstrated. Preserve historical attempts when content or keys change.

This skill runs when asked; it does not schedule ongoing analysis or publication. Return the run command, results command, authoritative progress location, what was verified, and any limits to the learner.
