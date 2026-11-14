# Study project settings

Fill this in when creating the project. Do not leave unknown facts as established values.

- Subject and goal:
- Learner and language:
- Authoritative sources and bank IDs:
- Study mode: local SQLite (change this if the project is adapted online)
- Authoritative progress store: `data/progress.sqlite`
- Run: `node server.mjs` (Node.js 24.19.0 or newer)
- Read-only report: `node scripts/report.mjs`
- Test: `node --test tests/*.test.mjs` with an isolated `STUDY_DATA_DIR`
- Bank update: restart the server; historical grades are retained and changed grading is flagged
- Deployment URL and database ID, if deployed:
- Access policy, if deployed:
