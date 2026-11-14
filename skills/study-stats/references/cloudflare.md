# Optional Cloudflare deployment

Cloudflare is a setup choice, not a requirement. Ask whether the learner wants local-only use or online access. If Cloudflare is chosen, verify current official Cloudflare documentation for the chosen Workers/Pages, D1, authentication, and deployment approach before implementation.

Adapt the local starter's server API to a Worker or Pages Function and its SQL to D1. Keep the same stable bank/question/attempt IDs and grading semantics. Host only the intended public content. Use a durable D1 database, server-side grading, idempotent writes, and learner-scoped records. Protect both writes and result reads. Do not treat an obscure URL or client-side password as private access.

Decide whether to start with fresh online progress or perform a one-time import. A one-time import is not ongoing synchronization. Preserve the original SQLite file, test representative records and counts, and document the chosen authority and recovery path. If offline study with later sync is requested, design and test explicit conflict handling before claiming support.

After an authorized deployment, verify the returned URL, authentication, one practice save and retry, persistence after refresh, and read-only result retrieval. Keep database credentials and private exports outside the public bundle and Git.
