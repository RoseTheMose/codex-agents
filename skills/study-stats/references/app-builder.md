# Application builder instructions

This is the technical part of `study-stats`, included in the skill so a separate custom agent is not required.

Read the target project's instructions and `STUDY.md`. Establish its existing runtime, data model, frontend/API boundary, and authoritative progress store. Reuse a working app. For a new local project, adapt the bundled starter rather than copying Tomi's study content.

Record in `STUDY.md`: project and bank IDs, learner and language, source locations, local or online mode, authoritative progress store, run/test/report commands, content version policy, and deployment details if any. A local SQLite file and a remote D1 database are separate stores unless a synchronization feature is explicitly implemented.

For assessable attempts retain stable attempt, bank, and question IDs; topic; selected response; original grade and gradeability; UTC time; and key version. Keep save retries idempotent and attempt/progress writes atomic. Validate and grade on the server. Surface save failures and allow retry with the same attempt ID. Scope shared online data by learner. Keep answer-key changes visible without rewriting historical grades.

Provide an authenticated, read-only results path for online apps and a read-only report command for local apps. A report should identify learner/store/time, sample counts, first versus repeat performance, weak topics, unanswered coverage, learner comments if collected, and changed-key records. Report missing evidence honestly. Use an isolated test database; never test against the learner's live progress.

For a book import, preserve originals and derive banks with stable IDs. Check OCR against page images, especially option text and key markers. If a key is ambiguous, set `gradeable: false` and explain why. Add source page/URL references and only verified explanations. Multiple-choice and multiple-correct formats must be represented explicitly.

For deployment, follow `cloudflare.md` when Cloudflare is chosen. A static upload of the local starter loses the SQLite API. Do not publish raw databases, private reports, source collections, or credentials. Check browser practice, refresh persistence, reporting, and history retention after any migration. Return actual URLs and commands only after verification.
