# Codex agents

Reusable custom agents for Codex, shared by [RoseTheMose](https://github.com/RoseTheMose).

| Agent | Use it for |
| --- | --- |
| [skeptic](agents/skeptic.toml) | Stress-test a plan or design before implementation. Returns concrete objections and failure scenarios. |
| [verifier](agents/verifier.toml) | Independently check a completed change using code, tests, and observed behavior. |
| [study-builder](agents/study-builder.toml) | Build or adapt study apps with saved progress, learner feedback, results reports, private access, and local or online hosting. |

The [teach skill](skills/teach/SKILL.md) and its supporting files are included for the study-builder workflow. Teach owns lessons and learning decisions; study-builder handles application engineering and returns results to the parent agent.

## Install into a project

1. Download this repository or clone it with `git clone https://github.com/RoseTheMose/codex-agents.git`.
2. Copy the desired `agents/*.toml` files into your target project's `.codex/agents/` directory. Keep any existing agents you have customized.
3. For `study-builder`, also copy the complete `skills/teach/` folder into that project's `.agents/skills/teach/` directory, preserving its references and templates.
4. Start a new Codex session in the target project and ask for the named agent or invoke `$teach`.

Installed layout for the study workflow:

```text
your-project/
├── .codex/agents/
│   ├── skeptic.toml
│   ├── verifier.toml
│   └── study-builder.toml
└── .agents/skills/teach/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── references/study-workspace.md
    └── ...supporting format documents
```

Codex supports standalone project agents in `.codex/agents/`. Each file declares its name, description, and developer instructions. Agents inherit the parent session's permissions and connected tools. The skeptic's review-only behavior is an instruction; it does not create a separate filesystem sandbox. See the [official subagents guide](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Teach is explicitly invoked; its included `agents/openai.yaml` preserves `allow_implicit_invocation: false`. A hosting account or connector is only needed when the task actually requires that service.

## Example requests

```text
Use skeptic to review this database migration plan before we implement it.

Use verifier to check whether this fix works. Run the relevant tests and report the evidence.

Use $teach to create a study workspace for introductory biology in Czech.
Delegate the app and progress tracking to study-builder. Keep this version local.

Use $teach to review this course's latest test results and prepare the next lesson.
```

For a study app, record the learner, language, mission, local/online mode, authoritative progress store, and commands in `STUDY.md` or an existing equivalent. Different subjects and learners keep distinct progress histories. Lesson updates preserve attempts and grading versions. Cloud hosting and offline synchronization are implemented only when requested.

## What is included

These are portable copies of three custom agents and the teaching dependency. The shared copies remove workspace-specific lookup wording and an ineffective agent-level sandbox setting. They contain no learner results, cloud credentials, personal project files, or local machine configuration.

The agents are instructions for Codex, not a hosted study platform. Configuring them does not itself create a database, publish an app, or start background work.
