# Study workspace contract

Use one workspace per learning mission. Keep subject, learner, language, source paths, study mode, run commands, and the authoritative results store in `STUDY.md`. Keep source originals unchanged and derived question banks separate. Do not copy another learner's history when reusing the application.

`MISSION.md` states the reason for learning. `RESOURCES.md` lists trusted sources. `NOTES.md` holds preferences and open questions. `lessons/` contains short HTML lessons; `reference/` contains concise review material; `learning-records/` holds only demonstrated learning. Shared styles and quiz components belong in `assets/`.

The app must retain stable bank, question, and attempt IDs, the original grading result and answer-key version, a timestamp, and enough source provenance to audit a disputed answer. Attempts and derived progress must update atomically. Historical grades stay intact after a correction; affected attempts are flagged for review. Save failures must be visible and retryable. Private learner data and source files are not public assets by default.

The results reader should be repeatable and read-only. Its report distinguishes first attempts from repeats, shows sample counts and unanswered coverage, and lists key changes and learner comments. Weak evidence calls for a targeted check, not a strong claim about mastery or misconception.

Local mode uses the project's SQLite file. Online mode needs a hosted API, durable store, and learner access controls. A cloud copy does not synchronize with the local file unless that feature is deliberately built and tested. Preserve the local file during any migration.
