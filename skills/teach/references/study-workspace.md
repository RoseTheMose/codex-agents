# Reusable study workspace contract

Read this when building a study app, adapting it for local or online study, or using recorded results to revise lessons. Apply it to the selected subject workspace, preserving existing project conventions. It defines the handoff between `teach` and `study-builder`, not a mandate to rebuild an existing course.

## Ownership and project settings

`teach` owns the learning mission, trusted sources, lessons, reference sheets, assessment meaning, and learning records. `study-builder` owns the application, storage, access controls, report tooling, and deployment. The parent coordinates both and assigns non-overlapping files when they work concurrently.

For a new app or an authorized migration, document the following in the project's `STUDY.md`; extend an existing equivalent rather than duplicating it:

- Workspace identity, subject or course, learner identities or profiles, language, goal, and source paths. Keep unrelated goals in separate workspaces. Reuse software and conventions across subjects without copying another learner's history or assuming another course's language, exam, or books apply.
- Study mode: local, online, or deliberately implemented offline synchronization. Record the actual supported behavior and the single authoritative progress store. A cloud deployment and a local SQLite file do not synchronize automatically.
- Existing app/content paths and commands to run, check, retrieve results, and publish. For online apps, record exact returned project/database identifiers and the public URL, but no credentials.
- The results/report locations and supported version identifiers. Create directories only when needed; keep private snapshots outside publicly served assets and exclude them from Git and deploy packages.

Choose the simplest runtime that meets the user's requested behavior. Reuse a working app. Cloudflare Workers or Pages Functions with D1 is an option for an online study app; check current primary documentation before adapting or deploying it. Plain HTML practice can remain sufficient when persistent online progress was not requested.

## Evidence retained by the app

Adapt the existing schema, preserving its identifiers and history. Scope records by workspace/course and learner; also retain book or bank identity where question IDs overlap. A single-user app can enforce one fixed authenticated learner, but a shared deployment must not merge different learners' progress.

For assessable attempts retain a stable attempt ID, question ID, topic or objective, selected response, original grading result, whether it was gradeable, UTC timestamp, and the bank/key version. Track question and lesson revisions when needed to interpret changed wording or explanations. Historical records must remain interpretable after content updates; add version metadata going forward rather than inventing missing historical values.

Retries of a save must be idempotent. Commit an attempt and its derived progress together. Validate and grade submitted responses on the server for online apps. Show saving failures and offer retry rather than presenting unsaved progress as stored.

When learner feedback is requested, retain the referenced lesson/question ID and version, timestamp, and the learner's comment or confusion flag. Answer choices alone do not establish the reason for an error. Do not claim to measure time spent or understanding unless the application actually collected suitable evidence.

## Results to lessons

Provide a repeatable authenticated, read-only way to retrieve results into the local workspace. Prefer an existing reader/API; a D1 query or export is suitable for a Cloudflare app. Development tests use an isolated data store, never the learner's live database.

A useful dated report records its workspace/learner, source store, fetch time, covered period, content versions, and gaps. Include sample counts, first-attempt versus repeat performance, weak topics, recurring wrong choices, unanswered coverage, changes over time, learner comments, and records affected by changed answer keys. Avoid false improvement from repeatedly answering the same question or combining incomparable books and learners. A small sample warrants a targeted check rather than a confident diagnosis.

`teach` uses that evidence to explain the next learning objective, verify the underlying subject matter, create a focused lesson, and assess transfer or later retention. Learning records require evidence of understanding; they are not automatic activity logs. Technical failures and uncertain source answers must not be treated as learning deficits.

Publishing content updates must preserve the live progress database. Database migrations require deliberate versioned changes with a recovery path. Importing old local results is a separate, tested step; ongoing bidirectional/offline synchronization is a separate feature with an explicit conflict policy.

## Handoff

Give the builder: exact workspace, outcome, learner/language, required mode, existing runtime and data authority, authorized remote actions, and owned files. It returns changed files, run/report/deploy commands, verified behavior, exact deployed identifiers/URL if applicable, and remaining limitations.

The parent then resumes teaching. A request to design or discuss does not authorize provisioning, uploads, or publication. During an authorized implementation, complete safe local work and use existing session authorization for the next steps. Missing credentials or a required audience decision should be reported precisely. Do not interpret silence as consent or set up recurring work implicitly.
