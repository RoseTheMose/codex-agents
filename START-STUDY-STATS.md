# Start a study project with saved results

Install the single `study-stats` skill, open your new study project in Codex, and start a new session. The skill first asks for the subject, learner, language, authoritative materials, answer-key status, and local or online use. It then builds the study app and lessons within that project's scope.

Use this prompt:

```text
Use $study-stats to create a study workspace for my subject or book.
Ask me the setup questions, then build the lessons, verified question bank,
quiz, saved progress, and statistics. Offer local-only use or Cloudflare
deployment. Keep the source originals and my progress safe.
```

For an existing course, tell Codex where its files and saved results are. The bundled local starter uses Node.js 24.19.0 or newer and SQLite. Cloudflare is optional and requires adapting the API and database; uploading the local HTML alone does not provide online progress. Deployment requires your hosting access and authorization.

After studying, return to the same project and ask:

```text
Use $study-stats to read my latest results and comments, explain what the
evidence shows, and make the next short lesson and targeted practice.
```

The skill includes no books, answer keys, learner history, credentials, or hosting account. It runs when requested and does not analyze results in the background.
