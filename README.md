# Study workflows for Codex

## Study Stats: one reusable skill

**[Download study-stats.zip](https://github.com/RoseTheMose/codex-agents/raw/refs/heads/main/downloads/study-stats.zip)** and extract it into a new study project, preserving `.agents/`. Open the project in Codex and follow [START-STUDY-STATS.md](START-STUDY-STATS.md). This skill combines the teaching workflow and app builder instructions in one package; it does not require a separate custom agent.

Alternatively, clone this repository and install the skill into a project:

```powershell
node install-study-stats.mjs --project "../My New Study"
```

Invoke `$study-stats`. It asks about the goal, learner, language, source material and answer-key status, then asks whether the app should stay local or be deployed to Cloudflare. The bundle includes a clean Node/SQLite starter based on Tomi Study's quiz, review, statistics, and saved-results pattern. It contains no Tomi questions, scans, or learner data. For Cloudflare, the skill guides adaptation to a hosted API, D1, and private access; the local starter is not directly deployable as static HTML.

The original `teach` plus `study-builder` kit remains available below for projects that prefer a separate teaching skill and engineering agent. Both downloads are for Codex projects, not ordinary ChatGPT chat uploads.

## Original teach + study-builder kit

A reusable study kit that combines **teach** and **study-builder**, shared by [RoseTheMose](https://github.com/RoseTheMose).

| Component | What it does |
| --- | --- |
| [teach skill](skills/teach/SKILL.md) | Guides learning, creates lessons and practice, and adapts future lessons from test results and learner feedback. |
| [study-builder agent](agents/study-builder.toml) | Builds the study app, saved progress, database, learner access, results reports, and deployment. |

Start with teach. It delegates technical work to study-builder when needed and then continues the teaching workflow. The same pair supports different subjects, languages, learners, and local or online study.

## Download the study kit

**[Download study-workflow.zip](https://github.com/RoseTheMose/codex-agents/raw/refs/heads/main/downloads/study-workflow.zip)**

Extract it into a new study project folder, preserving the included `.agents/` and `.codex/` directories. Open that folder in Codex, start a new session, and follow **[START-STUDY.md](START-STUDY.md)**. The ZIP contains both required parts and all their references.

Alternatively, clone this repository and install the study workflow into a chosen project:

```powershell
git clone https://github.com/RoseTheMose/codex-agents.git
cd codex-agents
node install-study.mjs --project "../My Study"
```

The installer requires Node.js 18 or newer. It checks all destinations before writing, preserves identical existing files, and stops if any destination differs. Use `--dry-run` to preview the installation. The installer adds only the study pair and the start guide; the review agents below are optional.

Installed layout:

```text
your-study-project/
├── START-STUDY.md
├── .codex/agents/study-builder.toml
└── .agents/skills/teach/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── references/study-workspace.md
    └── ...supporting format documents
```

## What happens after installation

Tell Codex your subject, learner, language, goal, source materials, and preferred study mode. Use the full setup prompt in [START-STUDY.md](START-STUDY.md).

During setup, teach plans the learning and study-builder implements the application when requested. A local app can save to a local database; an online app needs your own hosting account and private learner access. The project records its actual configuration and commands in `STUDY.md` or an existing equivalent.

After practice, return to the same project and ask:

```text
Use $teach to retrieve my latest test results and learner feedback.
Identify recurring mistakes and prepare the next lesson and follow-up practice.
Preserve my saved progress and follow the project's authorized publication workflow.
```

Codex retrieves the recorded evidence, updates local lesson files, and publishes when authorized. Different learners and courses retain separate progress. Corrected answer keys preserve and flag affected historical results. Background lesson generation and offline synchronization require their own implementation.

**This is a reusable setup workflow, not a prebuilt course or hosted study service.** The download includes no learner data, hosting account, database credentials, or subject-specific materials.

## Skill versus agent

A skill supplies reusable instructions and resources for how Codex should carry out a workflow. A custom agent is a specialist Codex can delegate a task to. This kit uses both together: teach is the learning workflow; study-builder is its application specialist.

This file layout is for Codex in the VS Code extension, CLI, or desktop app. Uploading the ZIP to an ordinary ChatGPT chat does not install its custom TOML agent. See the official [skills guide](https://learn.chatgpt.com/docs/build-skills) and [subagents guide](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Teach is explicitly invoked as `$teach`; the included configuration preserves `allow_implicit_invocation: false`. Agents inherit the parent session's permissions and connected tools.

## Optional review agents

The full repository also includes:

- [skeptic](agents/skeptic.toml): stress-tests a plan before implementation.
- [verifier](agents/verifier.toml): independently checks whether a completed change actually works.

Copy either file into the target project's `.codex/agents/` directory when wanted. The skeptic's review-only behavior is an instruction, not a separate filesystem sandbox.

## Validate the installer

```text
node --test tests/install-study.test.mjs
```

These tests check installation, repeat runs, conflict handling, and dry runs. They do not verify a generated study app or a live cloud integration.

To rebuild the study-only ZIP on Windows, run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-study.ps1`. The execution policy setting applies only to that packaging process. Its output uses the installed project layout, including the required dot directories.
