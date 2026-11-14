# Start your study workspace

This kit pairs a **teach skill** with a **study-builder agent** for Codex. The skill guides learning; the agent builds the application that records practice and feedback. Codex uses them together within the work you request.

## Start

1. Extract the study ZIP into a new project folder, preserving `.agents/` and `.codex/`. If you cloned the full repository, use `node install-study.mjs --project "../My Study"` instead.
2. Open that project folder in Codex (VS Code extension, CLI, or desktop app) and start a new session. Use a current Codex version with custom agents and skills available.
3. Paste the prompt below, filling in your subject, learner, and language. Provide your source material or exam requirements when relevant.

```text
Use $teach to set up a reusable study workspace for [subject].
The learner is [name or profile] and the study language is [language].
The goal is [what I want to be able to do, or which exam I am preparing for].

Use study-builder for the app, saved test results, learner feedback,
and a results report that you can retrieve here to improve future lessons.
Use [local / online] study mode. Keep different learners' progress separate.
For online mode, use my chosen hosting account and private learner access.
Identify any missing account access or consequential choices before deployment.

Create focused lessons and practice using reliable sources. Save the project
settings and commands so I can return later and continue from the same progress.
```

If you do not know which study mode to choose, ask Codex to explain the options first. Local study can use a local database; online study needs hosted storage and access setup. Cloudflare is one supported implementation option, not an account supplied by this download.

## Continue after studying

Return to the same project and ask:

```text
Use $teach to retrieve my latest test results and learner feedback.
Explain the recurring mistakes and the strength of the evidence.
Prepare the next focused lesson and follow-up practice based on those results.
Preserve the saved progress and publish updates if our project workflow is authorized to do so.
```

The app records attempts and comments. During your requested sessions, Codex reads the results, checks the sources, updates lesson files, and uses the project's publication workflow. It does not keep generating lessons between sessions unless you separately set up that automation.

## What the kit supplies

- `.agents/skills/teach/`: the reusable teaching process, templates, and study workspace contract.
- `.codex/agents/study-builder.toml`: the technical helper for the study app, database, access controls, results reports, and deployment.

The download supplies reusable instructions. Your subject's app and lessons are created during setup; existing learner progress and hosting accounts are not included. Test results help select what to teach but do not by themselves prove understanding.

This installation layout is for local Codex clients. Uploading these files to an ordinary ChatGPT conversation does not register the TOML agent as an installed custom agent. See the official [skills](https://learn.chatgpt.com/docs/build-skills) and [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) guides.
