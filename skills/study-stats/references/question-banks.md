# Question bank format

The starter reads each `banks/*.json` file at startup. Use one file per book or source. Example:

```json
{
  "id": "book-one",
  "title": "Book One",
  "multiSelect": false,
  "questions": [
    {
      "id": "book-one-001",
      "number": 1,
      "topic": "Chapter 1",
      "text": "Example question?",
      "options": {"A": "First", "B": "Second"},
      "correct": ["B"],
      "gradeable": true,
      "source": {"label": "Book One, page 4", "url": "https://example.com/allowed-source"},
      "explanation": "A checked explanation, with a source."
    }
  ]
}
```

Use stable IDs that do not change when ordering changes. Each bank's option letters may vary, but must match the keys in `options`. `multiSelect` is per bank; use separate banks if answer formats differ. Use `gradeable: false` for unresolved keys; keep the source and review note. `source.url` is optional and should point only to material appropriate for the app's audience. Do not put a local private file path in a public bank. `explanation` is optional and should be source checked. The starter hashes each bank's grading key to mark historical grades affected by later corrections.

The starter's strict validator catches duplicate IDs, absent answers, and malformed choices. A valid JSON file is still not evidence that OCR or an answer key is correct. Review the source pages before scoring the learner.
