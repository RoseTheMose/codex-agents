# What the starter carries forward from Tomi Study

Tomi Study established a practical local pattern: source-separated books, reviewed question banks, a Node server bound to localhost, SQLite attempts and derived progress, save retries with stable IDs, key-version checks, topic and review filters, daily and weekly statistics, question ranking, and lessons informed by real results. The `study-stats` starter generalizes those behaviors.

The starter intentionally begins with an empty bank directory. During setup, create a bank for each authorized book or source and verify answer keys against the originals. Use the learner's own language and mission. The original Tomi project remains a reference implementation; its exam dates, Czech labels, medical material, OCR scans, and progress database are not part of this template.

Tomi's local server is not a Cloudflare deployment. For online use, adapt the API and database as described in `cloudflare.md`, preserve IDs and historical grades, and verify the hosted flow.
